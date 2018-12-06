import React, { Component } from 'react';
import {
    Card,
} from "@blueprintjs/core";

import {Tabs, Tab} from 'react-bootstrap';

import {Info} from "./lesson-component";

import {Spacing} from "./lesson-component";
import {api_list} from "../ajax-utils/api-manager";
import {ajax_post} from "../ajax-utils/ajax-method";
import {withRouter, Link} from "react-router-dom";

import { Layout, Breadcrumb, Menu, Icon } from 'antd';
const {Content, Sider} = Layout;
const { SubMenu } = Menu;

// import "../mock/course-mock";
// import "../mock/auth-mock";
// import "../mock/notice-mock";
// import "../mock/homework-mock";
// import "../mock/problem-mock";


class mStudentHomeworkCard extends Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }
    handleClick(event) {
        event.preventDefault();
        let id = event.target.id;
        id = id>=0? id:-id;
        const id_param = '/' + id.toString();
        const homework_id = '/' + this.props.homework_id.toString();
        const pathname = '/problemdetail';
        const course_id = '/' + this.props.course_id.toString();
        this.props.history.push({
            pathname: pathname + id_param + homework_id + course_id,
        });
    }
    render() {
        return (
            <Card style={{margin: '20px'}}>
                <h5>{this.props.name}</h5>
                <Menu>
                    {this.props.questions.map((q)=>(<li>
                        <a id={(-q.id).toString()} onClick={this.handleClick} className="bp3-menu-item bp3-popover-dismiss">
                            <div id={q.id.toString()} className="bp3-text-overflow-ellipsis bp3-fill">{q.title}</div>
                        </a>
                    </li>))}
                </Menu>
            </Card>
        )
    }
}
const StudentHomeworkCard = withRouter(mStudentHomeworkCard);

class StudentHomeworkPanel extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        let homework2prob = {};
        for(let hw of this.props.homeworkitems) {
            homework2prob[hw.id.toString()] = [];
            const prob_ids = hw.problem_ids;
            for(let prob of this.props.problemitems) {
                if(prob_ids.includes(prob.id)) {
                    homework2prob[hw.id.toString()].push({
                        id:prob.id,
                        title:prob.title
                    });
                }
            }
        }
        return (
            <div>
                {this.props.homeworkitems.map((hw)=>(
                    <StudentHomeworkCard name={hw.name} questions={homework2prob[hw.id.toString()]} homework_id={hw.id} course_id={this.props.course_id} />
                ))}
            </div>
        )
    }
}

class StudentHomework extends Component {
    constructor(props) {
        super(props);
        this.state= {
            tabname: [
                "未完成作业", "已完成但未批改作业", "已批改作业", "全部作业"
            ],
            tabid: [
                'uh', 'su', 'sp', 'al'
            ],
            tabnum: [
                0, 1, 2, 3
            ],
            selectedId: 'uh'
        };
        this.handleChooseTab = this.handleChooseTab.bind(this);
    }

    handleChooseTab(newTabId, prevTabId, event) {
        this.setState({
            selectedId: newTabId
        })
    }

    render() {
        const tabname = this.state.tabname;
        const tabid = this.state.tabid;
        const tabnum = this.state.tabnum;
        const tabs = tabnum.map(
            (i) => <Tab eventKey={tabid[i]} title={tabname[i]}><StudentHomeworkPanel
                homeworkitems={this.props.homeworkitems} problemitems={this.props.problemitems}/></Tab>
        );
        return (
            <StudentHomeworkPanel
                homeworkitems={this.props.homeworkitems} problemitems={this.props.problemitems} course_id={this.props.course_id}/>
        )
    }
}

