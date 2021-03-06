import React, { Component } from 'react';
import {ajax_post} from "../ajax-utils/ajax-method";
import {api_list} from "../ajax-utils/api-manager";
import {AuthContext} from "../basic-component/auth-context";
import {Link, withRouter} from "react-router-dom"
import {Button} from "@blueprintjs/core";
import moment from "moment"
import { Layout, Breadcrumb, Card, Row, Col, Icon, Tooltip, message, Divider } from 'antd';
const {Content} = Layout;
const {Meta} = Card;

class mTAHomepageMiddle extends Component {
    constructor(props) {
        super(props);
        this.state = {
            lessonlist: [
                "课程", "管理的课程", "未发布课程"
            ],
            stulesson: [],
            talesson: [],
            uplesson: [],
            infoitems: [],
        };
        this.stulesson = [];
        this.talesson = [];
        this.uplesson = [];
        this.infoitems = [];
        // this.clickCreateLesson = this.clickCreateLesson.bind(this);
    }
    componentDidMount() {
        if(!this.props.state || this.props.id===undefined || this.props.id === -1) {
            return;
        }
        const id = this.props.id;
        ajax_post(api_list['query_user'], {id:id}, this, mTAHomepageMiddle.query_user_callback);
    }
    componentWillUpdate(nextProps) {
        //////console.log(nextProps);
        if(nextProps.id===undefined || nextProps.id === -1)
            return;
        if(nextProps.id !== this.props.id) {
            ////console.log(nextProps.id);
            ajax_post(api_list['query_user'], {id:nextProps.id}, this, mTAHomepageMiddle.query_user_callback);
        }
    }
    static query_user_callback(that, result) {
        // //console.log("query_user_callback");
        if(result.data.length === 0) {
            //////console.log("Query failed. No such user.");
            return;
        }
        const user = result.data[0];
        const student_courses = user.student_courses;
        const ta_courses = user.ta_courses;
        for(let id of student_courses) {
            ajax_post(api_list['query_course'], {id:id}, that, mTAHomepageMiddle.query_stu_course_callback);
        }
        //////console.log(ta_courses);
        for(let id of ta_courses) {
            ajax_post(api_list['query_course'], {id:id}, that, mTAHomepageMiddle.query_ta_course_callback);
        }
    }

