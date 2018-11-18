import React, { Component } from 'react';
import {
    Card,
    Menu,
    Tag,
} from "@blueprintjs/core";
import {AuthContext} from "../basic-component/auth-context";
import {ajax_get, ajax_post} from "../ajax-utils/ajax-method";
import {api_list} from "../ajax-utils/api-manager";

import "../mock/course-mock";
import "../mock/auth-mock";

const ZeroPadding = {
    "padding-left": 0,
    "padding-right": 0
};

const FullHeight = {
    "height": '100%',
    // "position": "fixed",
    "width": "100%"
};

const Spacing = {
    // "margin-top": "20px",
    "margin-bottom": "40px"
};

class LessonList extends Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }
    handleClick(event) {
        // event.persist();
        // console.log(event.target.id);
        alert("You choose course no."+ event.target.id);
    }
    render() {
        return (
            <div style={Spacing}>
               <h4>{this.props.listname}</h4>
                <Menu>
                    {this.props.lessonlist.map((lesson)=><Menu.Item id={lesson.id.toString()} key={lesson.id.toString()}
                                                                    icon="book" text={lesson.name} onClick={this.handleClick}/>)}
                </Menu>
            </div>
        )
    }
}

class StudentLessonList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            lessonlist: [],
        };
        this.lessonlist = [];
    }
    componentDidMount() {
        if(!this.context.state)
            return;
        const id = this.context.id;
        ajax_post(api_list['query_user'], {id:id}, this, StudentLessonList.query_user_callback);
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
            ajax_post(api_list['query_course'], {id:lesson_id}, that, StudentLessonList.query_course_callback);
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
        that.lessonlist.push({id:id, name:name});
        that.setState({lessonlist:that.lessonlist});
    }
    render() {
        return (
            <Card interactive={false} style={FullHeight}>
                <LessonList listname="课程" lessonlist={this.state.lessonlist} />
            </Card>
        )
    }
}
StudentLessonList.contextType = AuthContext;

class TALessonList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            lessonlist: [
                "课程", "管理的课程", "未发布课程"
            ],
            stulesson: [],
            talesson: [],
            uplesson: [],
        };
        this.stulesson = [];
        this.talesson = [];
        this.uplesson = [];
    }
    componentDidMount() {
        if(!this.context.state) {
            return;
        }
        const id = this.context.id;
        ajax_post(api_list['query_user'], {id:id}, this, TALessonList.query_user_callback);
    }
    static query_user_callback(that, result) {
        if(result.data.length === 0) {
            alert("Query failed. No such user.");
            return;
        }
        const user = result.data[0];
        const student_courses = user.student_courses;
        const TA_courses = user.TA_courses;
        for(let id of student_courses) {
            ajax_post(api_list['query_course'], {id:id}, that, TALessonList.query_stu_course_callback);
        }
        for(let id of TA_courses) {
            ajax_post(api_list['query_course'], {id:id}, that, TALessonList.query_ta_course_callback);
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
        that.stulesson.push({id:id, name:name});
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
        if(status) {
            that.talesson.push({id:id, name:name});
            that.setState({talesson:that.talesson});
        } else {
            that.uplesson.push({id:id, name:name});
            that.setState({uplesson:that.uplesson});
        }
    }
    render() {
        const lists = (
            <>
                <LessonList listname={this.state.lessonlist[0]} lessonlist={this.state.stulesson} />
                <LessonList listname={this.state.lessonlist[1]} lessonlist={this.state.talesson} />
                <LessonList listname={this.state.lessonlist[2]} lessonlist={this.state.uplesson} />
            </>
        );
        console.log(this.state);
        return (
            <Card interactive={false} style={FullHeight}>
                {lists}
            </Card>
        )
    }
}
TALessonList.contextType = AuthContext;

const InfoItemStyle = {
    "margin-top": "10px",
    "margin-bottom": "10px"
};

class InfoItem extends Component {
    constructor(props) {
        super(props);
        this.state={
            lessonname: "2018夏前端",
            type: "新作业",
            content: "新作业已发布请及时查看"
        }
    }
    render() {
        return (
            <Card interactive={true} style={InfoItemStyle}>
                <h5>{this.state.lessonname} <Tag key={this.state.type}>{this.state.type}</Tag></h5>
                <p>{this.state.content}</p>
            </Card>
        )
    }
}

class Info extends Component {
    render() {
        return (
            <Card interactive={false}>
                <h4>通知</h4>
                <InfoItem />
                <InfoItem />
                <InfoItem />
                <InfoItem />
                <InfoItem />
                <InfoItem />
            </Card>
        )
    }
}


export {Info, StudentLessonList, TALessonList};
export {ZeroPadding, Spacing};