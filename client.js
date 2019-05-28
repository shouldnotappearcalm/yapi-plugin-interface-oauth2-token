import interfaceOauth from './component/interfaceOuath2.js'

function hander(routers) {
  routers.interfaceOauth = {
    name: '接口鉴权',
    component: interfaceOauth
  };
}

module.exports = function() {
  this.bindHook('sub_setting_nav', hander);
};
