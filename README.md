# yapi-plugin-interface-oauth2-token

> 这是一个为了解决yapi管理的项目接口需要做鉴权操作的插件,觉得可以给 star 的欢迎 star 一下，你的 star 是我前进的动力之一。

## 主要解决问题

针对大多数项目来说，特别是现在的前后端分离的项目，接口通常也需要鉴权，这个插件目的就是为了解决自动获取鉴权token附加在请求上的功能。

## 特性

- 简单易用
- 支持自动定时给所有接口加上一个特定的 `Header` 属性

## 简单使用

### 安装插件

> 要使用安装插件的yapi，需要先安装 `yapi-cli`

```shell
npm install yapi-cli -g

yapi plugin --name yapi-plugin-interface-oauth2-token
```

### 升级插件

修改 `package.json` 中的 `yapi-plugin-interface-oauth2-token` 的版本号为 `1.0.0`

### 配置使用

进入项目设置页面，可以看到接口自动鉴权的Tab页

![image](https://user-images.githubusercontent.com/20592210/70865694-45395a80-1f9b-11ea-8e84-ec1f6ed5bc81.png)

根据不同的环境配置不同的获取token的方式

- 环境名称： 对应环境配置的列表
- 获取token的地址： 获取 token 的地址，可以是 `GET` 请求或者是 `POST` 请求
- token有效小时： 我会以定时任务的方式重新获取token
- 请求头字段： 将获取到的结果放入这个环境的哪个Header字段，比如我这里选择了 `Authorization`，将会把获取道德token保存到这个属性里
- 获取路径： 比如你要获取请求体里面的内容，就是 `data.xxx`，记得以 data 开头获取请求体内容，如果是获取 `header` 的内容请使用 `header.yyy`，可以使用 `+` 作为连接符

---

关于token请求地址的结果获取：

目前我考虑到的场景如下，我会把 token_type 和 access_token 合并起来，所以我会写获取路径是 `data.token_type +  " " + data.access_token`,

```json
{
    "access_token": "27c72286-a4d7-42bc-adef-80980c234494",
    "token_type": "bearer",
    "refresh_token": "565399c9-a3f3-4594-8460-3194d952b708",
    "expires_in": 28799,
    "scope": "webapp"
}
```

结果如图：

![2019-06-04_13-53.png](https://i.loli.net/2019/06/04/5cf6077ea6db826842.png)

## 重启服务
不论你使用什么启动的YApi，你需要重新启动下

## 安装失败问题解决

如果遇到安装失败的情况，请先用下面的命令卸载插件

```shell
yapi unplugin --name yapi-plugin-interface-oauth2-token
```
进入 `vendors` 目录，执行如下命令手动安装 `node-sass`

```shell
npm install node-sass
```

再重新安装插件

```shell
yapi plugin --name yapi-plugin-interface-oauth2-token
```

## 感谢

最后特别感谢 [`eyotang`](https://github.com/eyotang) 老哥的 [`PR`](https://github.com/shouldnotappearcalm/yapi-plugin-interface-oauth2-token/pull/7)
