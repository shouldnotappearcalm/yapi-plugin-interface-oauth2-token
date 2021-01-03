# yapi-plugin-interface-oauth2-token

> 这是一个为了解决yapi管理的项目接口需要做鉴权操作的插件,觉得可以给 star 的欢迎 star 一下，你的 star 是我前进的动力之一。

## 主要解决问题

针对大多数项目来说，特别是现在的前后端分离的项目，接口通常也需要鉴权，这个插件目的就是为了解决自动获取鉴权token附加在请求上的功能。

## 特性

- 简单易用
- 支持自动定时给所有接口加上一个特定的 `Header` 属性
- 支持多种请求方式和结果获取方式

## 版本说明

### 1.3.0(2020-10-29)

- 修复获取路径中解析返回结果中多维数组的问题
- 支持 http url 使用自签名证书

### 1.2.3(2020-3-9)

- 修复获取路径中获取 `header` 简单字符串属性的错误

### 1.2.2(2020-3-8)

- 完善鉴权页面的配置，解决时长校验规则问题

### 1.2.0(2020-3-7)

- 支持配置更细粒度的鉴权请求执行时间，支持分钟级令牌刷新

### 1.1.1(2020-2-25)

- 修改校验成功无明显提示问题
- 修改 `get_token_url` 提交时候的 `bug`

### 1.1.0(2020-2-18)

- 新增支持自定义请求 `Header`

### 1.0.1

- 解决插件的一些 `bug`

### 1.0.0

- 发布正式版本，支持 `GET`、`POST` 等多种方式请求
- 支持定制化结果获取方式

## 简单使用

### 安装插件

> 要使用安装插件的yapi，需要先安装 `yapi-cli`

```shell
npm install yapi-cli -g

yapi plugin --name yapi-plugin-interface-oauth2-token
```

### 升级插件

我的升级过程不一定是最好的方法

1. 修改 `package.json` 和 `package-lock.json` 中的 `yapi-plugin-interface-oauth2-token` 的版本号为 `1.2.3`

2. 删除 `node_modules`，然后重新 `npm install`

3. 然后先卸载插件，再重新安装插件

```shell

yapi unplugin --name yapi-plugin-interface-oauth2-token

yapi plugin --name yapi-plugin-interface-oauth2-token

```

### 安装中如果各种报错

如果安装中报错可以使用我提供的 `node_modules.tar.gz`，下载下来解压到你的 yapi 的 `node_modules` 目录，这个压缩包针对 Linux,Node 13+

### 配置使用

进入项目设置页面，可以看到接口自动鉴权的Tab页

![image](https://user-images.githubusercontent.com/20592210/70865694-45395a80-1f9b-11ea-8e84-ec1f6ed5bc81.png)

根据不同的环境配置不同的获取token的方式

- 环境名称： 对应环境配置的列表
- 获取 `token` 的地址： 获取 token 的地址，可以是 `GET` 请求或者是 `POST` 请求
- `token` 有效小时： 我会以定时任务的方式重新获取 `token`
- 请求头字段： 将获取到的结果放入这个环境的哪个 `Header` 字段，比如我这里选择了 `Authorization`，将会把获取到的 `token` 保存到这个属性里
- 获取路径
  - 比如你要获取请求体里面的内容，就是 `data.xxx`，记得以 `data` 开头获取请求体内容
  - 如果是获取 `header` 的内容请使用 `header.yyy`，可以使用 `+` 作为连接符
  - 获取返回结果中的内容请使用 `body.xxx`

---

关于token请求地址的结果获取：

目前我考虑到的场景如下，我会把接口返回数据中的 `token_type` 和 `access_token` 以空格分隔连接起来，所以我会写获取路径是 `body.token_type +  " " + body.access_token`,

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

不论你使用什么启动的 `YApi`，你需要重新启动下

## 安装失败问题解决

如果遇到安装失败的情况，请先用下面的命令卸载插件

```shell
yapi unplugin --name yapi-plugin-interface-oauth2-token
```

进入 `vendors` 目录，执行如下命令手动安装 `node-sass`

```shell
npm install node-sass
```

修改 `package.json` 和 `package-lock.json` 的版本号，再重新安装插件，目前最新版本为 `1.2.3`

```shell
yapi plugin --name yapi-plugin-interface-oauth2-token
```

## 感谢

- [`eyotang`](https://github.com/eyotang)
- [`Wizard`](https://github.com/lsw1991abc)
