import React, {Component} from 'react';
import {HTMLSelect, Button, Dialog, Classes} from '@blueprintjs/core';
import {ajax_post} from "../ajax-utils/ajax-method";
import {api_list} from "../ajax-utils/api-manager";
import {pwd_encrypt} from "./encrypt";

import {Card, Form, Container, Row, Col} from "react-bootstrap"

import { Layout, Breadcrumb } from 'antd';
import {Link} from "react-router-dom";
const {Content} = Layout;

class UserSettingsForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            email: '',
            status: 0,
            gender: 0,
            realname: '',
            student_id: '',
            role: 0,
            password: '',
            isOpen: false,
            validating: false,
            validate_code: '',
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleGender = this.handleGender.bind(this);
        this.handleSave = this.handleSave.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.fillInfo = this.fillInfo.bind(this);
        this.validate_account = this.validate_account.bind(this);
        this.activate_account = this.activate_account.bind(this);
        this.prev_id = -1;
    }
    fillInfo(id) {
        if(id===undefined)
            return;
        const query_data = {id: id};
        ajax_post(api_list['query_user'], query_data, this, UserSettingsForm.mount_callback);
    }
    componentDidMount() {
        this.setState({
            prev_props: {
                id: this.props.id,
                state: this.props.id,
                role: this.props.role,
            }
        });
        if(this.props.state && this.props.id!==undefined) {
            this.fillInfo(this.props.id);
        }
    }
    componentWillUpdate(nextProps) {
        if(nextProps.id===undefined || nextProps.id===-1)
            return;
        if(nextProps.id !== this.prev_id) {
            this.prev_id = nextProps.id;
            this.fillInfo(nextProps.id);
        }
    }
    static mount_callback(that, result) {
        const data = result.data[0];
        // console.log(data);
        that.setState({
            username: data.username,
            email: data.email,
            status: data.status? data.status:0,
            gender: data.gender,
            realname: data.realname? data.realname:'',
            student_id: data.student_id? data.student_id : '' ,
            role: data.role? data.role:0
        });
    }
    handleChange(event) {
        this.setState({
            [event.target.id]: event.target.value
        });
    }
    handleGender(event) {
        const gender_value = event.target.value;
        if(gender_value==='male') {
            this.setState({gender:0});
        } else if(gender_value==='female') {
            this.setState({gender: 1});
        } else {
            this.setState({gender: 2});
        }
    }
    handleSubmit(event) {
        event.preventDefault();
        event.stopPropagation();
        this.setState({
            isOpen: true,
        });
    }
    handleSave(event) {
        event.preventDefault();
        event.stopPropagation();
        this.setState({isOpen:false});
        const update_data = {
            id: this.props.id,
            auth_password: pwd_encrypt(this.state.password),
            email: this.state.email,
            gender: this.state.gender,
            realname: this.state.realname,
            student_id: this.state.student_id,
        };
        console.log(update_data);
        ajax_post(api_list['update_user'], update_data, this, UserSettingsForm.save_callback);
    }
    static save_callback(that, result) {
        const code = result.data.code;
        that.setState({password:''});
        if(code === 0) {
            alert("Successfully update profile.");
        } else {
            alert("Update failed.");
        }
        that.fillInfo(that.props.id);
    }
    validate_account() {
        const id = this.props.id;
        const validate_data = {id:id};
        ajax_post(api_list['validate_user'], validate_data, this, UserSettingsForm.validate_callback);
    }
    static validate_callback(that, result) {
        const code = result.data.code;
        if(code === 0) {
            that.setState({
                validating: true,
            });
        } else {
            alert("Something went wrong while trying to send validate code.");
        }
    }
    activate_account() {
        const id = this.props.id;
        const validate_code = parseInt(this.state.validate_code);
        const activate_data = {
            id:id,
            validate_code: validate_code,
        };
        ajax_post(api_list['activate_user'], activate_data, this, UserSettingsForm.activate_callback);
    }
    static activate_callback(that, result) {
        const code = result.data.code;
        if(code === 0) {
            that.setState({
                validating: false,
            });
            that.fillInfo(that.props.id);
        } else {
            alert("Validate code error.");
        }
    }
    render() {
        let role = "学生";
        if(this.state.role === 2) {
            role = "助教";
        }
        let status_html;
        if(!this.state.validating) {
            if (this.state.status) {
                status_html = (<Form.Label>已激活</Form.Label>);
            } else {
                status_html = (
                    <Row>
                        <Col lg="8">
                            <Form.Label>未激活</Form.Label>
                        </Col>
                        <Col lg="4">
                            <Button onClick={this.validate_account}>
                                发送验证码
                            </Button>
                        </Col>
                    </Row>
                )
            }
        } else {
            status_html = (
                <Form.Group as={Row} controlId="validate_code">
                    <Col lg="8">
                        <Form.Control value={this.state.validate_code} onChange={this.handleChange} />
                    </Col>
                    <Col lg="4">
                        <Button onClick={this.activate_account}>
                            激活
                        </Button>
                    </Col>
                </Form.Group>
            )
        }
        const gender = this.state.gender;
        return(
            <div>
            <Form onSubmit={this.handleSubmit}>
                <Form.Group as={Row} controlId="username">
                    <Form.Label column lg="3">Username</Form.Label>
                    <Col lg="9">
                        <Form.Control value={this.state.username} onChange={this.handleChange} />
                    </Col>
                </Form.Group>
                <Form.Group as={Row} controlId="email">
                    <Form.Label column lg="3">Email</Form.Label>
                    <Col lg="9">
                        <Form.Control type="email" value={this.state.email} onChange={this.handleChange} />
                    </Col>
                </Form.Group>
                <Form.Group as={Row} controlId="gender">
                    <Form.Label column lg="3">Gender</Form.Label>
                    <Col lg="9">
                        <HTMLSelect onChange={this.handleGender} fill>
                        <option value={'male'} selected={gender === 0}>男</option>
                        <option value={'female'} selected={gender === 1}>女</option>
                        <option value={'unknown'} selected={gender === 2}>未知</option>
                        </HTMLSelect>
                    </Col>
                </Form.Group>
                <Form.Group as={Row} controlId="realname">
                    <Form.Label column lg="3">Real Name</Form.Label>
                    <Col lg="9">
                        <Form.Control value={this.state.realname} onChange={this.handleChange} />
                    </Col>
                </Form.Group>
                <Form.Group as={Row} controlId="student_id">
                    <Form.Label column lg="3">Student ID</Form.Label>
                    <Col lg="9">
                          <Form.Control value={this.state.student_id} onChange={this.handleChange} />
                    </Col>
                </Form.Group>
                <Form.Group as={Row} controlId="role">
                    <Form.Label column lg="3">Role</Form.Label>
                    <Col lg="9">
                        <Form.Label>{role}</Form.Label>
                    </Col>
                </Form.Group>
                <Form.Group as={Row} controlId="status">
                    <Form.Label column lg="3">Status</Form.Label>
                    <Col lg="9">
                        {status_html}
                    </Col>
                </Form.Group>
                <Button variant="primary" type="submit">
                    Save
                </Button>
            </Form>
            <Dialog
                icon="info-sign"
                onClose={()=>{this.setState({isOpen:false});}}
                title="Confirm"
                isOpen={this.state.isOpen}
            >
                <div className={Classes.DIALOG_BODY}>
                    <Form onSubmit={(e)=>{e.preventDefault();
                        e.stopPropagation();}}>
                    <Form.Group as={Row} controlId="password">
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" value={this.state.password} placeholder="Please enter your password to confirm."
                        onChange={this.handleChange}/>
                    </Form.Group>
                    </Form>
                </div>
                <div className={Classes.DIALOG_FOOTER}>
                    <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                        <Button onClick={this.handleSave}>Save</Button>
                        <Button onClick={()=>{this.setState({isOpen:false});}}>Cancel</Button>
                    </div>
                </div>
                </Dialog>
                </div>
        );
    }
}

export class UserSettings extends Component {
    render() {
        console.log(this.props);
        let homelink = '/';
        if(this.props.role===1) {
            homelink = '/student';
        } else if(this.props.role===2) {
            homelink = '/ta';
        } else if(this.props.role===3) {
            homelink = '/admin';
        }
        return(
            <Content style={{padding: '0 50px'}}>
                <Breadcrumb style={{margin: '16px 0'}}>
                    <Breadcrumb.Item><Link to={homelink}>Home</Link></Breadcrumb.Item>
                    <Breadcrumb.Item>修改个人信息</Breadcrumb.Item>
                </Breadcrumb>
                <Card className="text-center">
                    <Card.Body>
                        <Card.Title><h2>修改个人信息</h2></Card.Title>
                        <Container>
                            <UserSettingsForm state={this.props.state} id={this.props.id} role={this.props.role}/>
                        </Container>
                    </Card.Body>
                </Card>
            </Content>
        );
    }
}