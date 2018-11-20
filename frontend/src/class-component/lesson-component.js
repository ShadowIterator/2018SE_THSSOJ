import React, { Component } from 'react';
import {
    Card,
    Menu,
    Tag,
} from "@blueprintjs/core";
import {withRouter} from "react-router";
import {AuthContext} from "../basic-component/auth-context";
import { AnchorButton, Button, Code, H5, Intent, Switch } from "@blueprintjs/core";
import {Bottombar} from "../basic-component/topbottom-bar";

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

class mLessonList extends Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }
    handleClick(event) {
        event.preventDefault();
        let id = event.target.id;
        id = id>=0? id:-id;
        let pathname;
        const id_param = '/' + id.toString();
        if(this.context.role===1) {
            pathname = '/studentlesson';
        } else if(this.context.role === 2) {
            pathname = '/talesson';
        }
        this.props.history.push({
            pathname: pathname + id_param,
            course_id: id,
        });
    }
    render() {
        return (
            <div style={Spacing}>
               <h4>{this.props.listname}</h4>
                <Button onClick={() => {
                    this.props.history.push('/createlesson');
                }}>创建课程</Button>
                <Menu>
                    {this.props.lessonlist.map((lesson)=>(<li>
                        <a id={(-lesson.id).toString()} onClick={this.handleClick} className="bp3-menu-item bp3-popover-dismiss">
                            <div id={lesson.id.toString()} className="bp3-text-overflow-ellipsis bp3-fill">{lesson.name}</div>
                        </a>
                        <Button onClick={() => {
                            this.props.history.push('/editlesson/'+lesson.id.toString());
                        }}>编辑</Button>
                        <Button>发布</Button>
                    </li>))}
                </Menu>
            </div>
        )
    }
}
mLessonList.contextType = AuthContext;
const LessonList = withRouter(mLessonList);

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
        // console.log(this.state);
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
                <h5>{this.props.title} <Tag key={this.props.type}>{this.props.type}</Tag></h5>
                <p>{this.props.content}</p>
            </Card>
        )
    }
}

class Info extends Component {
    render() {
        return (
            <Card interactive={false}>
                <h4>通知</h4>
                {this.props.infoitems.map((item)=>(
                    <InfoItem title={item.title} content={item.content} type="通知" />
                ))}
            </Card>
        )
    }
}


export {Info, StudentLessonList, TALessonList};
export {ZeroPadding, Spacing};