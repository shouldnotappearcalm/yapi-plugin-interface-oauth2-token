const yapi = require('yapi.js');
const baseController = require('controllers/base.js');
const oauthModel = require('../model/oauthModel.js');
const syncTokenUtils = require('../utils/syncTokenUtil.js')

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

      let existOauthData  = await this.oauthModel.getByProjectIdAndEnvId(oauthData.project_id, oauthData.env_id);
      let result;
      console.log("exist:" + existOauthData)
      if (existOauthData) {
        result = await this.oauthModel.upById(existOauthData._id ,oauthData);
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
      ctx.body = yapi.commons.resReturn(null, 402, e.message);
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

}

module.exports = interfaceOauth2Controller;
