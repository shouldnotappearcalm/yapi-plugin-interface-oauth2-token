const yapi = require('yapi.js');
const baseController = require('controllers/base.js');
const oauthModel = require('../model/oauthModel.js');
const syncTokenUtils = require('../utils/syncTokenUtil.js');
const url = require('url');
const http = require('http');

class interfaceOauth2Controller extends baseController {
  constructor(ctx) {
    super(ctx);
    this.oauthModel = yapi.getInst(oauthModel);
    this.syncTokenUtils = yapi.getInst(syncTokenUtils);
  }


  /**
   * 保存获取token的相关信息
   * @interface /oauth_interface/save
   * @method POST
   * @returns {Object}
   * @example
   */
  async saveOauthInfo(ctx) {
    try {
      let oauthData = ctx.request.body;
      if (!oauthData.project_id) {
        return (ctx.body = yapi.commons.resReturn(null, 408, '缺少项目Id'));
      }
      if (!oauthData.env_id) {
        return (ctx.body = yapi.commons.resReturn(null, 408, '缺少环境Id'));
      }

      let existOauthData = await this.oauthModel.getByProjectIdAndEnvId(oauthData.project_id, oauthData.env_id);
      let result;
      if (existOauthData) {
        result = await this.oauthModel.upById(existOauthData._id, oauthData);
      } else {
        result = await this.oauthModel.save(oauthData);
      }

      //操作定时任务
      if (oauthData.is_oauth_open) {
        this.syncTokenUtils.addSyncJob(oauthData);
      } else {
        this.syncTokenUtils.deleteSyncJob(oauthData);
      }

      return (ctx.body = yapi.commons.resReturn(result));
    } catch (e) {
      return (ctx.body = yapi.commons.resReturn(null, 402, e.message));
    }
  }

  /**
   * 获取定时获取token的配置信息
   * @param {*} ctx 请求上下文
   * @method GET
   * @returns {Object}
   * @example
   */
  async getOauthInfo(ctx) {
    let projectId = ctx.query.project_id;
    let envId = ctx.query.env_id;
    if (!projectId) {
      return (ctx.body = yapi.commons.resReturn(null, 408, '缺少项目Id'));
    }
    if (!envId) {
      return (ctx.body = yapi.commons.resReturn(null, 408, '缺少环境Id'));
    }

    let result = await this.oauthModel.getByProjectIdAndEnvId(projectId, envId);
    return (ctx.body = yapi.commons.resReturn(result));
  }

  /**
   * 获取一个项目的所有token任务
   * @param {*} ctx 请求上下文
   * @method GET
   * @returns {Object}
   * @example
   */
  async getAllOauthByProjectId(ctx) {
    let projectId = ctx.query.project_id;
    if (!projectId) {
      return (ctx.body = yapi.commons.resReturn(null, 408, '缺少项目Id'));
    }

    let projectAllOauth = await this.oauthModel.getByProjectId(projectId);
    return (ctx.body = yapi.commons.resReturn(projectAllOauth));
  }

  /**
   * 校验获取token的url是否正确
   * @param {*} ctx 请求上下文
   */
  async validateTokenUrl(ctx) {
    let getTokenUrl = ctx.request.body.get_token_url;
    getTokenUrl = getTokenUrl.trim().replace("{time}", new Date().getTime());
    
    try {
      let ops = url.parse(getTokenUrl);
      let result = await this.createWebAPIPostRequest(ops);

      ctx.body = yapi.commons.resReturn(result);
    } catch (e) {
      ctx.body = yapi.commons.resReturn(null, 402, "token路径错误");
    }
  }

  /**
   * 创建一个post请求
   * @param {*} ops 请求参数
   */
  async createWebAPIPostRequest(ops) {
    return new Promise(function(resolve, reject) {
      let req = '';
      let http_client = http.request(
        {
          host: ops.hostname,
          port: ops.port,
          path: ops.path,
          method: 'POST',
          json: true,
          headers: {
              "content-type": "application/json"
          },
          body: JSON.stringify({})
        },
        function(res) {
          res.on('error', function(err) {
            reject(err);
          });
          res.setEncoding('utf8');
          if (res.statusCode != 200) {
            reject({message: 'statusCode != 200'});
          } else {
            res.on('data', function(chunk) {
              req += chunk;
            });
            res.on('end', function() {
              resolve(req);
            });
          }
        }
      );
      http_client.on('error', (e) => {
        reject({message: `request error: ${e.message}`});
      });
      http_client.end();
    });
  }

}


module.exports = interfaceOauth2Controller;