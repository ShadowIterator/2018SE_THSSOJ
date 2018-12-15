import React, { Component } from 'react';

import { Col, Row, Form} from 'react-bootstrap';

import {Button, Tag, Card} from "@blueprintjs/core";

import {ajax_post} from "../ajax-utils/ajax-method";
import {api_list} from "../ajax-utils/api-manager";

import {message} from 'antd';

import {Info} from './lesson-component';

class AddNewNotice extends Component {
    constructor(props) {
        super(props);

        this.state = {
            title: "",
            content: ""
        };
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
            // alert("Creating new notice failed!");
            message.error("创建通知失败");
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
                <Button variant="primary" type="submit" style={{marginLeft:"10px", marginRight:"10px"}}>发布</Button>
                <Button onClick={this.props.cancel_callback} style={{marginLeft:"10px", marginRight:"10px"}}>放弃</Button>
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
                {/*{this.props.infoitems.map((item)=>(*/}
                    {/*<InfoItem title={item.title} content={item.content} type="通知" />*/}
                {/*))}*/}
                <Info infoitems={this.props.infoitems} />
            </Card>
        );
    }
}

export {AddNewNotice, TANoticeList};