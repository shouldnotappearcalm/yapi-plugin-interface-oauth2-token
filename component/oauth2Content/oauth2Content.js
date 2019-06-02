import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './index.scss';
import { formatTime } from 'client/common.js';
import { Form, Input, Button, AutoComplete, InputNumber, Switch } from 'antd';
const FormItem = Form.Item;
import constants from 'client/constants/variable.js';

// layout
const formItemLayout = {
  labelCol: {
    lg: { span: 4 },
    xs: { span: 7 },
    sm: { span: 7 }
  },
  wrapperCol: {
    lg: { span: 17 },
    xs: { span: 16 },
    sm: { span: 16 }
  },
  className: 'form-item'
};

class OAuth2Content extends Component {
  static propTypes = {
    projectId: PropTypes.number,
    envMsg: PropTypes.object,
    oauthData: PropTypes.object,
    form: PropTypes.object,
    onSubmit: PropTypes.func,
    handleEnvInput: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      oauth_data: {}
    };
  }

  handleInit(data) {
    this.props.form.resetFields();

    if (data.is_oauth_open == null) {
      data.is_oauth_open = false;
    }
    this.setState({
      oauth_data: data
    });
  }

  componentWillReceiveProps(nextProps) {
    let curEnvName = this.props.envMsg.name;
    let nextEnvName = nextProps.envMsg.name;
    if (curEnvName !== nextEnvName) {
      this.handleInit(nextProps.oauthData);
    }
  }

  handleOk = e => {
    e.preventDefault();
    const { form, onSubmit, envMsg } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        let assignValue = this.state.oauth_data;
        values.oauth_data.env_id = envMsg._id;
        assignValue = Object.assign(assignValue, values.oauth_data);
        onSubmit(assignValue);
      }
    });
  };

  // 是否开启
  onChange = v => {
    let oauth_data = this.state.oauth_data;
    oauth_data.is_oauth_open = v;
    this.setState({
      oauth_data: oauth_data
    });
  };

  render() {
    const { envMsg } = this.props;
    const { getFieldDecorator } = this.props.form;
    const envTpl = data => {
      return (
        <div>
          <FormItem required={false} label="环境名称"
            {...formItemLayout}>
            {getFieldDecorator('oauth_data.env_name', {
              validateTrigger: ['onChange', 'onBlur'],
              initialValue: data.name === '新环境' ? '' : data.name || ''
            })(
              <Input
                disabled
                placeholder="请输入环境名称"
                style={{ marginRight: 8 }}
              />
            )}
          </FormItem>
          <FormItem label="是否开启自动获取token" {...formItemLayout}>
            <Switch
              checked={this.state.oauth_data.is_oauth_open}
              onChange={this.onChange}
              checkedChildren="开"
              unCheckedChildren="关"
            />
            {this.state.oauth_data.last_get_time != null ? (<div>上次更新时间:<span className="logtime">{formatTime(this.state.oauth_data.last_get_time)}</span></div>) : null}
          </FormItem>
          <FormItem {...formItemLayout} label="获取token的地址">
            {getFieldDecorator('oauth_data.get_token_url', {
              rules: [
                {
                  required: true,
                  message: '请输入获取token的地址'
                }
              ],
              initialValue: this.state.oauth_data.get_token_url
            })(<Input />)}
          </FormItem>
          <FormItem {...formItemLayout} label="token有效小时">
            {getFieldDecorator('oauth_data.token_valid_hour', {
              rules: [
                {
                  required: true,
                  message: '请输入token有效小时'
                }
              ],
              initialValue: this.state.oauth_data.token_valid_hour
            })(<InputNumber />)}
          </FormItem>
          <FormItem {...formItemLayout} label="请求头字段">
            {getFieldDecorator('oauth_data.token_header', {
              rules: [
                {
                  required: true,
                  message: '请选择请求头字段'
                }
              ],
              validateTrigger: ['onChange', 'onBlur'],
              initialValue: this.state.oauth_data.token_header ? this.state.oauth_data.token_header : 'Authorization'
            })(
              <AutoComplete
                style={{ width: '200px' }}
                allowClear={true}
                dataSource={constants.HTTP_REQUEST_HEADER}
                placeholder="请输入header名称"
                filterOption={(inputValue, option) =>
                  option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                }
              />
            )}
          </FormItem>
        </div>
      );
    };

    return (
      <div>
        {envTpl(envMsg)}
        <div className="btnwrap-changeproject">
          <Button
            className="m-btn btn-save"
            icon="save"
            type="primary"
            size="large"
            onClick={this.handleOk}
          >
            保 存
          </Button>
        </div>
      </div>
    );
  }
}
export default Form.create()(OAuth2Content);
