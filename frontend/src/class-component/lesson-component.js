import React, { Component } from 'react';
import {
    Card,
    Menu,
    Tag,
} from "@blueprintjs/core";
import {AuthContext} from "../basic-component/auth-context";
import {ajax_get, ajax_post} from "../ajax-utils/ajax-method";
import {api_list} from "../ajax-utils/api-manager";


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
        this.state = {
            lessonnames: ['2018夏前端',
                '2019秋软件工程']
        }
    }
    render() {
        return (
            <div style={Spacing}>
            <h4>{this.props.listname}</h4>
            <Menu>
            {this.state.lessonnames.map((name)=><Menu.Item icon="book" text={name} />)}
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
        }
        this.lessonlist = [];
    }
    componentDidMount() {
        if(!this.context.state)
            return;
        const id = this.context.id;
        ajax_get(api_list['query_user'], {id:id}, this, StudentLessonList.query_user_callback);
    }
    static query_user_callback(that, result) {
        if(result.data.length === 0) {
            alert("Query failed. No such user.");
            return;
        }
        const user = result.data[0];
        const lesson_ids = user.student_course;
        console.log(lesson_ids);
        for(let lesson_id of lesson_ids) {
            ajax_get(api_list['query_course'], {id:lesson_id}, that, that.query_course_callback);
        }
        that.setState({lessonlist:that.lessonlist});
    }
    static query_course_callback(that, result) {
        if(result.data.length === 0) {
            alert("Query failed. No such course.");
            return;
        }
        const course = result.data[0];
        const name = course.name;
        const id = course.id;
        that.lesssonlist.push({id:id, name:name});
    }
    render() {
        return (
            <Card interactive={false} style={FullHeight}>
                <LessonList listname="课程" />
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
            ]
        }
    }
    render() {
        const lists = this.state.lessonlist.map(
            (name) => <LessonList listname={name}/>
        );
        return (
            <Card interactive={false} style={FullHeight}>
                {lists}
            </Card>
        )
    }
}

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