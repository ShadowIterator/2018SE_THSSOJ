import React, { Component } from 'react';
import {
    Menu,
    Card,
    Tag,
    Button,
    ButtonGroup
} from "@blueprintjs/core";
import {Col, Row, Container} from "react-bootstrap";
import {withRouter} from "react-router";
import {AuthContext} from "../basic-component/auth-context";
import {ajax_post} from "../ajax-utils/ajax-method";
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

class mLessonList extends Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }
    handleClick(event) {
        if(this.props.listname === '未发布课程') {
            return;
        }
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
        let lessonlist = this.props.lessonlist;
        lessonlist.sort(function(a, b){
            const ida = a.id;
            const idb = b.id;
            return (ida<idb) ? -1 : (ida>idb) ? 1 : 0;
        });
        return (
            <div style={Spacing}>
                {this.props.role === 2 && this.props.listname === '未发布课程' &&
                <Row>
                    <Col lg={8}>
                        <h4>{this.props.listname}</h4>
                    </Col>
                    <Col lg={4}>
                        <Button onClick={() => {
                            this.props.history.push('/createlesson');
                        }}>创建课程</Button>
                    </Col>
                </Row>
                }
                {(this.props.role !== 2 || this.props.listname !== '未发布课程') &&
                    <h4>{this.props.listname}</h4>
                }
                <Menu>
                    {lessonlist.map((lesson)=>(<li>
                        {this.props.role === 2 && this.props.listname === '未发布课程' &&
                        <Row style={{width: '100%'}}>
                            <Col lg={8}>
                                <a id={(-lesson.id).toString()} onClick={this.handleClick}
                                   className="bp3-menu-item bp3-popover-dismiss">
                                    <div id={lesson.id.toString()}
                                         className="bp3-text-overflow-ellipsis bp3-fill">{lesson.name}</div>
                                </a>
                            </Col>
                            <Col lg={4}>
                                <ButtonGroup>
                                    <Button onClick={() => {
                                        this.props.history.push('/editlesson/' + lesson.id.toString());
                                    }} icon='edit' />
                                    <Button onClick={() => {
                                        ajax_post(api_list['update_course'], {id: lesson.id, status: 1},
                                            this, (that, result) => {
                                                if(result.data.code!==0) {
                                                    alert("Publish course failed.");
                                                    return;
                                                }
                                                window.location.reload();
                                            })
                                    }
                                    } icon='upload' />
                                    <Button onClick={() => {
                                        ajax_post(api_list['delete_course'], {id: lesson.id},
                                            this, (that, result) => {
                                                if(result.data.code!==0) {
                                                    alert("Delete failed.");
                                                    return;
                                                }
                                                window.location.reload();
                                            })
                                    }
                                    } icon='trash' />
                                </ButtonGroup>
                            </Col>
                        </Row>
                        }
                        {(this.props.role !== 2 || this.props.listname !== '未发布课程') &&
                            <a id={(-lesson.id).toString()} onClick={this.handleClick}
                            className="bp3-menu-item bp3-popover-dismiss">
                            <div id={lesson.id.toString()}
                                 className="bp3-text-overflow-ellipsis bp3-fill">{lesson.name}</div>
                            </a>
                        }
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
            <div>
                <LessonList state={this.props.state} id={this.props.id} role={this.props.role} listname={this.props.lessonlist[0]} lessonlist={this.props.stulesson} />
                <LessonList state={this.props.state} id={this.props.id} role={this.props.role} listname={this.props.lessonlist[1]} lessonlist={this.props.talesson} />
                <LessonList state={this.props.state} id={this.props.id} role={this.props.role} listname={this.props.lessonlist[2]} lessonlist={this.props.uplesson} />
            </div>
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
    "margin-top": "6px",
    "margin-bottom": "6px"
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
            <div>
                {this.props.infoitems.map((item)=>(
                    <InfoItem title={item.title} content={item.content} type="通知" />
                ))}
            {this.props.infoitems.length === 0 && <h3>您当前没有通知</h3>}
            </div>
        )
    }
}


export {Info, StudentLessonList, TALessonList};
export {ZeroPadding, Spacing};