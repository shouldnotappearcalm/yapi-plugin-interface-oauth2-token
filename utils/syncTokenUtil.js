const schedule = require('node-schedule');
const projectModel = require('models/project.js');
const oauthModel = require('../model/oauthModel.js');
const yapi = require('yapi.js');
const jobMap = new Map();

class syncTokenUtils {
  constructor(ctx) {
    yapi.commons.log(
      '-------------------------------------tokenSyncUtils constructor-----------------------------------------------'
    );
    this.ctx = ctx;
    this.oauthModel = yapi.getInst(oauthModel);
    this.projectModel = yapi.getInst(projectModel);
    this.init();
  }

  //初始化token获取定时任务
  async init() {
    let allSyncJob = await this.oauthModel.listAll();
    for (let i = 0, len = allSyncJob.length; i < len; i++) {
      let syncItem = allSyncJob[i];
      if (syncItem.is_oauth_open) {
        this.addSyncJob(syncItem);
      }
    }
  }

  async addSyncJob(oauthData) {
    let cornExpression = '0 0 */{hour} * * *';
    cornExpression = cornExpression.replace(
      '{hour}',
      oauthData.token_valid_hour
    );
    //立即执行一次
    this.refreshOauthToken(oauthData);
    let scheduleItem = schedule.scheduleJob(cornExpression, async () => {
      this.refreshOauthToken(oauthData);
    });

    //判断是否已经存在这个任务
    let uniqueId = this.getUniqueId(oauthData.project_id, oauthData.env_id);
    let jobItem = jobMap.get(uniqueId);
    if (jobItem) {
      jobItem.cancel();
    }
    jobMap.set(uniqueId, scheduleItem);
  }

  getSyncJob(oauthData) {
    let uniqueId = this.getUniqueId(oauthData.project_id, oauthData.env_id);
    return jobMap.get(uniqueId);
  }

  deleteSyncJob(oauthData) {
    let uniqueId = this.getUniqueId(oauthData.project_id, oauthData.env_id);
    let jobItem = jobMap.get(uniqueId);
    if (jobItem) {
      jobItem.cancel();
    }
  }

  /**
   * 刷新oauth的token值
   * @param {*} oauthData
   */
  async refreshOauthToken(oauthData) {
    yapi.commons.log(
      'token更新定时器触发, getTokenUrl:' + oauthData.get_token_url
    );
    //对定时任务存在的必要性做判断
    let projectData;
    try {
      projectData = await this.preRefresh(oauthData);
    } catch (e) {
      return;
    }

    let projectId = projectData._id;
    let getTokenUrl = oauthData.get_token_url;
    let method = oauthData.request_type;
    let result;
    try {
      if (method === 'GET') {
        let params = oauthData.params;
        result = await this.execGetToken(getTokenUrl, method, params);
      } else {
        let dataType = oauthData.dataType;
        let formData =
          dataType === 'data_json' ? oauthData.data_json : oauthData.form_data;
        result = await this.execGetToken(
          getTokenUrl,
          method,
          formData,
          dataType
        );
      }
      //将字符串转成数组
      let tokenPath = oauthData.token_path.replace('[', '.');
      tokenPath = tokenPath.replace(']', '');
      let tokenPathList = tokenPath.split('.');
      let token = result;
      let accessToken = '';
      if (tokenPathList[0] === 'body') {
        tokenPathList[0] = 'data';
        tokenPathList.forEach(item => {
          token = token[item];
        });
        accessToken = token;
      } else if (tokenPathList[0] === 'header') {
        tokenPathList[0] = 'headers';
        tokenPathList.forEach(item => {
          token = token[item];
        });
        token.forEach((item, index) => {
          if (index === token.length - 1) {
            accessToken += item.split(';')[0];
          } else {
            accessToken += item.split(';')[0] + '; ';
          }
        });
      }
      //更新到对应的env上;
      await this.updateProjectToken(accessToken, oauthData, projectData);
      this.saveSyncLog(0, '更新token成功', '1', projectId);
      yapi.commons.log('更新token成功');
    } catch (e) {
      this.saveSyncLog(-1, '数据格式出错，请检查', '1', projectId);
      yapi.commons.log('获取数据失败' + e.message);
    }
  }

