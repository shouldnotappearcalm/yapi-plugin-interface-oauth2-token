import interfaceOauth from './component/interfaceOauth2/interfaceOauth2.js'

function hander(routers) {
  routers.interfaceOauth = {
    name: '接口自动鉴权',
    component: interfaceOauth
  };
}

module.exports = function() {
  this.bindHook('sub_setting_nav', hander);
};
