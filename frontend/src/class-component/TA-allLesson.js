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

class AllLesson extends Component {
    constructor(props) {
        super(props);
        this.state = {
            lessons: []
        }
    }

    componentDidMount() {
        console.log("id ", this.props.id);
        if (this.props.id === -1 || this.props.id === undefined){
            return;
        }
        this.query_data(this.props.id);
    }

    componentWillUpdate(nextProps) {
        console.log("id", nextProps.id);
        if (nextProps.id === -1 || nextProps.id === undefined){
            return;
        }
        if (nextProps.id !== this.props.id)
            this.query_data(nextProps.id);
    }

    query_data(user_id) {
        this.setState({
            lessons: []
        });
        console.log("user_id ", user_id);
        ajax_post(api_list['query_user'], {id: user_id}, this, (that, result)=>{
            if (result.data.length === 0){
                message.error("查找用户失败");
                return;
            }
            // message.success("查找用户成功");

            const user = result.data[0];
            console.log("user ", user);
            if (user.role === 1) {
                for (let index in user.student_courses) {
                    ajax_post(api_list['query_course'], {id: user.student_courses[index]}, that, (that, res) => {
                        if (res.data.length === 0) {
                            return;
                        }
                        const course = res.data[0];
                        if (course.status !== 0) {
                            let lessons = that.state.lessons;
                            lessons.push(course);
                            that.setState({lessons: lessons});
                        }
                    });
                }
            } else
            if (user.role === 2 || user.role === 3) {
                for (let index in user.ta_courses) {
                    ajax_post(api_list['query_course'], {id: user.ta_courses[index]}, that, (that, res) => {
                        if (res.data.length === 0) {
                            return;
                        }
                        const course = res.data[0];
                        if (course.status !== 0) {
                            let lessons = that.state.lessons;
                            lessons.push(course);
                            that.setState({lessons: lessons});
                        }
                    });
                }
            }
        });
    }

    render() {
        console.log("this.state.lessons ", this.state.lessons);
        console.log("role", this.props.role);
        let ret;
        if (this.props.role === 2 || this.props.role === 3) {
            ret = (
                <Content style={{padding: '0 50px'}}>
                    <Breadcrumb style={{margin: '16px 0'}}>
                        <Breadcrumb.Item><Link to="/ta">Home</Link></Breadcrumb.Item>
                    </Breadcrumb>
                    <div style={{background: '#fff', padding: 24, minHeight: 640}}>
                        <h2>全部</h2>
                        <Row gutter={16}>
                            {this.state.lessons.map((lesson)=>
                                <Col span={8}>
                                    <Card style={{width: '100%', marginTop: 16}}
                                          actions={[
                                              <Tooltip title="查看通知">
                                                  <div onClick={()=>{this.props.history.push("/talesson/"+parseInt(lesson.id))}}>
                                                      <Icon type="notification" theme="twoTone" />
                                                  </div>
                                              </Tooltip>,
                                              <Tooltip title="查看作业">
                                                  <div onClick={()=>{this.props.history.push("/talesson/"+parseInt(lesson.id))}}>
                                                      <Icon type="edit" theme="twoTone" />
                                                  </div>
                                              </Tooltip>,
                                              <Tooltip title="查看成绩">
                                                  <div onClick={()=>{this.props.history.push("/talesson/"+parseInt(lesson.id))}}>
                                                      <Icon type="check-circle" theme="twoTone" />
                                                  </div>
                                              </Tooltip>,
                                              <Tooltip title="查看课程信息">
                                                  <Icon type="info-circle" theme="twoTone"
                                                        onClick={()=>{this.props.history.push("/talesson/"+parseInt(lesson.id))}}/>
                                              </Tooltip>]}
                                          hoverable={true}
                                    >
                                        <Meta title={<Link to={"/talesson/"+parseInt(lesson.id)}>{lesson.name}</Link>}
                                              description={lesson.description}/>
                                    </Card>
                                </Col>
                            )}
                        </Row>
                    </div>
                </Content>
            );
        } else
        if (this.props.role === 1) {
            ret = (
                <Content style={{padding: '0 50px'}}>
                    <Breadcrumb style={{margin: '16px 0'}}>
                        <Breadcrumb.Item><Link to="/student">主页</Link></Breadcrumb.Item>
                    </Breadcrumb>
                    <div style={{background: '#fff', padding: 24, minHeight: 640}}>
                        <h2>全部</h2>
                        <Row gutter={16}>
                            {this.state.lessons.map((lesson)=>
                                <Col span={8}>
                                    <Card style={{width: '100%', marginTop: 16}}
                                          actions={[
                                              <Tooltip title="查看通知">
                                                  <div onClick={()=>{this.props.history.push("/studentlesson/"+parseInt(lesson.id))}}>
                                                      <Icon type="notification" theme="twoTone" style={{padding: '0 5px'}} />
                                                      {/*<Badge count={lesson.notices.length}*/}
                                                      {/*style={{padding: '0 5px', backgroundColor: '#fff', color: '#999', boxShadow: '0 0 0 1px #d9d9d9 inset'}} />*/}
                                                  </div>
                                              </Tooltip>,
                                              <Tooltip title="查看作业">
                                                  <div onClick={()=>{this.props.history.push("/studentlesson/"+parseInt(lesson.id))}}>
                                                      <Icon type="edit" theme="twoTone" style={{padding: '0 5px'}} />
                                                      {/*<Badge count={lesson.homeworks.length}*/}
                                                      {/*style={{padding: '0 5px', backgroundColor: '#fff', color: '#999', boxShadow: '0 0 0 1px #d9d9d9 inset'}} />*/}
                                                  </div>
                                              </Tooltip>,
                                              <Tooltip title="查看课程信息">
                                                  <Icon type="info-circle" theme="twoTone"
                                                        onClick={()=>{this.props.history.push("/studentlesson/"+parseInt(lesson.id))}}/>
                                              </Tooltip>]}>
                                        <Meta title={<Link to={"/studentlesson/"+parseInt(lesson.id)}>{lesson.name}</Link>}
                                              description={lesson.description}/>
                                    </Card>
                                </Col>
                            )}
                        </Row>
                    </div>
                </Content>
            );
        } else
        {
            return (
                <Content style={{padding: '0 50px'}}>
                    <Breadcrumb style={{margin: '16px 0'}}>
                        <Breadcrumb.Item><Link to="/student">主页</Link></Breadcrumb.Item>
                    </Breadcrumb>
                    <div style={{background: '#fff', padding: 24, minHeight: 640}}>
                        <h2>全部</h2>
                    </div>
                </Content>
            );
        }
        return ret;
    }
}

export {AllLesson};