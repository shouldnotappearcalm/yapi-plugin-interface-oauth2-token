import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Form, Switch, Button, Icon, Tooltip, message, Input, Select } from 'antd';
import { handleSwaggerUrlData } from 'client/reducer/modules/project';
const FormItem = Form.Item;
const Option = Select.Option;
import axios from 'axios';

// layout
const formItemLayout = {
  labelCol: {
    lg: { span: 5 },
    xs: { span: 24 },
    sm: { span: 10 }
  },
  wrapperCol: {
    lg: { span: 16 },
    xs: { span: 24 },
    sm: { span: 12 }
  },
  className: 'form-item'
};
const tailFormItemLayout = {
  wrapperCol: {
    sm: {
      span: 16,
      offset: 11
    }
  }
};

@connect(
  state => {
    return {
      projectMsg: state.project.currProject
    };
  },
  {
    handleSwaggerUrlData
  }
)
@Form.create()
export default class InterfaceOauth2 extends Component {
  static propTypes = {
    form: PropTypes.object,
    match: PropTypes.object,
    projectId: PropTypes.number,
    projectMsg: PropTypes.object,
    handleSwaggerUrlData: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      sync_data: { is_sync_open: false }
    };
  }

  handleSubmit = async () => {
    const { form, projectId } = this.props;
    let params = {
      project_id: projectId,
      is_sync_open: this.state.sync_data.is_sync_open,
      uid: this.props.projectMsg.uid
    };
    if (this.state.sync_data._id) {
      params.id = this.state.sync_data._id;
    }
    form.validateFields(async (err, values) => {
      if (!err) {
        let assignValue = Object.assign(params, values);
        await axios.post('/api/plugin/autoSync/save', assignValue).then(res => {
          if (res.data.errcode === 0) {
            message.success('保存成功');
          } else {
            message.error(res.data.errmsg);
          }
        });
      }
    });
  }

  forceSync = async () => {
    await axios.get('/api/plugin/autoSync/forceSync?project_id=' + this.props.projectId).then(res => {
      if (res.data.errcode === 0) {
        message.success('保存成功');
      } else {
        message.error(res.data.errmsg);
      }
    });
  }

  validSwaggerUrl = async (rule, value, callback) => {
    try {
      await this.props.handleSwaggerUrlData(value);
    } catch (e) {
      callback('swagger地址不正确');
    }
    callback()
  }

  componentWillMount() {
    //查询同步任务
    this.setState({
      sync_data: {}
    });
    //默认每份钟同步一次,取一个随机数
    this.setState({
      random_corn: Math.round(Math.random() * 60) + ' * * * * *'
    });
    this.getSyncData();
  }

  async getSyncData() {
    let projectId = this.props.projectMsg._id;
    let result = await axios.get('/api/plugin/autoSync/get?project_id=' + projectId);
    if (result.data.errcode === 0) {
      if (result.data.data) {
        this.setState({
          sync_data: result.data.data
        });
      }
    }
  }

  // 是否开启
  onChange = v => {
    let sync_data = this.state.sync_data;
    sync_data.is_sync_open = v;
    this.setState({
      sync_data: sync_data
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div className="m-panel">
        <Form>
          <FormItem
            label="是否开启接口自动鉴权"
            {...formItemLayout}
          >
            <Switch
              checked={this.state.sync_data.is_sync_open}
              onChange={this.onChange}
              checkedChildren="开"
              unCheckedChildren="关"
            />
          </FormItem>

          <FormItem {...formItemLayout} label="获取token的路径">
            {getFieldDecorator('sync_json_url', {
              rules: [
                {
                  required: true,
                  message: '请输入获取token的路径'
                }
              ],
              validateTrigger: 'onBlur',
              initialValue: this.state.sync_data.sync_json_url
            })(<Input />)}
          </FormItem>

          <FormItem {...formItemLayout} label="token的有效时间(小时)">
            {getFieldDecorator('sync_json_url', {
              rules: [
                {
                  required: true,
                  message: '请输入获取token的有效时间'
                }
              ],
              validateTrigger: 'onBlur',
              initialValue: this.state.sync_data.sync_json_url
            })(<Input />)}
          </FormItem>

          <FormItem {...formItemLayout} label="当前使用的token">
            {getFieldDecorator('sync_cron', {
              initialValue: this.state.sync_data.sync_cron ? this.state.sync_data.sync_cron : this.state.random_corn
            })(<Input />)}
          </FormItem>

          <FormItem {...formItemLayout} label="上次获取token的时间">
            {getFieldDecorator('sync_cron', {
              initialValue: this.state.sync_data.sync_cron ? this.state.sync_data.sync_cron : this.state.random_corn
            })(<Input />)}
          </FormItem>

          <FormItem {...tailFormItemLayout}>
            <Button type="primary" htmlType="submit" icon="save" size="large" onClick={this.handleSubmit}>
              保存
            </Button>

          </FormItem>
        </Form>
      </div>
    );
  }
}
