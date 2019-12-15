import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './index.scss';
import { Layout, message, Row } from 'antd';
const { Content, Sider } = Layout;
import ProjectEnvContent from '../oauth2Content/oauth2Content';

import { connect } from 'react-redux';
import { updateEnv, getProject, getEnv } from 'client/reducer/modules/project';
import axios from 'axios';

@connect(
  state => {
    return {
      projectMsg: state.project.currProject
    };
  },
  {
    updateEnv,
    getProject,
    getEnv
  }
)
class ProjectInterfaceOauth extends Component {
  static propTypes = {
    projectId: PropTypes.number,
    updateEnv: PropTypes.func,
    getProject: PropTypes.func,
    projectMsg: PropTypes.object,
    getEnv: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      env: [],
      _id: null,
      currentEnvMsg: {},
      delIcon: null,
      currentKey: -2,
      currOauth: {},
      projectAllOauth: []
    };
  }

  initState(curdata, id) {
    let newValue = {};
    newValue['env'] = [].concat(curdata);
    newValue['_id'] = id;
    this.setState({
      ...this.state,
      ...newValue
    });
  }

  async componentWillMount() {
    this._isMounted = true;
    await this.props.getProject(this.props.projectId);
    await this.getOauthData();
    const { env, _id } = this.props.projectMsg;
    this.initState(env, _id);
    this.handleClick(0, env[0]);
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  handleClick = (key, data) => {
    this.setCurOauth(data._id);
    this.setState({
      currentEnvMsg: data,
      currentKey: key
    });
  };

  setCurOauth(envId) {
    let currOauth = {};
    if (!this.state.projectAllOauth) {
      this.setState({
        currOauth: currOauth
      });
      return;
    }

    for (let i = 0; i < this.state.projectAllOauth.length; i++) {
      if (
        this.state.projectAllOauth[i].env_id &&
        this.state.projectAllOauth[i].env_id == envId
      ) {
        currOauth = this.state.projectAllOauth[i];
        break;
      }
    }
    this.setState({
      currOauth: currOauth
    });
  }

  async getOauthData() {
    let result = await axios.get('/api/plugin/oauthInterface/project/all?project_id=' + this.props.projectId);
    if (result.data.errcode === 0) {
      if (result.data.data) {
        this.setState({
          projectAllOauth: result.data.data
        });
      }
    }
  }

  enterItem = key => {
    this.setState({ delIcon: key });
  };

  //保存设置
  async onSave(assignValue) {
    await axios
      .post('/api/plugin/oauthInterface/save', assignValue)
      .then(res => {
        if (res.data.errcode === 0) {
          message.success('保存成功');
          this.getOauthData();
        } else {
          message.error(res.data.errmsg);
        }
      });
  }

  //提交保存信息
  onSubmit = value => {
    let assignValue = value;
    assignValue['project_id'] = this.state._id;
    assignValue['u_id'] = this.props.projectMsg.uid;
    this.onSave(assignValue);
  };

  // 动态修改环境名称
  handleInputChange = (value, currentKey) => {
    let newValue = [].concat(this.state.env);
    newValue[currentKey].name = value || '新环境';
    this.setState({ env: newValue });
  };

  render() {
    const { env, currentKey } = this.state;

    const envSettingItems = env.map((item, index) => {
      return (
        <Row
          key={index}
          className={
            'menu-item ' + (index === currentKey ? 'menu-item-checked' : '')
          }
          onClick={() => this.handleClick(index, item)}
          onMouseEnter={() => this.enterItem(index)}
        >
          <span className="env-icon-style">
            <span
              className="env-name"
              style={{ color: item.name === '新环境' && '#2395f1' }}
            >
              {item.name}
            </span>
          </span>
        </Row>
      );
    });

    return (
      <div className="m-env-panel">
        <Layout className="project-env">
          <Sider width={195} style={{ background: '#fff' }}>
            <div style={{ height: '100%', borderRight: 0 }}>
              <Row className="first-menu-item menu-item">
                <div className="env-icon-style">
                  <h3>环境列表</h3>
                </div>
              </Row>
              {envSettingItems}
            </div>
          </Sider>
          <Layout className="env-content">
            <Content
              style={{
                background: '#fff',
                padding: 24,
                margin: 0,
                minHeight: 280
              }}
            >
              <ProjectEnvContent
                projectId={this.state._id}
                envMsg={this.state.currentEnvMsg}
                oauthData={this.state.currOauth}
                onSubmit={e => this.onSubmit(e)}
                handleEnvInput={e => this.handleInputChange(e, currentKey)}
              />
            </Content>
          </Layout>
        </Layout>
      </div>
    );
  }
}

export default ProjectInterfaceOauth;
