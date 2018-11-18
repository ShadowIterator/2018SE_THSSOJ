import React, { Component } from 'react';
import {Row, Col, Container} from "react-bootstrap";
import {TALessonList, Info} from "./lesson-component";
import {ajax_post} from "../ajax-utils/ajax-method";
import {api_list} from "../ajax-utils/api-manager";
import {AuthContext} from "../basic-component/auth-context";

const ZeroPadding = {
    "padding-left": 0,
    "padding-right": 0
};

class TAHomepageMiddle extends Component {
    constructor(props) {
        super(props);
        this.state = {
            lessonlist: [
                "课程", "管理的课程", "未发布课程"
            ],
            stulesson: [],
            talesson: [],
            uplesson: [],
            noticelist: [],
        };
        this.stulesson = [];
        this.talesson = [];
        this.uplesson = [];
        this.noticelist = [];
    }
    componentDidMount() {
        if(!this.context.state) {
            return;
        }
        const id = this.context.id;
        ajax_post(api_list['query_user'], {id:id}, this, TAHomepageMiddle.query_user_callback);
    }
    static query_user_callback(that, result) {
        if(result.data.length === 0) {
            console.log("Query failed. No such user.");
            return;
        }
        const user = result.data[0];
        const student_courses = user.student_courses;
        const TA_courses = user.TA_courses;
        for(let id of student_courses) {
            ajax_post(api_list['query_course'], {id:id}, that, TAHomepageMiddle.query_stu_course_callback);
        }
        for(let id of TA_courses) {
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
            that.noticelist.push(notice_id);
        }
        that.setState({noticelist:that.noticelist});
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
            that.noticelist.push(notice_id);
        }
        that.setState({noticelist:that.noticelist});
        if(status) {
            that.talesson.push({id:id, name:name});
            that.setState({talesson:that.talesson});
        } else {
            that.uplesson.push({id:id, name:name});
            that.setState({uplesson:that.uplesson});
        }
    }
    render() {
        return (
            <Container fluid={true}>
                <Row>
                    <Col lg={3} style={ZeroPadding}>
                        <TALessonList lessonlist={this.state.lessonlist}
                                        stulesson={this.state.stulesson}
                                        talesson={this.state.talesson}
                                        uplesson={this.state.uplesson}/>
                    </Col>
                    <Col lg={9} style={ZeroPadding}>
                        <Info noticelist={this.state.noticelist}/>
                    </Col>
                </Row>
            </Container>
        )

    }
}
TAHomepageMiddle.contextType = AuthContext;

class TAHomepage extends Component {
    render() {
        return (
            <>
                <TAHomepageMiddle />
            </>
        )
    }
}

export {TAHomepage};