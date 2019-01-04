import React, { Component } from 'react';

import {ajax_post} from "../ajax-utils/ajax-method";
import {api_list} from "../ajax-utils/api-manager";

import {withRouter, Link} from "react-router-dom";
import moment from "moment"
import { Layout, Breadcrumb, Card, Row, Col, Icon, Tooltip, Badge, Input, message } from 'antd';
const {Content} = Layout;
const {Meta} = Card;

class mStudentHomepageMiddle extends Component {
    constructor(props) {
        super(props);
        this.state = {
            lessonlist: [],
        };
        this.lessonlist = [];
    }
    componentDidMount() {
        if(!this.props.state || this.props.id===undefined || this.props.id === -1)
            return;
        // const id = this.props.id;
        this.query_data(this.props.id);
        // ajax_post(api_list['query_user'], {id:id}, this, StudentHomepageMiddle.query_user_callback);
    }
    componentWillUpdate(nextProps) {
        if(nextProps.id===-1)
            return;
        if(nextProps.id !== this.props.id) {
            this.query_data(nextProps.id);
        }
    }
    query_data(id) {
        ajax_post(api_list['query_user'], {id: id}, this, StudentHomepageMiddle.query_user_callback);
    }
    static query_user_callback(that, result) {
        if(result.data.length === 0) {
            ////console.log("Query failed. No such user.");
            return;
        }
        const user = result.data[0];
        that.userquery_result = user;
        const lesson_ids = user.student_courses? user.student_courses:[];
        for(let lesson_id of lesson_ids) {
            ajax_post(api_list['query_course'], {id:lesson_id, status:1}, that, StudentHomepageMiddle.query_course_callback);
        }
    }
    static query_course_callback(that, result) {
        if(result.data.length === 0) {
            ////console.log("Query failed. No such course.");
            return;
        }
        const course = result.data[0];
        that.lessonlist.push(course);
        that.setState({lessonlist: that.lessonlist});
    }
    render() {
        this.lessonlist.sort(function(a, b) {
            const ida = a.id;
            const idb = b.id;
            return (ida<idb) ? -1 : (ida>idb) ? 1 : 0;
        });
        const now = moment().format('X');
        let running_lesson = this.state.lessonlist.filter(item=> now >= item.start_time && now <= item.end_time);
        running_lesson = running_lesson.sort((a, b) => {
            return a.id < b.id;
        });
        return (
            <Content style={{padding: '0 50px'}}>
                <Breadcrumb style={{margin: '16px 0'}}>
                    <Breadcrumb.Item><Link to="/student">主页</Link></Breadcrumb.Item>
                </Breadcrumb>
                <div style={{background: '#fff', padding: 24, minHeight: 640}}>
                    <Row>
                        <Col span={18}> <h2>本学期课程</h2> </Col>
                        <Col span={6}>
                            <Input.Search
                                placeholder="输入课程暗号加入课程"
                                enterButton="加入课程"
                                size="large"
                                onSearch={value => {
                                    ////console.log(value);
                                    const data = {
                                        user_id: this.props.id,
                                        course_spell: value
                                    };
                                    ajax_post(api_list['add_course'], data, this, (that, result) => {
                                        if (result.data.code === 1) {
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
                    {running_lesson.map((lesson)=>
                        <Col span={8}>
                            <Card style={{width: '100%', marginTop: 16}}
                                  actions={[
                                            <Tooltip title="查看通知">
                                                <div onClick={()=>{this.props.history.push({
                                                    pathname: "/studentlesson/"+parseInt(lesson.id),
                                                    state: {panel: '1'}
                                                })}}>
                                                <Icon type="notification" theme="twoTone" style={{padding: '0 5px'}} />
                                                </div>
                                            </Tooltip>,
                                            <Tooltip title="查看作业">
                                                <div onClick={()=>{this.props.history.push({
                                                    pathname: "/studentlesson/"+parseInt(lesson.id),
                                                    state: {panel: '2'}
                                                })}}>
                                                <Icon type="edit" theme="twoTone" style={{padding: '0 5px'}} />
                                                </div>
                                            </Tooltip>,
                                            <Tooltip title="查看课程信息">
                                                <div onClick={()=>{
                                                    this.props.history.push({
                                                        pathname: "/studentlesson/"+parseInt(lesson.id),
                                                        state: {panel: '3'},
                                                    })
                                                }} >
                                                <Icon type="info-circle" theme="twoTone" style={{padding: '0 5px'}} />
                                                </div>
                                            </Tooltip>]}>
                                <Meta title={<Link style={{fontSize: '200%'}} to={"/studentlesson/"+parseInt(lesson.id)}>{lesson.name}</Link>}
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

const StudentHomepageMiddle = withRouter(mStudentHomepageMiddle);

class StudentHomepage extends Component {
    render() {
        return (
            <div>
                <StudentHomepageMiddle state={this.props.state} id={this.props.id} role={this.props.role} />
            </div>
        )
    }
}

export {StudentHomepage};