import React, { Component } from 'react';
import {
    Tab,
    Tabs,
    Card,
    Menu
} from "@blueprintjs/core";

import {Container, Col, Row} from 'react-bootstrap';

import {Info} from "./lesson-component";

import {ZeroPadding, Spacing} from "./lesson-component";
import {api_list} from "../ajax-utils/api-manager";
import {ajax_post} from "../ajax-utils/ajax-method";

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
                "未提交作业", "已提交但为批改作业", "已批改作业", "全部作业"
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
            (i) => <Tab id={tabid[i]} title={tabname[i]} panel={<StudentHomeworkPanel />} />
        );
        // var tabs = <Tab id={tabid[0]} title={tabname[0]} />;
        // for(var i=0;i<tabname.length;i=i+1) {
        //     tabs.push(<Tab id={tabid[i]} title={tabname[i]} panel={<StudentHomeworkPanel />} />);
        // }
        return (
            <Tabs
                animate={true}
                large={true}
                id="StudentHomework"
                selectedTabId={this.state.selectedId}
                onChange={this.handleChooseTab}
            >
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
            noticelist: [],
        };
        this.noticelist = [];
    }
    componentDidMount() {
        const course_id = this.props.location.course_id;
        ajax_post(api_list['query_course'], {id:course_id}, this, StudentLessonMiddle.query_course_callback);
    }
    static query_course_callback(that, result) {
        const notice_ids = result.data.notices;
        for(let notice_id of notice_ids) {
            ajax_post(api_list['query_notice'], {id:notice_id}, that, StudentLessonMiddle.query_notice_callback);
        }
    }
    static query_notice_callback(that, result) {
        const title = result.data.title;
        const content = result.data.content;
        that.noticelist.push({title:title, content:content});
        that.setState({noticelist:that.noticelist});
    }
    render() {
        return (
            <Container fluid>
                <Row>
                    <Col lg={9} style={ZeroPadding}>
                        <StudentHomework/>
                    </Col>
                    <Col lg={3} style={ZeroPadding}>
                        <Info noticelist={this.state.noticelist}/>
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
                <StudentLessonMiddle />
            </>
        )
    }
}