import React, { Component } from 'react';

import {Container, Col, Row, Card, Form, Tabs, Tab} from 'react-bootstrap';

import {ZeroPadding, Spacing} from "./lesson-component";
import {withRouter} from "react-router";
import { AnchorButton, Button, Code, H5, Intent, Switch } from "@blueprintjs/core";

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
            stu_id: this.props.stu_id
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
            <Form onSubmit={this.submitHandler}>
                <Form.Group as={Row} controlId="title">
                    <Form.Label column lg="2">通知名称</Form.Label>
                    <Col lg="10">
                        <Form.Control value={this.state.title} onChange={this.changeTitle} />
                    </Col>
                </Form.Group>
                <Form.Group as={Row} controlId="description">
                    <Form.Label column lg="2">通知内容</Form.Label>
                    <Col lg="10">
                        <Form.Control as="textarea" value={this.state.content} onChange={this.changeContent} />
                    </Col>
                </Form.Group>
                <Button variant="primary" type="submit">发布</Button>
            </Form>
        )
    }
}

export {AddNewNotice};