  /**
   * 更新获取到的token到数据库中
   * @param {*} accessToken
   * @param {*} oauthData
   * @param {*} projectData
   */
  async updateProjectToken(accessToken, oauthData, projectData) {
    for (let i = 0; i < projectData.env.length; i++) {
      if (projectData.env[i]._id == oauthData.env_id) {
        let newItem = {
          name: oauthData.token_header,
          value: accessToken
        };

        //更新或者插入这个header
        let updateFlag = false;
        for (
          let j = 0, len = projectData.env[i]['header'].length;
          j < len;
          j++
        ) {
          if (projectData.env[i]['header'][j]['name'] == newItem.name) {
            updateFlag = true;
            projectData.env[i]['header'][j]['value'] = newItem.value;
            break;
          }
        }

        if (!updateFlag) {
          projectData.env[i]['header'].push(newItem);
        }
        await this.projectModel.up(projectData._id, projectData);
        break;
      }
    }
  }

  /**
   * 记录同步日志
   * @param {*} errcode
   * @param {*} syncMode
   * @param {*} moremsg
   * @param {*} uid
   * @param {*} projectId
   */
  saveSyncLog(errcode, moremsg, uid, projectId) {
    yapi.commons.saveLog({
      content:
        '自动获取token状态:' +
        (errcode == 0 ? '成功' : '失败') +
        ',更多信息:' +
        moremsg,
      type: 'project',
      uid: uid,
      username: '自动同步用户',
      typeid: projectId
    });
  }

  /**
   * 刷新token之前 进行一些必要的判断
   * @param {*} oauthData 更新任务
   */
  async preRefresh(oauthData) {
    let projectId = oauthData.project_id;
    let projectData;
    //判断项目是否还存在
    try {
      projectData = await this.projectModel.get(projectId);
    } catch (e) {
      yapi.commons.log('获取项目:' + projectId + '失败');
      await this.deleteSyncJobAndRemoveData(oauthData);
      throw new Error(`获取项目失败`);
    }

    //如果项目已经删除
    if (!projectData) {
      yapi.commons.log('项目:' + projectId + '不存在');
      await this.deleteSyncJobAndRemoveData(oauthData);
      throw new Error(`项目已经不存在`);
    }

    //如果环境变量已经删除
    let envArray = projectData.env;
    for (let i = 0; i < envArray.length; i++) {
      if (envArray[i]._id == oauthData.env_id) {
        return projectData;
      }
    }

    yapi.commons.log(
      '项目:' + projectId + ',环境变量：' + oauthData.env_name + '已经不存在'
    );
    await this.deleteSyncJobAndRemoveData(oauthData);
    return projectData;
  }

  /**
   * 删除定时任务并且移除数据库的定时记录
   * @param {} oauthData
   */
  async deleteSyncJobAndRemoveData(oauthData) {
    this.deleteSyncJob(oauthData);
    //删除数据库定时任务
    await this.oauthModel.delByProjectIdAndEnvId(
      oauthData.project_id,
      oauthData.env_id
    );
  }

  /**
   * 请求获取token值的接口
   * @param {*} getTokenUrl 获取token的路径
   */
  async execGetToken(getTokenUrl, type, data, dataType) {
    getTokenUrl = getTokenUrl.trim().replace('{time}', new Date().getTime());
    const axios = require('axios');
    try {
      let response;
      let formData = {};
      data.forEach(item => {
        if (item.keyName !== '') {
          formData[item.keyName] = item.value
            .trim()
            .replace('{time}', new Date().getTime());
        }
      });
      if (type === 'GET') {
        response = await axios.get(getTokenUrl, {
          params: formData
        });
      } else {
        if (dataType === 'data_json') {
          const instance = axios.create({
            headers: { 'Content-Type': 'application/json' }
          });
          response = await instance.post(getTokenUrl, formData);
        } else {
          response = await axios.post(getTokenUrl, formData);
        }
      }
      if (response.status > 400) {
        throw new Error(
          `http status "${response.status}"` +
            '获取数据失败，请确认 getTokenUrl 是否正确'
        );
      }
      return response;
    } catch (e) {
      let response = e.response;
      throw new Error(
        `http status "${response.status}"` +
          '获取数据失败，请确认 getTokenUrl 是否正确'
      );
    }
  }

  getUniqueId(projectId, envId) {
    return projectId + '-' + envId;
  }
}

module.exports = syncTokenUtils;
