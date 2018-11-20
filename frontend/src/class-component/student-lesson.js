import React, { Component } from 'react';
import {
    Card,
    Menu
} from "@blueprintjs/core";

import {Container, Col, Row, Tabs, Tab} from 'react-bootstrap';

import {Info} from "./lesson-component";

import {ZeroPadding, Spacing} from "./lesson-component";
import {api_list} from "../ajax-utils/api-manager";
import {ajax_post} from "../ajax-utils/ajax-method";
import {withRouter} from "react-router";

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
        const pathname = '/problemdetail';
        this.props.history.push({
            pathname: pathname + id_param,
            problem_id: id,
        });
    }
    render() {
        return (
            <Card style={Spacing}>
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
            <Card>
                {this.props.homeworkitems.map((hw)=>(
                    <StudentHomeworkCard name={hw.name} questions={homework2prob[hw.id.toString()]} />
                ))}
            </Card>
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
            <Tabs defaultActiveKey={tabid[0]} id="homework-tab">
                {tabs}
            </Tabs>
        )
    }
}

class StudentLessonMiddle extends Component {
    constructor(props) {
        super(props);
        this.state = {
            infoitems: [],
            homeworkitems: [],
            problemitems: [],
        };
        this.infoitems = [];
        this.homeworkitems = [];
        this.problemitems = [];
    }
    componentDidMount() {
        const course_id = parseInt(this.props.course_id);
        ajax_post(api_list['query_course'], {id:course_id}, this, StudentLessonMiddle.query_course_callback);
    }
    static query_course_callback(that, result) {
        if(result.data.length===0)
            return;
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
        that.setState({homeworkitems:that.homeworkitems});
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
        return (
            <Container fluid>
                <Row>
                    <Col lg={9} style={ZeroPadding}>
                        <StudentHomework homeworkitems={this.homeworkitems} problemitems={this.problemitems}/>
                    </Col>
                    <Col lg={3} style={ZeroPadding}>
                        <Info infoitems={this.infoitems}/>
                    </Col>
                </Row>
            </Container>
        )
    }
}

export class StudentLesson extends Component {
    render() {
        return (
            <>
                <StudentLessonMiddle course_id={this.props.lesson_id} id={this.props.id} state={this.props.state} />
            </>
        )
    }
}