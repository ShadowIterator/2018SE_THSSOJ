import React, { Component } from 'react';

import {Container, Col, Row} from 'react-bootstrap';

import {Info, StudentLessonList} from "./lesson-component";

import {ZeroPadding} from "./lesson-component";
import {ajax_post} from "../ajax-utils/ajax-method";
import {api_list} from "../ajax-utils/api-manager";

import "../mock/course-mock";
import "../mock/auth-mock";
import "../mock/notice-mock";

class StudentHomepageMiddle extends Component {
    constructor(props) {
        super(props);
        this.state = {
            lessonlist: [],
            infoitems: [],
        };
        this.infoitems = [];
        this.lessonlist = [];
    }
    componentDidMount() {
        if(!this.props.state || this.props.id===undefined)
            return;
        const id = this.props.id;
        ajax_post(api_list['query_user'], {id:id}, this, StudentHomepageMiddle.query_user_callback);
    }
    componentWillUpdate(nextProps) {
        if(nextProps.id===undefined)
            return;
        if(nextProps.id !== this.props.id) {
            ajax_post(api_list['query_user'], {id:nextProps.id}, this, StudentHomepageMiddle.query_user_callback);
        }
    }
    static query_user_callback(that, result) {
        if(result.data.length === 0) {
            console.log("Query failed. No such user.");
            return;
        }
        const user = result.data[0];
        const lesson_ids = user.student_courses? user.student_courses:[];
        // console.log(lesson_ids);
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
            ajax_post(api_list['query_notice'],{id:notice_id}, that, StudentHomepageMiddle.query_notice_callback);
        }
        that.setState({lessonlist:that.lessonlist});
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
    render() {
        this.lessonlist.sort(function(a, b) {
            const ida = a.id;
            const idb = b.id;
            return (ida<idb) ? -1 : (ida>idb) ? 1 : 0;
        });
        this.infoitems.sort(function(a, b) {
            const ida = a.id;
            const idb = b.id;
            return (ida<idb) ? -1 : (ida>idb) ? 1 : 0;
        });
        return (
            <>
            <Container fluid>
                <Row>
                    <Col lg={3} style={ZeroPadding}>
                        <StudentLessonList state={this.props.state} id={this.props.id} role={this.props.role} lessonlist={this.lessonlist} />
                    </Col>
                    <Col style={ZeroPadding}>
                        <Info infoitems={this.infoitems}/>
                    </Col>
                </Row>
            </Container>
            </>
        )
    }
}

class StudentHomepage extends Component {
    render() {
        return (
            <>
                <StudentHomepageMiddle state={this.props.state} id={this.props.id} role={this.props.role} />
            </>
        )
    }
}

export {StudentHomepage};