import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './index.scss';
import { formatTime } from 'client/common.js';
import {
  Form,
  Input,
  Button,
  AutoComplete,
  InputNumber,
  Switch,
  Tooltip,
  Icon,
  Row,
  Col,
  Select,
  Tabs,
  Table,
  Popconfirm,
  Radio,
  message
} from 'antd';
const FormItem = Form.Item;
import constants from 'client/constants/variable.js';
import axios from 'axios';

const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

// layout
const formItemLayout = {
  labelCol: {
    lg: { span: 5 },
    xs: { span: 8 },
    sm: { span: 8 }
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
      oauth_data: {},
      paramsAddId: '',
      dataAddId: '',
      headersAddId: ''
    };
  }

  handleInit(data) {
    this.props.form.resetFields();
    if (data.is_oauth_open == null) {
      data.is_oauth_open = false;
    }
    if (!data.token_valid_unit) {
      data.token_valid_unit = 'hour';
    }
    let {
      add_time,
      env_id,
      env_name,
      get_token_url,
      is_oauth_open,
      project_id,
      token_header,
      token_valid_hour,
      up_time,
      _id,
      request_type,
      params,
      form_data,
      headers_data
    } = data;
    if (request_type) {
      let paramsAddId, dataAddId, headersAddId;
      if (headers_data) {
        headersAddId =
          headers_data.length === 0 ? 1 : headers_data[headers_data.length - 1].addId;
      } else {
        headersAddId = 1;
      }
      // 兼容以前的配置
      if (headers_data && headers_data.length == 0) {
        data.headers_data = [
          {
            keyName: '',
            value: '',
            flag: { keyFlag: false, valueFlag: false },
            addId: 1
          }
        ]
      }

      if (request_type === 'GET') {
        paramsAddId = params.length === 0 ? 1 : params[params.length - 1].addId;
      } else {
        dataAddId =
          form_data.length === 0 ? 1 : form_data[form_data.length - 1].addId;
      }
      this.setState({
        oauth_data: data,
        paramsAddId: paramsAddId || 1,
        dataAddId: dataAddId || 1,
        headersAddId: headersAddId || 1
      });
    } else {
      this.setState({
        oauth_data: {
          add_time,
          env_id,
          env_name,
          get_token_url,
          is_oauth_open,
          project_id,
          token_header,
          token_valid_hour,
          token_valid_unit: 'hour',
          up_time,
          _id,
          last_get_time: null,
          request_type: 'GET',
          params: [
            {
              keyName: '',
              value: '',
              flag: { keyFlag: false, valueFlag: false },
              addId: 1
            }
          ],
          data_json: '',
          form_data: [
            {
              keyName: '',
              value: '',
              flag: { keyFlag: false, valueFlag: false },
              addId: 1
            }
          ],
          headers_data: [
            {
              keyName: '',
              value: '',
              flag: { keyFlag: false, valueFlag: false },
              addId: 1
            }
          ],
          token_path: '',
          dataType: 'data_json'
        },
        paramsAddId: 1,
        dataAddId: 1,
        headersAddId: 1
      });
    }
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
        // 因为路径 url 没有在FormItem 中，所以设置为 state 中的值
        assignValue.get_token_url = this.state.oauth_data.get_token_url;
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

  validGetTokenUrlValid = async (rule, value, callback) => {
    const {
      get_token_url,
      is_oauth_open,
      request_type,
      params,
      data_json,
      form_data,
      dataType,
      headers_data
    } = this.state.oauth_data;
    if (!is_oauth_open) {
      callback();
      return;
    }
    try {
      let res = await axios.post('/api/plugin/oauthInterface/url/valid', {
        url: this.props.envMsg.domain + get_token_url,
        method: request_type,
        headers_data: headers_data,
        dataType,
        params,
        form_data,
        data_json
      });
      if (res.data.errcode == 0) {
        message.success('路径校验成功');
      }
      if (res.data.errcode == 402) {
        callback('获取token地址不正确');
      }
    } catch (e) {
      callback('获取token地址不正确');
    }
    callback();
  };

  //修改path类型
  handleChange = value => {
    this.setState(state => {
      return (state.oauth_data.request_type = value);
    });
  };

  //删除
  handleDelete = (type, id) => {
    const { params, form_data, headers_data } = this.state.oauth_data;
    if (type === 'params') {
      const currentData = params.filter(item => item.addId !== id);
      const currentId = params[params.length - 1].addId;
      this.setState(state => {
        return (
          (state.oauth_data.params = currentData),
          (state.paramsAddId = currentId)
        );
      });
    } else if (type === 'form_data') {
      const currentData = form_data.filter(item => item.addId !== id);
      const currentId = form_data[form_data.length - 1].addId;
      this.setState(state => {
        return (
          (state.oauth_data.form_data = currentData),
          (state.dataAddId = currentId)
        );
      });
    } else if (type === 'headers_data') {
      const currentData = headers_data.filter(item => item.addId !== id);
      const currentId = headers_data[headers_data.length - 1].addId;
      this.setState(state => {
        return (
          (state.oauth_data.headers_data = currentData),
          (state.headersAddId = currentId)
        );
      });
    }
  };

  configAdd = () => {
    const { count, dataSource } = this.state;
    const newData = {
      key: count,
      name: `Edward King ${count}`,
      age: 32,
      address: `London, Park Lane no. ${count}`
    };
    this.setState({
      dataSource: [...dataSource, newData],
      count: count + 1
    });
  };

  handleSave = row => {
    const newData = [...this.state.dataSource];
    const index = newData.findIndex(item => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row
    });
    this.setState({ dataSource: newData });
  };
  //修改内容转成文本
  editValue(type, whoEdit, index) {
    this.setState(state => {
      return (state.oauth_data[type][index].flag[whoEdit] = true);
    });
  }
  //修改完成转回表格
  cancelEdit(type, whoEdit, index) {
    this.setState(state => {
      return (state.oauth_data[type][index].flag[whoEdit] = false);
    });
    this.forceUpdate();
  }
  //修改值
  changeData(type, whoEdit, addId, index, e) {
    const { paramsAddId, dataAddId, headersAddId, oauth_data } = this.state;
    if (type === 'params' && paramsAddId === addId) {
      const currentId = addId + 1;
      const currentData = [
        ...oauth_data.params,
        {
          keyName: '',
          value: '',
          flag: { keyFlag: false, valueFlag: false },
          addId: currentId
        }
      ];
      this.setState(state => {
        return (
          (state.oauth_data.params = currentData),
          (state.paramsAddId = currentId)
        );
      });
    } else if (type === 'form_data' && dataAddId === addId) {
      const currentId = addId + 1;
      const currentData = [
        ...oauth_data.form_data,
        {
          keyName: '',
          value: '',
          flag: { keyFlag: false, valueFlag: false },
          addId: currentId
        }
      ];
      this.setState(state => {
        return (
          (state.oauth_data.form_data = currentData),
          (state.dataAddId = currentId)
        );
      });
    } else if (type === 'headers_data' && headersAddId === addId) {
      const currentId = addId + 1;
      const currentData = [
        ...oauth_data.headers_data,
        {
          keyName: '',
          value: '',
          flag: { keyFlag: false, valueFlag: false },
          addId: currentId
        }
      ];
      this.setState(state => {
        return (
          (state.oauth_data.headers_data = currentData),
          (state.headersAddId = currentId)
        );
      });
    }
    const value = e.target.value;
    this.setState(state => {
      return (state.oauth_data[type][index][whoEdit] = value);
    });
  }
  //更改data的类型
  changeDataType = e => {
    const type = e.target.value;
    this.setState(state => {
      return (state.oauth_data.dataType = type);
    });
  };
  changeJson = e => {
    const value = e.target.value;
    this.setState(state => {
      return (state.oauth_data.data_json = value);
    });
  };
  changeUrl = e => {
    const url = e.target.value;
    this.setState(state => {
      return (state.oauth_data.get_token_url = url);
    });
  };
  handleValidUnitChange = value => {
    this.setState(state => {
      return (state.oauth_data.token_valid_unit = value);
    });
  };
  render() {
    const { envMsg } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { oauth_data } = this.state;
    const {
      is_oauth_open,
      last_get_time,
      get_token_url,
      request_type,
      params,
      dataType,
      data_json,
      form_data,
      token_valid_hour,
      token_valid_unit,
      token_header,
      token_path,
      headers_data
    } = oauth_data;
    const getColumns = [
      {
        title: 'KEY',
        dataIndex: 'keyName',
        width: '40%',
        render: (text, record, index) =>
          record.flag.keyFlag ? (
            <Input
              value={text}
              onChange={e =>
                this.changeData('params', 'keyName', record.addId, index, e)
              }
              onBlur={() => this.cancelEdit('params', 'keyFlag', index)}
            />
          ) : (
            <div
              style={{ height: '32px', lineHeight: '32px' }}
              onClick={() => this.editValue('params', 'keyFlag', index)}
            >
              {text}
            </div>
          )
      },
      {
        title: 'VALUE',
        dataIndex: 'value',
        width: '40%',
        render: (text, record, index) =>
          record.flag.valueFlag ? (
            <Input
              value={text}
              onChange={e =>
                this.changeData('params', 'value', record.addId, index, e)
              }
              onBlur={() => this.cancelEdit('params', 'valueFlag', index)}
            />
          ) : (
            <div
              style={{ height: '32px', lineHeight: '32px' }}
              onClick={() => this.editValue('params', 'valueFlag', index)}
            >
              {text}
            </div>
          )
      },
      {
        title: 'operation',
        dataIndex: 'operation',
        width: '15%',
        render: (text, record) =>
          params.length >= 1 ? (
            <Popconfirm
              title="Sure to delete?"
              onConfirm={() => this.handleDelete('params', record.addId)}
            >
              <a>Delete</a>
            </Popconfirm>
          ) : null
      }
    ];
    const postColumns = [
      {
        title: 'KEY',
        dataIndex: 'keyName',
        width: '40%',
        render: (text, record, index) =>
          record.flag.keyFlag ? (
            <Input
              value={text}
              onChange={e =>
                this.changeData('form_data', 'keyName', record.addId, index, e)
              }
              onBlur={() => this.cancelEdit('form_data', 'keyFlag', index)}
            />
          ) : (
            <div
              style={{ height: '32px', lineHeight: '32px' }}
              onClick={() => this.editValue('form_data', 'keyFlag', index)}
            >
              {text}
            </div>
          )
      },
      {
        title: 'VALUE',
        dataIndex: 'value',
        width: '40%',
        render: (text, record, index) =>
          record.flag.valueFlag ? (
            <Input
              value={text}
              onChange={e =>
                this.changeData('form_data', 'value', record.addId, index, e)
              }
              onBlur={() => this.cancelEdit('form_data', 'valueFlag', index)}
            />
          ) : (
            <div
              style={{ height: '32px', lineHeight: '32px' }}
              onClick={() => this.editValue('form_data', 'valueFlag', index)}
            >
              {text}
            </div>
          )
      },
      {
        title: 'operation',
        dataIndex: 'operation',
        width: '15%',
        height: '65px',
        render: (text, record) =>
          form_data.length >= 1 ? (
            <Popconfirm
              title="Sure to delete?"
              onConfirm={() => this.handleDelete('form_data', record.addId)}
            >
              <a>Delete</a>
            </Popconfirm>
          ) : null
      }
    ];
    const headerColumns = [
      {
        title: 'KEY',
        dataIndex: 'keyName',
        width: '40%',
        render: (text, record, index) =>
          record.flag.keyFlag ? (
            <Input
              value={text}
              onChange={e =>
                this.changeData('headers_data', 'keyName', record.addId, index, e)
              }
              onBlur={() => this.cancelEdit('headers_data', 'keyFlag', index)}
            />
          ) : (
            <div
              style={{ height: '32px', lineHeight: '32px' }}
              onClick={() => this.editValue('headers_data', 'keyFlag', index)}
            >
              {text}
            </div>
          )
      },
      {
        title: 'VALUE',
        dataIndex: 'value',
        width: '40%',
        render: (text, record, index) =>
          record.flag.valueFlag ? (
            <Input
              value={text}
              onChange={e =>
                this.changeData('headers_data', 'value', record.addId, index, e)
              }
              onBlur={() => this.cancelEdit('headers_data', 'valueFlag', index)}
            />
          ) : (
            <div
              style={{ height: '32px', lineHeight: '32px' }}
              onClick={() => this.editValue('headers_data', 'valueFlag', index)}
            >
              {text}
            </div>
          )
      },
      {
        title: 'operation',
        dataIndex: 'operation',
        width: '15%',
        height: '65px',
        render: (text, record) =>
          form_data.length >= 1 ? (
            <Popconfirm
              title="Sure to delete?"
              onConfirm={() => this.handleDelete('headers_data', record.addId)}
            >
              <a>Delete</a>
            </Popconfirm>
          ) : null
      }
    ];
    const envTpl = data => {
      return (
        <div>
          <FormItem required={false} label="环境名称" {...formItemLayout}>
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
              checked={is_oauth_open}
              onChange={this.onChange}
              checkedChildren="开"
              unCheckedChildren="关"
            />
            {last_get_time != null ? (
              <div>
                上次更新时间:
                <span className="logtime">
                  {formatTime(this.state.oauth_data.last_get_time)}
                </span>
              </div>
            ) : null}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={
              <span>
                获取token的地址&nbsp;
                <Tooltip title="默认POST请求，取返回结果的access_token字段（路径中可以包含{time}，我会替换为当前时间戳）">
                  <Icon type="question-circle-o" />
                </Tooltip>
              </span>
            }
          >
            <Row>
              <Col span={4}>
                <Select
                  value={request_type}
                  style={{ width: '100%' }}
                  onChange={this.handleChange}
                >
                  <Option value="GET">GET</Option>
                  <Option value="POST">POST</Option>
                </Select>
              </Col>
              <Col span={18}>
                <Input onChange={this.changeUrl} value={get_token_url} />
              </Col>
              <Col span={2}>
                {getFieldDecorator('oauth_data.get_token_url', {
                  rules: [
                    {
                      required: true,
                      message: '请输入获取token的地址'
                    },
                    {
                      validator: this.validGetTokenUrlValid
                    }
                  ],
                  validateTrigger: 'onClick',
                  initialValue: get_token_url
                })(
                  <Button type="primary" style={{ marginLeft: '30px' }}>
                    检验
                  </Button>
                )}
              </Col>
            </Row>
          </FormItem>
          <FormItem {...formItemLayout} label="headers">
            <Table
              rowClassName={() => 'editable-row'}
              bordered
              dataSource={headers_data}
              columns={headerColumns}
              rowKey="addId"
            />
          </FormItem>
          <FormItem {...formItemLayout} label="data">
            <Tabs defaultActiveKey="1" onChange={this.callback}>
              <TabPane tab="Params" key="1">
                <Row>
                  <Table
                    rowClassName={() => 'editable-row'}
                    bordered
                    dataSource={params}
                    columns={getColumns}
                    rowKey="addId"
                  />
                </Row>
              </TabPane>
              <TabPane tab="Body" key="2">
                <Radio.Group onChange={this.changeDataType} value={dataType}>
                  <Radio value={'data_json'}>raw</Radio>
                  <Radio value={'form_data'}>form-data</Radio>
                </Radio.Group>
                {dataType === 'data_json' ? (
                  <TextArea
                    onChange={this.changeJson}
                    value={data_json}
                    style={{ height: '150px' }}
                  />
                ) : (
                  <Table
                    rowClassName={() => 'editable-row'}
                    bordered
                    dataSource={form_data}
                    columns={postColumns}
                    rowKey="addId"
                  />
                )}
              </TabPane>
            </Tabs>
          </FormItem>
          <FormItem {...formItemLayout} label="token有效时长">
            <Row>
              <Col span={3}>
                <Select style={{ width: '100%' }} value={token_valid_unit} onChange={this.handleValidUnitChange}>
                  <Option value="hour">小时</Option>
                  <Option value="minute">分钟</Option>
                </Select>
              </Col>
              <Col span={4}>
                {getFieldDecorator('oauth_data.token_valid_hour', {
                  rules: [
                    {
                      required: true,
                      pattern: new RegExp(/^[1-9]\d*$/, 'g'),
                      message: '请输入token有效时长(整数)'
                    }
                  ],
                  initialValue: token_valid_hour
                })(<InputNumber placeholder="时间单位对应的值" style={{ width: '100%' }} min={1} max={oauth_data.token_valid_unit == 'hour' ? 23 : 59} />)}
              </Col>
            </Row>
          </FormItem>

          <Row>
            <Col span={3}></Col>
            <Col span={9}>
              <FormItem
                {...formItemLayout}
                label={
                  <span>
                    请求头字段&nbsp;
                    <Tooltip title="将请求到的token附加到哪个Header字段上">
                      <Icon type="question-circle-o" />
                    </Tooltip>
                  </span>
                }
              >
                {getFieldDecorator('oauth_data.token_header', {
                  rules: [
                    {
                      required: true,
                      message: '请选择请求头字段'
                    }
                  ],
                  validateTrigger: ['onChange', 'onBlur'],
                  initialValue: token_header ? token_header : 'Authorization'
                })(
                  <AutoComplete
                    style={{ width: '200px' }}
                    allowClear={true}
                    dataSource={constants.HTTP_REQUEST_HEADER}
                    placeholder="请输入header名称"
                    filterOption={(inputValue, option) =>
                      option.props.children
                        .toUpperCase()
                        .indexOf(inputValue.toUpperCase()) !== -1
                    }
                  />
                )}

              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem {...formItemLayout} label="获取路径">
                {getFieldDecorator('oauth_data.token_path', {
                  rules: [
                    {
                      required: true,
                      message: '请输入token的获取路径'
                    }
                  ],
                  initialValue: token_path
                })(<Input />)}
              </FormItem>
            </Col>
          </Row>
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
