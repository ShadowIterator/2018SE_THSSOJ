import React, { Component } from 'react';

import {Container, Col, Row, Tabs, Tab} from 'react-bootstrap';

import {ZeroPadding, Spacing} from "./lesson-component";
import {withRouter} from "react-router";
import { AnchorButton, Button, Code, H5, Intent, Switch } from "@blueprintjs/core";
import {AddNewNotice} from "./TA-lesson-component";
import {ajax_post} from "../ajax-utils/ajax-method";
import {api_list} from "../ajax-utils/api-manager";

class mTALessonPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            clickNewnotice: false,
        };
        this.clickNewnotice = this.clickNewnotice.bind(this);
    }

    clickNewnotice(event){
        event.preventDefault();
        event.stopPropagation();
        this.setState({
            clickNewnotice: true,
        });
    }

    newnotice_callback(){
        this.setState({
            clickNewnotice: false,
        });
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
                content = (<AddNewNotice newnotice_callback={this.newnotice_callback}
                                        course_id={this.props.id}
                                        course_name={this.props.name}/>);
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
            (i) => <Tab eventKey={tabid[i]} title={tabname[i]}><TALessonPanel id={this.props.id} name={this.props.name} tabname={tabname[i]}/></Tab>
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
            <div>
            <h1>{this.props.name}</h1>
            <Container fluid>
                <Row>
                    <Col lg={12} style={ZeroPadding}>
                        <TALessonTabs id={this.props.id} name={this.props.name}/>
                    </Col>
                </Row>
            </Container>
            </div>
        )
    }
}

export class TALesson extends Component {
    constructor(props) {
        super(props);
        this.state = {
            course_name: '',
        };
    }

    componentDidMount() {
        console.log("componentDidMount");
        console.log(typeof this.props.lesson_id);
        const course_id = parseInt(this.props.lesson_id);
        ajax_post(api_list['query_course'], {id:course_id}, this, TALesson.query_course_callback);
    }

    static query_course_callback(that, result) {
        if (result.data.length === 0){
            console.log("result.data.length === 0");
            return;
        }

        that.setState({
            course_name: result.data[0].name,
        });
    }



    render() {
        console.log(this.state.course_name);
        return (
            <TALessonMiddle id={this.props.course_id} name={this.state.course_name}/>
        );
    }

}