const yapi = require('yapi.js');
const baseModel = require('models/base.js');

class oauthModel extends baseModel {
  getName() {
    return 'oauth_interface';
  }

  getSchema() {
    return {
      uid: { type: Number },
      project_id: { type: Number, required: true },
      //是否开启自动同步
      is_oauth_open: { type: Boolean, default: false },
      //获取token的url路径
      get_token_url: String,
      //token有效的小时
      token_valid_hour: Number,
      //环境变量的id
      env_id: String,
      //环境变量的名称
      env_name: String,
      //保存到哪个header上
      token_header: String,
      //上次成功同步接口时间,
      last_get_time: Number,
      add_time: Number,
      up_time: Number,
      //请求类型
      request_type: String,
      //get请求参数
      params: Array,
      //post请求的类型和参数
      dataType: String,
      data_json: Array,
      form_data: Array,
      //token的获取路径
      token_path: String
    };
  }

  getByProjectId(id) {
    return this.model
      .find({
        project_id: id
      })
      .select(
        '_id uid project_id add_time up_time is_oauth_open get_token_url token_valid_hour token_header env_id env_name last_get_time request_type params dataType data_json form_data token_path'
      )
      .sort({ _id: -1 })
      .exec();
  }

  getByProjectIdAndEnvId(projectId, envId) {
    return this.model.findOne({
      project_id: projectId,
      env_id: envId
    });
  }

  delByProjectId(project_id) {
    return this.model.remove({
      project_id: project_id
    });
  }

  delByProjectIdAndEnvId(projectId, envId) {
    return this.model.remove({
      project_id: projectId,
      env_id: envId
    });
  }

  save(data) {
    data.add_time = yapi.commons.time();
    data.up_time = yapi.commons.time();
    let m = new this.model(data);
    return m.save();
  }

  listAll() {
    return this.model
      .find({})
      .select(
        '_id uid project_id add_time up_time is_oauth_open get_token_url token_valid_hour token_header env_id env_name last_get_time request_type params dataType data_json form_data token_path'
      )
      .sort({ _id: -1 })
      .exec();
  }

  up(data) {
    let id = data.id;
    delete data.id;
    data.up_time = yapi.commons.time();
    return this.model.update(
      {
        _id: id
      },
      data
    );
  }

  upById(id, data) {
    delete data.id;
    data.up_time = yapi.commons.time();
    return this.model.update(
      {
        _id: id
      },
      data
    );
  }

  del(id) {
    return this.model.remove({
      _id: id
    });
  }
}

module.exports = oauthModel;
