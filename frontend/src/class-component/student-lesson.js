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

import "../mock/course-mock";
import "../mock/auth-mock";
import "../mock/notice-mock";

class StudentHomeworkCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '第一次作业',
            questions: [
                '两数求和','数组排序'
            ]
        }
    }
    render() {
        return (
            <Card style={Spacing}>
                <h5>{this.state.name}</h5>
                <Menu>
                    {this.state.questions.map(
                        (name)=><Menu.Item icon="code" text={name} />
                    )}
                </Menu>
            </Card>
        )
    }
}

class StudentHomeworkPanel extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <Card>
                <StudentHomeworkCard />
                <StudentHomeworkCard />
                <StudentHomeworkCard />
                <StudentHomeworkCard />
                <StudentHomeworkCard />
                <StudentHomeworkCard />
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
            (i) => <Tab eventKey={tabid[i]} title={tabname[i]}><StudentHomeworkPanel/></Tab>
        );
        return (
            <Tabs defaultActiveKey={tabid[0]} id="homework-tab">
                {tabs}
            </Tabs>
        )
        // return null;
    }
}

class StudentLessonMiddle extends Component {
    constructor(props) {
        super(props);
        this.state = {
            infoitems: [],
            homeworkitems: [],
        };
        this.infoitems = [];
        this.homeworkitems = [];
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
    render() {
        return (
            <Container fluid>
                <Row>
                    <Col lg={9} style={ZeroPadding}>
                        <StudentHomework/>
                    </Col>
                    <Col lg={3} style={ZeroPadding}>
                        <Info infoitems={this.state.infoitems}/>
                    </Col>
                </Row>
            </Container>
        )
    }
}

export class StudentLesson extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <>
                <StudentLessonMiddle course_id={this.props.location.course_id} />
            </>
        )
    }
}