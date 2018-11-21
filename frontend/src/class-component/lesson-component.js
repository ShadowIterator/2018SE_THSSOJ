import React, { Component } from 'react';
import {
    Menu,
    Card,
    Tag,
    Button
} from "@blueprintjs/core";
import {Col, Row} from "react-bootstrap";
import {withRouter} from "react-router";
import {AuthContext} from "../basic-component/auth-context";

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
        console.log("handleClick()");
        event.preventDefault();
        let id = event.target.id;
        id = id>=0? id:-id;
        let pathname;
        const id_param = '/' + id.toString();
        if(this.props.role===1) {
            pathname = '/studentlesson';
        } else if(this.props.role === 2) {
            pathname = '/talesson';
        }
        console.log(pathname);
        this.props.history.push({
            pathname: pathname + id_param,
        });
    }
    render() {
        return (
            <div style={Spacing}>
                <Row>
                    <Col lg={8}>
                        <h4>{this.props.listname}</h4>
                    </Col>
                    <Col lg={4}>
                        {this.props.role === 2 && this.props.listname === '未发布课程' &&
                            <Button onClick={() => {
                                this.props.history.push('/createlesson');
                            }}>创建课程</Button>
                        }
                    </Col>
                </Row>
                <Menu>
                    {this.props.lessonlist.map((lesson)=>(<li>
                        <Row style={{width: '100%'}}>
                            <Col lg={6}>
                                <a id={(-lesson.id).toString()} onClick={this.handleClick} className="bp3-menu-item bp3-popover-dismiss">
                                    <div id={lesson.id.toString()} className="bp3-text-overflow-ellipsis bp3-fill">{lesson.name}</div>
                                </a>
                            </Col>
                            {this.props.role === 2 && this.props.listname === '未发布课程' &&
                                <Col lg={6}>
                                    <Button onClick={() => {
                                        this.props.history.push('/editlesson/' + lesson.id.toString());
                                    }}>编辑</Button>
                                    <Button>发布</Button>
                                </Col>
                            }
                        </Row>
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
                <LessonList state={this.props.state} id={this.props.id} role={this.props.role} listname="课程" lessonlist={this.props.lessonlist} />
            </Card>
        )
    }
}

class TALessonList extends Component {
    render() {
        const lists = (
            <>
                <LessonList state={this.props.state} id={this.props.id} role={this.props.role} listname={this.props.lessonlist[0]} lessonlist={this.props.stulesson} />
                <LessonList state={this.props.state} id={this.props.id} role={this.props.role} listname={this.props.lessonlist[1]} lessonlist={this.props.talesson} />
                <LessonList state={this.props.state} id={this.props.id} role={this.props.role} listname={this.props.lessonlist[2]} lessonlist={this.props.uplesson} />
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