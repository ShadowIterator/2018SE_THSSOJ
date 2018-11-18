import React, { Component } from 'react';

import {Container, Col, Row} from 'react-bootstrap';

import {Info, StudentLessonList} from "./lesson-component";

import {ZeroPadding} from "./lesson-component";
import {AuthContext} from "../basic-component/auth-context";
import {ajax_post} from "../ajax-utils/ajax-method";
import {api_list} from "../ajax-utils/api-manager";

class StudentHomepageMiddle extends Component {
    constructor(props) {
        super(props);
        this.state = {
            lessonlist: [],
            noticelist: [],
        }
        this.lessonlist = [];
        this.noticelist = [];
    }
    componentDidMount() {
        if(!this.context.state)
            return;
        const id = this.context.id;
        ajax_post(api_list['query_user'], {id:id}, this, StudentHomepageMiddle.query_user_callback);
    }
    static query_user_callback(that, result) {
        if(result.data.length === 0) {
            console.log("Query failed. No such user.");
            return;
        }
        const user = result.data[0];
        const lesson_ids = user.student_courses;
        console.log(lesson_ids);
        for(let lesson_id of lesson_ids) {
            ajax_post(api_list['query_course'], {id:lesson_id}, that, StudentHomepageMiddle.query_course_callback);
        }
    }
    static query_course_callback(that, result) {
        if(result.data.length === 0) {
            console.log("Query failed. No such course.");
            return;
        }
        const course = result.data[0];
        const name = course.name;
        const id = course.id;
        const notices = course.notices;
        that.lessonlist.push({id:id, name:name});
        for(let notice_id of notices) {
            that.noticelist.push(notice_id);
        }
        that.setState({noticelist:that.noticelist});
        that.setState({lessonlist:that.lessonlist});
    }
    render() {
        return (
            <>
            <Container fluid>
                <Row>
                    <Col lg={3} style={ZeroPadding}>
                        <StudentLessonList lessonlist={this.lessonlist} />
                    </Col>
                    <Col style={ZeroPadding}>
                        <Info noticelist={this.state.noticelist}/>
                    </Col>
                </Row>
            </Container>
            </>
        )
    }
}
StudentHomepageMiddle.contextType = AuthContext;

class StudentHomepage extends Component {
    render() {
        return (
            <>
                <StudentHomepageMiddle />
            </>
        )
    }
}

export {StudentHomepage};