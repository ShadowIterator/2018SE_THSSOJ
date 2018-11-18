import React, { Component } from 'react';
import {
    Card,
    Menu,
    Tag,
    Button
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
        let id = event.target.id;
        id = id>=0? id:-id;
        console.log(id);
        // alert("You choose course no."+ id);
    }
    render() {
        return (
            <div style={Spacing}>
               <h4>{this.props.listname}</h4>
                <Menu>
                    {this.props.lessonlist.map((lesson)=>(<li>
                        <a id={(-lesson.id).toString()} onClick={this.handleClick} className="bp3-menu-item bp3-popover-dismiss">
                            <div id={lesson.id.toString()} className="bp3-text-overflow-ellipsis bp3-fill">{lesson.name}</div>
                        </a>
                    </li>))}
                </Menu>
            </div>
        )
    }
}

class StudentLessonList extends Component {
    render() {
        return (
            <Card interactive={false} style={FullHeight}>
                <LessonList listname="课程" lessonlist={this.props.lessonlist} />
            </Card>
        )
    }
}

class TALessonList extends Component {
    render() {
        const lists = (
            <>
                <LessonList listname={this.props.lessonlist[0]} lessonlist={this.props.stulesson} />
                <LessonList listname={this.props.lessonlist[1]} lessonlist={this.props.talesson} />
                <LessonList listname={this.props.lessonlist[2]} lessonlist={this.props.uplesson} />
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

const InfoItemStyle = {
    "margin-top": "10px",
    "margin-bottom": "10px"
};

class InfoItem extends Component {
    render() {
        return (
            <Card interactive={true} style={InfoItemStyle}>
                <h5>{this.props.lessonname} <Tag key={this.props.type}>{this.props.type}</Tag></h5>
                <p>{this.props.content}</p>
            </Card>
        )
    }
}

class Info extends Component {
    constructor(props) {
        super(props);
        this.state = {
            infoitems: [],
        };
        this.infoitems = [];
    }
    componentDidMount() {
        for(let id of this.props.noticelist) {
            ajax_get(api_list['query_notice'], {id:id}, this, Info.query_notice_callback);
        }
    }
    static query_notice_callback(that, result) {
        const title = result.data.title;
        const content = result.data.content;
        that.infoitems.push({title:title,content:content});
        that.setState({infoitems:that.infoitems});
    }
    render() {
        return (
            <Card interactive={false}>
                <h4>通知</h4>
                {this.state.infoitems.map((item)=>(
                    <InfoItem title={item.title} content={item.content} type="通知" />
                ))}
            </Card>
        )
    }
}


export {Info, StudentLessonList, TALessonList};
export {ZeroPadding, Spacing};