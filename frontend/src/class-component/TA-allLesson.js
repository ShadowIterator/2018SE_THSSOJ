import React, { Component } from 'react';
import {ajax_post} from "../ajax-utils/ajax-method";
import {api_list} from "../ajax-utils/api-manager";
import {Link, withRouter} from "react-router-dom"
import moment from "moment"
import { Layout, Breadcrumb, Card, Row, Col, Icon, Tooltip, message, Input } from 'antd';
const {Content} = Layout;
const {Meta} = Card;

class mAllLesson extends Component {
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
        // console.log("this.state.lessons ", this.state.lessons);
        // console.log("role", this.props.role);
        let ret;
        const lesson_rank = this.state.lessons.sort((a, b) => {
            const ida = a.id;
            const idb = b.id;
            return ida<idb;
        });
        if (this.props.role === 2 || this.props.role === 3) {
            ret = (
                <Content style={{padding: '0 50px'}}>
                    <Breadcrumb style={{margin: '16px 0'}}>
                        <Breadcrumb.Item><Link to="/ta">主页</Link></Breadcrumb.Item>
                        <Breadcrumb.Item><Link to="/ta">全部课程</Link></Breadcrumb.Item>
                    </Breadcrumb>
                    <div style={{background: '#fff', padding: 24, minHeight: 640}}>
                        <h2>全部课程</h2>
                        <Row gutter={16}>
                            {lesson_rank.map((lesson)=>
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
                                        <Meta title={<Link style={{fontSize: "200%"}} to={"/talesson/"+parseInt(lesson.id)}>{lesson.name}</Link>}
                                              description={
                                                  <div>
                                                      <p>{"开课时间："+moment.unix(lesson.start_time).format("YYYY年MM月DD日")}</p>
                                                      <p>{"结课时间："+moment.unix(lesson.end_time).format("YYYY年MM月DD日")}</p>
                                                      <p>{"课程简介："+lesson.description.slice(0, 20)+(lesson.description.length <= 20 ? '' : '...')}</p>
                                                  </div>
                                              }
                                        />
                                        {/*<Meta title={<Link style={{fontSize: '200%'}} to={"/talesson/"+parseInt(lesson.id)}>{lesson.name}</Link>}*/}
                                              {/*description={lesson.description.slice(0, 20)+(lesson.description.length <= 20 ? '' : '...')}/>*/}
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
                        <Breadcrumb.Item><Link to="/student">全部课程</Link></Breadcrumb.Item>
                    </Breadcrumb>
                    <div style={{background: '#fff', padding: 24, minHeight: 640}}>
                        <Row>
                            <Col span={18}> <h2>全部课程</h2> </Col>
                            <Col span={6}>
                                <Input.Search
                                    placeholder="输入课程暗号加入课程"
                                    enterButton="加入课程"
                                    size="large"
                                    onSearch={value => {
                                        console.log(value);
                                        const data = {
                                            user_id: this.props.id,
                                            course_spell: value
                                        }
                                        api_list(api_list['add_course'], data, this, (that, result) => {
                                            if (that.data.code === 1 || that.data.length === 0) {
                                                message.error('未找到课程');
                                                return;
                                            }
                                            message.success('加入课程成功');
                                            that.query_data(that.props.id);
                                        });
                                    }}
                                />
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            {lesson_rank.map((lesson)=>
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
                                        <Meta title={<Link style={{fontSize: '200%'}} to={"/studentlesson/"+parseInt(lesson.id)}>{lesson.name}</Link>}
                                              description={lesson.description.slice(0, 20)+(lesson.description.length <= 20 ? '' : '...')}/>
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
                        <Breadcrumb.Item><Link to="/student">全部课程</Link></Breadcrumb.Item>
                    </Breadcrumb>
                    <div style={{background: '#fff', padding: 24, minHeight: 640}}>
                        <h2>全部课程</h2>
                    </div>
                </Content>
            );
        }
        return ret;
    }
}

const AllLesson = withRouter(mAllLesson);

export {AllLesson};