    static query_stu_course_callback(that, result) {
        if(result.data.length===0) {
            //////console.log("Cannot find course.");
            return;
        }
        const course = result.data[0];
        const name = course.name;
        const id = course.id;
        const description = course.description;
        const notice_ids = course.notices;
        const homeworks = course.homeworks;
        // that.stulesson.push({id:id, name:name, description:description, notices:notice_ids, homeworks: homeworks});
        that.stulesson.push(course);
        for(let notice_id of notice_ids) {
            ajax_post(api_list['query_notice'], {id:notice_id}, that, mTAHomepageMiddle.query_notice_callback);
        }
        that.setState({stulesson:that.stulesson});
    }
    static query_ta_course_callback(that, result) {
        if(result.data.length===0) {
            //////console.log("Cannot find course.");
            return;
        }
        // ////console.log(result.data);
        const course = result.data[0];
        const name = course.name;
        const id = course.id;
        const description = course.description;
        const status = course.status;
        const notice_ids = course.notices;
        for(let notice_id of notice_ids) {
            ajax_post(api_list['query_notice'], {id:notice_id}, that, TAHomepageMiddle.query_notice_callback);
        }
        if(status) {
            that.talesson.push(course);
            // that.talesson.push({id:id, name:name, description:description});
            that.setState({talesson:that.talesson});
        } else {
            that.uplesson.push(course);
            // that.uplesson.push({id:id, name:name, description:description});
            that.setState({uplesson:that.uplesson});
        }
    }
    static query_notice_callback(that, result) {
        if(result.data.length===0)
            return;
        const title = result.data[0].title;
        const content = result.data[0].content;
        const id = result.data[0].id;
        that.infoitems.push({
            id:id,
            title:title,
            content:content,
        });
        that.setState({infoitems:that.infoitems});
    }
    render() {
        // ////console.log("this.state.uplesson: ", this.state.uplesson);
        // ////console.log("this.state.talesson: ", this.state.talesson);
        const now = moment().format('X');
        let running_talesson = this.state.talesson.filter(item => now >= item.start_time && now <= item.end_time);
        running_talesson = running_talesson.sort((a, b) => {
            return a.id < b.id;
        });
        // ////console.log("now", now);
        // ////console.log("running_talesson", running_talesson);
        return (
                <Content style={{padding: '0 50px'}}>
                    <Breadcrumb style={{margin: '16px 0'}}>
                        <Breadcrumb.Item><Link to="/ta">主页</Link></Breadcrumb.Item>
                    </Breadcrumb>
                    <div style={{background: '#fff', padding: 24, minHeight: 640}}>
                        <h2>我管理的课程</h2>
                        <Row gutter={16}>
                            {running_talesson.map((lesson)=>
                                <Col span={8}>
                                    <Card style={{width: '100%', marginTop: 16}}
                                          // title={<Link to={"/talesson/"+parseInt(lesson.id)}>{lesson.name}</Link>}
                                          actions={[
                                              <Tooltip title="查看通知">
                                                  <div onClick={()=>{this.props.history.push({
                                                      pathname: "/talesson/"+parseInt(lesson.id),
                                                      state: {panel: '1'}
                                                  })}}>
                                                      <Icon type="notification" theme="twoTone" />
                                                  </div>
                                              </Tooltip>,
                                              <Tooltip title="查看作业">
                                                  <div onClick={()=>{this.props.history.push({
                                                      pathname: "/talesson/"+parseInt(lesson.id),
                                                      state: {panel: '2'}
                                                  })}}>
                                                      <Icon type="edit" theme="twoTone" />
                                                  </div>
                                              </Tooltip>,
                                              <Tooltip title="查看成绩">
                                                  <div onClick={()=>{this.props.history.push({
                                                      pathname: "/talesson/"+parseInt(lesson.id),
                                                      state: {panel: '3'}
                                                  })}}>
                                                      <Icon type="check-circle" theme="twoTone" />
                                                  </div>
                                              </Tooltip>,
                                              <Tooltip title="查看课程信息">
                                                  <div onClick={()=>{this.props.history.push({
                                                          pathname: "/talesson/"+parseInt(lesson.id),
                                                          state: {panel : '4'}
                                                      })
                                                  }} >
                                                  <Icon type="info-circle" theme="twoTone"/>
                                                  </div>
                                              </Tooltip>]}
                                          hoverable={true}

                                    >
                                        <Meta title={<Link style={{fontSize: "200%"}} to={"/talesson/"+parseInt(lesson.id)}>{lesson.name}</Link>}
                                              description={
                                                  <div>
                                                      <p>{"开课时间："+moment.unix(lesson.start_time).format("YYYY年MM月DD日")}</p>
                                                      <p>{"结课时间："+moment.unix(lesson.end_time).format("YYYY年MM月DD日")}</p>
                                                      <p>{"课程暗号："+lesson.course_spell}</p>
                                                      <p>{"课程简介："+lesson.description.slice(0, 20)+(lesson.description.length <= 20 ? '' : '...')}</p>
                                                  </div>
                                              }
                                        />
                                    </Card>
                                </Col>
                            )}
                        </Row>
                        <Divider />
                        <Row>
                            <Col span={20}>
                                <h2>未发布的课程</h2>
                            </Col>
                            <Col span={4}>
                                <Button onClick={() => {
                                    this.props.history.push('/createlesson');
                                }} type="primary" size="large" icon="plus" large={true}>创建课程</Button>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            {this.state.uplesson.map((lesson)=>
                                <Col span={8}>
                                    <Card style={{width: '100%', marginTop: 16}}
                                          actions={[
                                              <Tooltip title="编辑课程信息">
                                                  <div onClick={() => {
                                                      this.props.history.push('/editlesson/' + lesson.id.toString());
                                                  }}>
                                                      <Icon type="edit" theme="twoTone" />
                                                  </div>
                                              </Tooltip>,
                                              <Tooltip title="发布课程">
                                                  <div onClick={() => {
                                                      ajax_post(api_list['update_course'], {id: lesson.id, status: 1},
                                                          this, (that, result) => {
                                                              if(result.data.code!==0) {
                                                                  // alert("Publish course failed.");
                                                                  message.error("发布课程失败");
                                                                  return;
                                                              }
                                                              window.location.reload();
                                                          })
                                                        }
                                                  }>
                                                      <Icon type="rocket" theme="twoTone" />
                                                  </div>
                                              </Tooltip>,
                                              <Tooltip title="删除课程">
                                                  <Icon type="delete" theme="twoTone"
                                                        onClick={() => {
                                                            ajax_post(api_list['delete_course'], {id: lesson.id},
                                                                this, (that, result) => {
                                                                    if(result.data.code!==0) {
                                                                        message.error("删除课程失败");
                                                                        return;
                                                                    }
                                                                    window.location.reload();
                                                                })
                                                        }
                                                        }/>
                                              </Tooltip>]}>
                                        <Meta title={<Link style={{fontSize: "200%"}} to={'/editlesson/' + lesson.id.toString()}>{lesson.name}</Link>}
                                              description={lesson.description.slice(0, 20)+(lesson.description.length <= 20 ? '' : '...')}/>
                                    </Card>
                                </Col>
                            )}
                        </Row>
                    </div>
                </Content>
        )

    }
}
mTAHomepageMiddle.contextType = AuthContext;
const TAHomepageMiddle = withRouter(mTAHomepageMiddle);

class TAHomepage extends Component {
    render() {
        return (
            <div>
                <TAHomepageMiddle state={this.props.state} id={this.props.id} role={this.props.role} />
            </div>
        )
    }
}

export {TAHomepage};