class mStudentLessonMiddle extends Component {
    constructor(props) {
        super(props);
        this.state = {
            infoitems: [],
            homeworkitems: [],
            problemitems: [],
            lesson_name: '',
            current_selected: '1',
        };
        this.infoitems = [];
        this.homeworkitems = [];
        this.problemitems = [];
        this.homeworkstatus = {};
    }
    componentDidMount() {
        const course_id = parseInt(this.props.course_id);
        ajax_post(api_list['query_course'], {id:course_id}, this, StudentLessonMiddle.query_course_callback);
    }
    static query_course_callback(that, result) {
        if(result.data.length===0)
            return;
        that.setState({lesson_name:result.data[0].name});
        const notice_ids = result.data[0].notices;
        const homework_ids = result.data[0].homeworks;
        for(let notice_id of notice_ids) {
            ajax_post(api_list['query_notice'], {id:notice_id}, that, StudentLessonMiddle.query_notice_callback);
        }
        for(let homework_id of homework_ids) {
            ajax_post(api_list['query_homework'], {id:homework_id}, that, StudentLessonMiddle.query_homework_callback);
        }
    }
    static query_homework_callback(that, result) {
        if(result.data.length===0)
            return;
        const hw = result.data[0];
        const id = hw.id;
        const name = hw.name;
        const deadline = hw.deadline;
        const problem_ids = hw.problems;
        that.homeworkitems.push({
            id:id,
            name:name,
            deadline:deadline,
            problem_ids:problem_ids,
        });
        that.homeworkstatus[id] = {};
        that.setState({homeworkitems:that.homeworkitems});
        for(let prob_id of problem_ids) {
            ajax_post(api_list['query_record'], {
                user_id: this.props.id,
                problem_id: prob_id,
                homework_id: id,
                record_type: 2,
            }, that, (that, result)=>{
                if(result.data.length === 0) {
                    that.homeworkstatus[id][prob_id] = 0;
                } else if(result.data[0].status === 0) {
                    that.homeworkstatus[id][prob_id] = 1;
                } else {
                    that.homeworkstatus[id][prob_id] = 2;
                }
            });
        }
        for(let prob_id of problem_ids) {
            ajax_post(api_list['query_problem'], {id:prob_id}, that, StudentLessonMiddle.query_problem_callback);
        }
    }
    static query_notice_callback(that, result) {
        if(result.data.length===0)
            return;
        const title = result.data[0].title;
        const content = result.data[0].content;
        const id = result.data[0].id;
        that.infoitems.push({id:id, title:title, content:content});
        that.setState({infoitems:that.infoitems});
    }
    static query_problem_callback(that, result) {
        if(result.data.code===1) {
            return;
        }
        if(result.data.length===0)
            return;
        const title = result.data[0].title;
        const id = result.data[0].id;
        that.problemitems.push({id:id, title:title});
        that.setState({problemitems:that.problemitems});
    }
    render() {
        this.infoitems.sort(function(a, b) {
            const ida = a.id;
            const idb = b.id;
            return (ida<idb) ? -1 : (ida>idb) ? 1 : 0;
        });
        this.problemitems.sort(function(a, b) {
            const ida = a.id;
            const idb = b.id;
            return (ida<idb) ? -1 : (ida>idb) ? 1 : 0;
        });
        this.homeworkitems.sort(function(a, b) {
            const ida = a.id;
            const idb = b.id;
            return (ida<idb) ? -1 : (ida>idb) ? 1 : 0;
        });
        let breadcrumb, panel;
        if(this.state.current_selected==='1') {
            breadcrumb=(<>
                <Breadcrumb.Item>作业</Breadcrumb.Item>
                <Breadcrumb.Item>未完成作业</Breadcrumb.Item>
            </>);
            let unfinished_homeworkitems = [];
            let unfinished_problemitems = [];
            for(const homework of this.homeworkitems) {
                const id = homework.id;
                let flag = 0;
                for(const prob_id in this.homeworkstatus[id]) {
                    if(this.homeworkstatus[id][prob_id]!==0) {
                        flag = 1;
                    }
                }
                if(flag === 0) {
                    unfinished_homeworkitems.push(homework);
                    for(const prob_id of homework.problem_ids) {
                        for(const prob_item of this.problemitems) {
                            if(prob_id === prob_item.id) {
                                let prob_item_new = prob_item;
                                prob_item_new.status = this.homeworkstatus[id][prob_id];
                                unfinished_problemitems.push(prob_item_new);
                            }
                        }
                    }
                }
            }
            panel=(<StudentHomework homeworkitems={unfinished_homeworkitems} problemitems={unfinished_problemitems} course_id={this.props.course_id}/>);

        } else if(this.state.current_selected==='2') {
            breadcrumb=(<>
                <Breadcrumb.Item>作业</Breadcrumb.Item>
                <Breadcrumb.Item>已完成但未批改作业</Breadcrumb.Item>
            </>);
            panel=(<StudentHomework homeworkitems={this.homeworkitems} problemitems={this.problemitems} course_id={this.props.course_id}/>);
        } else if(this.state.current_selected==='3') {
            breadcrumb=(<>
                <Breadcrumb.Item>作业</Breadcrumb.Item>
                <Breadcrumb.Item>已批改作业</Breadcrumb.Item>
            </>);
            panel=(<StudentHomework homeworkitems={this.homeworkitems} problemitems={this.problemitems} course_id={this.props.course_id}/>);
        } else if(this.state.current_selected==='4') {
            breadcrumb=(<>
                <Breadcrumb.Item>作业</Breadcrumb.Item>
                <Breadcrumb.Item>全部作业</Breadcrumb.Item>
            </>);
            panel=(<StudentHomework homeworkitems={this.homeworkitems} problemitems={this.problemitems} course_id={this.props.course_id}/>);
        } else if(this.state.current_selected==='5') {
            breadcrumb=(<Breadcrumb.Item>通知</Breadcrumb.Item>);
            panel=(<Info infoitems={this.infoitems}/>);
        } else if(this.state.current_selected==='6') {
            breadcrumb = (<Breadcrumb.Item>课程信息</Breadcrumb.Item>);
            panel=(<StudentHomework homeworkitems={this.homeworkitems} problemitems={this.problemitems} course_id={this.props.course_id}/>);
        }
        return (
            <Content style={{ padding: '0 50px' }}>
                <Breadcrumb style={{ margin: '16px 0' }}>
                    <Breadcrumb.Item>
                        <Link to={"/student"}>Home</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <Link to={"/studentlesson/"+parseInt(this.props.course_id)}>
                            {this.state.lesson_name}
                        </Link>
                    </Breadcrumb.Item>
                    {breadcrumb}
                </Breadcrumb>
                <Layout style={{ padding: '24px 0', background: '#fff' }}>
                    <Sider width={200} style={{ background: '#fff' }}>
                        <Menu
                            onClick={(e)=>{this.setState({current_selected: e.key})}}
                            mode="inline"
                            defaultSelectedKeys={['1']}
                            defaultOpenKeys={['sub1']}
                            style={{ height: '100%' }}
                        >
                            <SubMenu key="sub1" title={<span><Icon type="edit" theme="twoTone" />作业</span>}>
                                <Menu.Item key="1">未完成作业</Menu.Item>
                                <Menu.Item key="2">已提交但未批改作业</Menu.Item>
                                <Menu.Item key="3">已批改作业</Menu.Item>
                                <Menu.Item key="4">全部作业</Menu.Item>
                            </SubMenu>
                            <Menu.Item key="5"><Icon type="notification" theme="twoTone" />通知</Menu.Item>
                            <Menu.Item key="6"><Icon type="info-circle" theme="twoTone" />课程信息</Menu.Item>
                        </Menu>
                    </Sider>
                    <Content style={{ padding: '0 24px', minHeight: 280 }}>
                        {panel}
                    </Content>
                </Layout>
            </Content>
        )
    }
}

const StudentLessonMiddle = withRouter(mStudentLessonMiddle);

export class StudentLesson extends Component {
    render() {
        return (
            <div>
                <StudentLessonMiddle course_id={this.props.lesson_id} id={this.props.id} state={this.props.state} />
            </div>
        )
    }
}