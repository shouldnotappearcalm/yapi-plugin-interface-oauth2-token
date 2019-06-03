const yapi = require('yapi.js');
const controller = require('./controller/controller.js');
const syncTokenUtils = require('./utils/syncTokenUtil.js');

module.exports = function () {
  yapi.getInst(syncTokenUtils);

  //保存获取token的任务
  this.bindHook('add_router', function (addRouter) {
    addRouter({
      controller: controller,
      method: 'post',
      path: 'oauthInterface/save',
      action: 'saveOauthInfo'
    });

    //根绝projectId和envId查询获取token的任务
    addRouter({
      controller: controller,
      method: 'get',
      path: 'oauthInterface/get',
      action: 'getOauthInfo'
    });

    //根据projectId查询所有的token任务
    addRouter({
      controller: controller,
      method: 'get',
      path: 'oauthInterface/project/all',
      action: 'getAllOauthByProjectId'
    });

    //校验get_token_url
    addRouter({
      controller: controller,
      method: 'post',
      path: 'oauthInterface/url/valid',
      action: 'validateTokenUrl'
    });
  });

};