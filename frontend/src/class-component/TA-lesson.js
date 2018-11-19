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

class TALessonTabs extends Component {
    constructor(props) {
        super(props);
        this.state= {
            tabname: [
                "作业", "成绩", "通知", "课程信息"
            ],
            tabid: [
                'hw', 'sc', 'nt', 'in'
            ],
            tabnum: [
                0, 1, 2, 3
            ],
            selectedId: 'hw'
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
            (i) => <Tab eventKey={tabid[i]} title={tabname[i]}><h1>{tabname[i]}</h1></Tab>
        );
        return (
            <Tabs defaultActiveKey={tabid[0]} id="homework-tab">
                {tabs}
            </Tabs>
        )
    }
}

class TALessonMiddle extends Component {
    constructor(props) {
        super(props);
        // this.state = {
        //     infoitems: [],
        //     homeworkitems: [],
        // };
        // this.infoitems = [];
        // this.homeworkitems = [];
    }

    render() {
        return (
            <Container fluid>
                <Row>
                    <Col lg={12} style={ZeroPadding}>
                        <TALessonTabs/>
                    </Col>
                </Row>
            </Container>
        )
    }
}

export class TALesson extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <TALessonMiddle/>
        )
    }

}