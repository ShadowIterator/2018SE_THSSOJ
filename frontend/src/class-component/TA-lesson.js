import React, { Component } from 'react';

import {Container, Col, Row, Tabs, Tab} from 'react-bootstrap';

import {ZeroPadding, Spacing} from "./lesson-component";
import {Info} from "./lesson-component";
import {withRouter} from "react-router";
import { AnchorButton, Button, Code, H5, Intent, Switch } from "@blueprintjs/core";
import {AddNewNotice, TANoticeList} from "./TA-lesson-component";
import {ajax_post} from "../ajax-utils/ajax-method";
import {api_list} from "../ajax-utils/api-manager";

class mTALessonPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            clickNewnotice: false,
            infoitems: []
        };
        this.clickNewnotice = this.clickNewnotice.bind(this);
        this.query_notice_callback = this.query_notice_callback.bind(this);
        this.newnotice_callback = this.newnotice_callback.bind(this);
    }

    componentDidMount() {
        // console.log("componentDidMount");
        if (this.props.stu_id===-1 ||
            this.props.course_name==='') {
            return;
        }

        const course_id = this.props.course_id;
        ajax_post(api_list['query_notice'], {course_id:course_id}, this, this.query_notice_callback);
    }

    componentWillUpdate(nextProps) {
        // console.log('componentWillUpdate');
        if(nextProps.stu_id===-1)
            return;
        if(nextProps.stu_id !== this.props.stu_id ||
            nextProps.course_id !== this.props.course_id) {
            console.log(nextProps.course_id);
            const course_id = nextProps.course_id;
            ajax_post(api_list['query_notice'], {course_id: course_id}, this, this.query_notice_callback);
        }
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
        console.log(this.props.course_id);
        ajax_post(api_list['query_notice'], {course_id: this.props.course_id}, this, this.query_notice_callback);
    }

    query_notice_callback(that, result) {
        if (result.data.length === 0) {
            console.log("No notice got!");
            // return;
        }

        let infoItems = [];
        for (let index in result.data) {
            let item = {
                id: result.data[index].id,
                title: result.data[index].title,
                content: result.data[index].content
            };
            infoItems.push(item);
        }

        that.setState( {infoitems: infoItems} );
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
                                         stu_id={this.props.stu_id}
                                         course_id={this.props.course_id}
                                         course_name={this.props.course_name}/>);
            } else
            {
                content = (<TANoticeList infoitems={this.state.infoitems} newNotice={this.clickNewnotice}/>);
            }
        } else
        {
            content = <></>;
        }
        return (
            <div>
                {/*<h1>{this.props.tabname}</h1>*/}
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
            (i) => <Tab eventKey={tabid[i]} title={tabname[i]}><TALessonPanel stu_id={this.props.stu_id} course_id={this.props.course_id} course_name={this.props.course_name} tabname={tabname[i]}/></Tab>
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
            <h1>{this.props.course_name}</h1>
            <Container fluid>
                <Row>
                    <Col lg={12} style={ZeroPadding}>
                        <TALessonTabs stu_id={this.props.stu_id} course_id={this.props.course_id} course_name={this.props.course_name}/>
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
        // console.log("props id");
        // console.log(this.props.id);
        this.state = {
            course_name: '',
        };
    }

    componentDidMount() {
        // console.log("TALesson componentDidMount");
        const course_id = parseInt(this.props.lesson_id);
        console.log(course_id);
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
            <Container>
                <TALessonMiddle stu_id={this.props.id} course_id={parseInt(this.props.lesson_id)} course_name={this.state.course_name}/>
            </Container>
        );
    }

}