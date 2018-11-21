import React, { Component } from 'react';
import {Row, Col, Container} from "react-bootstrap";
import {TALessonList, Info} from "./lesson-component";
import {ajax_get, ajax_post} from "../ajax-utils/ajax-method";
import {api_list} from "../ajax-utils/api-manager";
import {AuthContext} from "../basic-component/auth-context";
import { AnchorButton, Button, Code, H5, Intent, Switch } from "@blueprintjs/core";
import {withRouter} from "react-router-dom"


import "../mock/course-mock";
import "../mock/auth-mock";
import "../mock/notice-mock";

const ZeroPadding = {
    "padding-left": 0,
    "padding-right": 0
};

class mTAHomepageMiddle extends Component {
    constructor(props) {
        super(props);
        this.state = {
            lessonlist: [
                "课程", "管理的课程", "未发布课程"
            ],
            stulesson: [],
            talesson: [],
            uplesson: [],
            infoitems: [],
        };
        this.stulesson = [];
        this.talesson = [];
        this.uplesson = [];
        this.infoitems = [];
        // this.clickCreateLesson = this.clickCreateLesson.bind(this);
    }
    componentDidMount() {
        if(!this.props.state || !this.props.id) {
            return;
        }
        const id = this.props.id;
        ajax_post(api_list['query_user'], {id:id}, this, TAHomepageMiddle.query_user_callback);
    }
    static query_user_callback(that, result) {
        if(result.data.length === 0) {
            console.log("Query failed. No such user.");
            return;
        }
        const user = result.data[0];
        const student_courses = user.student_courses;
        const ta_courses = user.ta_courses;
        for(let id of student_courses) {
            ajax_post(api_list['query_course'], {id:id}, that, TAHomepageMiddle.query_stu_course_callback);
        }
        console.log(ta_courses);
        for(let id of ta_courses) {
            ajax_post(api_list['query_course'], {id:id}, that, TAHomepageMiddle.query_ta_course_callback);
        }
    }
    static query_stu_course_callback(that, result) {
        if(result.data.length===0) {
            console.log("Cannot find course.");
            return;
        }
        const course = result.data[0];
        const name = course.name;
        const id = course.id;
        const notice_ids = course.notices;
        that.stulesson.push({id:id, name:name});
        for(let notice_id of notice_ids) {
            ajax_post(api_list['query_notice'], {id:notice_id}, that, TAHomepageMiddle.query_notice_callback);
        }
        that.setState({stulesson:that.stulesson});
    }
    static query_ta_course_callback(that, result) {
        if(result.data.length===0) {
            console.log("Cannot find course.");
            return;
        }
        const course = result.data[0];
        const name = course.name;
        const id = course.id;
        const status = course.status;
        const notice_ids = course.notices;
        for(let notice_id of notice_ids) {
            ajax_post(api_list['query_notice'], {id:notice_id}, that, TAHomepageMiddle.query_notice_callback);
        }
        if(status) {
            that.talesson.push({id:id, name:name});
            that.setState({talesson:that.talesson});
        } else {
            that.uplesson.push({id:id, name:name});
            that.setState({uplesson:that.uplesson});
        }
    }
    static query_notice_callback(that, result) {
        if(result.data.length===0)
            return;
        const title = result.data[0].title;
        const content = result.data[0].content;
        const id = result.data[0].id;
        that.infoitems.push({
            id:id,
            title:title,
            content:content,
        });
        that.setState({infoitems:that.infoitems});
    }
    // clickLesson(){
    //     this.props.history.push("/createlesson");
    // }
    render() {
        return (
            <Container fluid={true}>
                <Row>
                    <Col lg={3} style={ZeroPadding}>
                        <TALessonList state={this.props.state} id={this.props.id} role={this.props.role}
                                      lessonlist={this.state.lessonlist}
                                      stulesson={this.state.stulesson}
                                      talesson={this.state.talesson}
                                      uplesson={this.state.uplesson}/>
                    </Col>
                    <Col lg={9} style={ZeroPadding}>
                        <Info infoitems={this.state.infoitems}/>
                    </Col>
                </Row>
                <Button onClick={()=>{
                    this.props.history.push('/createlesson');
                }} >创建课程</Button>
            </Container>
        )

    }
}
mTAHomepageMiddle.contextType = AuthContext;
const TAHomepageMiddle = withRouter(mTAHomepageMiddle)

class TAHomepage extends Component {
    render() {
        return (
            <>
                <TAHomepageMiddle state={this.props.state} id={this.props.id} role={this.props.role} />
            </>
        )
    }
}

export {TAHomepage};