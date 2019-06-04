# yapi-plugin-interface-oauth2

> 这是一个为了解决yapi的oauth2.0项目接口需要做鉴权操作的插件,觉得可以给star的欢迎star一下，你的star是我前进的动力之一。

## 主要解决问题

针对大多数项目来说，特别是现在的前后端分离的项目，接口通常也需要鉴权，这个插件目的就是为了解决自动获取鉴权token附加在请求上的功能。

## 特性

- 简单易用
- 支持自动定时给所有接口加上一个特定的Header属性

## 简单使用

### 安装插件

> 要使用安装插件的yapi，需要先安装ykit（还是yapi-cli来着）

```shell
yapi plugin --name yapi-plugin-interface-oauth2
```

### 配置使用

进入项目设置页面，可以看到接口自动鉴权的Tab页

![2019-06-04_11-13.png](https://i.loli.net/2019/06/04/5cf5e22ba5d5b69778.png)

根据不同的环境配置不同的获取token的方式

- 环境名称： 对应环境配置的列表
- 获取token的地址： 获取 token 的地址，我会以 `POST` 请求的方式请求这个路径（路径中可以带有 `{time}`,我会每次替换成当前时间戳），并且获取返回 json 的 `access_token` 和 `token_type` 字段，目前我了解到的应该都是 `POST` 请求，如果某些项目是对这个 token_url 使用 GET 请求或者返回结果的 token 不再 `access_token` 字段，请在 issue留言我可以来修改这个插件
- token有效小时： 我会以定时任务的方式重新获取token
- 请求头字段： 将获取到的结果放入这个环境的哪个Header字段，比如我这里选择了 `Authorization`，将会把获取道德token保存到这个属性里

---

关于token请求地址的结果获取：

目前我考虑到的场景如下，我会把 token_type 和 access_token 合并起来, `结果 = token_type + " " + access_token`

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

![2019-06-04_11-22.png](https://i.loli.net/2019/06/04/5cf5e409a1acd22891.png)
