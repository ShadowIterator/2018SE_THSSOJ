import React, { Component } from 'react';

import {Container, Col, Row, Tabs, Tab} from 'react-bootstrap';

import {ZeroPadding, Spacing} from "./lesson-component";
import {withRouter} from "react-router";
import { AnchorButton, Button, Code, H5, Intent, Switch } from "@blueprintjs/core";
import {AddNewNotice} from "./TA-lesson-component";

class mTALessonPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            clickNewnotice: false,
        }
        this.clickNewnotice = this.clickNewnotice.bind(this);
    }

    clickNewnotice(event){
        event.preventDefault();
        event.stopPropagation();
        this.setState({
            clickNewnotice: true,
        })
    }

    newnotice_callback(){
        this.setState({
            clickNewnotice: false,
        })
    }

    render() {
        let content;
        if (this.props.tabname === "作业"){
            content = <></>;
        } else
        if (this.props.tabname === "成绩"){
            content = <></>;
        } else
        if (this.props.tabname === "通知"){
            if (this.state.clickNewnotice) {
                content = <AddNewNotice newnotice_callback={this.newnotice_callback}/>;
            } else
            {
                content = (<>
                            <Button onClick={this.clickNewnotice}>
                                新建通知
                            </Button>
                            </>);
            }
        } else
        {
            content = <></>;
        }
        return (
            <div>
                <h1>{this.props.tabname}</h1>
                {content}
            </div>
        );
    }
}

const TALessonPanel =  withRouter(mTALessonPanel);

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
            (i) => <Tab eventKey={tabid[i]} title={tabname[i]}><TALessonPanel tabname={tabname[i]}/></Tab>
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