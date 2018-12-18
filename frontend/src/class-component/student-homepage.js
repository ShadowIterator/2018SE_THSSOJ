import React, { Component } from 'react';

import {ajax_post} from "../ajax-utils/ajax-method";
import {api_list} from "../ajax-utils/api-manager";

import {withRouter, Link} from "react-router-dom";
import moment from "moment"
import { Layout, Breadcrumb, Card, Row, Col, Icon, Tooltip, Badge } from 'antd';
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
        const id = this.props.id;
        ajax_post(api_list['query_user'], {id:id}, this, StudentHomepageMiddle.query_user_callback);
    }
    componentWillUpdate(nextProps) {
        if(nextProps.id===-1)
            return;
        if(nextProps.id !== this.props.id) {
            ajax_post(api_list['query_user'], {id:nextProps.id}, this, StudentHomepageMiddle.query_user_callback);
        }
    }
    static query_user_callback(that, result) {
        if(result.data.length === 0) {
            console.log("Query failed. No such user.");
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
            console.log("Query failed. No such course.");
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
                    <h2>本学期课程</h2>
                    <Row gutter={16}>
                    {running_lesson.map((lesson)=>
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