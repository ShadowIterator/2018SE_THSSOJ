import React, { Component } from 'react';

import {Container, Col, Row, Form} from 'react-bootstrap';

import {ZeroPadding, Spacing} from "./lesson-component";
import {withRouter} from "react-router";
import {Button, Tag, Card} from "@blueprintjs/core";

// import "../mock/course-mock";
// import "../mock/auth-mock";
// import "../mock/notice-mock";
// import "../mock/homework-mock";
// import "../mock/problem-mock";
import {ajax_post} from "../ajax-utils/ajax-method";
import {api_list} from "../ajax-utils/api-manager";

class AddNewNotice extends Component {
    constructor(props) {
        super(props);

        this.state = {
            title: "",
            content: ""
        }
        this.submitHandler = this.submitHandler.bind(this);
        this.changeTitle = this.changeTitle.bind(this);
        this.changeContent = this.changeContent.bind(this);
        this.submitCallback = this.submitCallback.bind(this);
    }

    submitHandler(e){
        e.preventDefault();
        e.stopPropagation();

        console.log("submitHandler");
        const data = {
            title: this.state.title,
            content: this.state.content,
            course_id: this.props.course_id,
            user_id: this.props.stu_id
        };
        console.log(data);
        ajax_post(api_list['create_notice'], data, this, this.submitCallback);
    }

    submitCallback(that, result){
        console.log("submitCallback");
        if (result.data.code !== 0) {
            alert("Creating new notice failed!");
            return;
        }

        const callback = that.props.newnotice_callback;
        callback();
    }

    changeTitle(e){
        this.setState({
            title: e.target.value
        });
    }

    changeContent(e){
        this.setState({
            content: e.target.value
        });
    }

    render(){
        return (
            <Card interactive={false} className="text-center">
            <Form onSubmit={this.submitHandler}>
                <Form.Group as={Row} controlId="title">
                    <Form.Label column lg="3">通知名称</Form.Label>
                    <Col lg="9">
                        <Form.Control value={this.state.title} onChange={this.changeTitle} />
                    </Col>
                </Form.Group>
                <Form.Group as={Row} controlId="description">
                    <Form.Label column lg="3">通知内容</Form.Label>
                    <Col lg="9">
                        <Form.Control as="textarea" value={this.state.content} onChange={this.changeContent} />
                    </Col>
                </Form.Group>
                <Button variant="primary" type="submit">发布</Button>
            </Form>
            </Card>
        )
    }
}

class TANoticeList extends Component {
    render() {
        return(
            <Card interactive={false}>
                <Button icon="add" onClick={this.props.newNotice}>新建通知</Button>
                {this.props.infoitems.map((item)=>(
                    <InfoItem title={item.title} content={item.content} type="通知" />
                ))}
            </Card>
        );
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

export {AddNewNotice, TANoticeList};