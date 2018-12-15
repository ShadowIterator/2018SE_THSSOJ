import React, {Component} from 'react';
import {ajax_post} from "../ajax-utils/ajax-method";
import {api_list} from "../ajax-utils/api-manager";
import {pwd_encrypt} from "./encrypt";

import {Card, Container} from "react-bootstrap"

import { Layout, Breadcrumb } from 'antd';
import { Form, Input, Select, Row, Col, message, Button, Modal } from 'antd';
import {Link} from "react-router-dom";
const {Content} = Layout;
const FormItem = Form.Item;
const Option = Select.Option;

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

    handleGender(value) {
        const gender_value = value;
        if(gender_value==='0') {
            this.setState({gender: 0});
        } else if(gender_value==='1') {
            this.setState({gender: 1});
        } else {
            this.setState({gender: 2});
        }
    }
    handleSubmit(event) {
        event.preventDefault();
        this.props.form.validateFieldsAndScroll((err, value) => {
            if(!err) {
                this.setState({
                    isOpen: true,
                });
            }
        });
    }
    handleSave(event) {
        event.preventDefault();
        this.setState({isOpen:false});
        this.props.form.validateFieldsAndScroll((err, values) => {
            console.log(values);
            if(!err) {
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
        });
    }
    static save_callback(that, result) {
        const code = result.data.code;
        that.setState({password:''});
        if(code === 0) {
            message.success("成功更新用户资料");
        } else {
            message.error("更新失败");
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
            message.error("发送校验码到邮箱失败");
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
            message.error("校验码错误");
        }
    }
    render() {
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 4 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 20 },
            },
        };

        let role = "学生";
        if(this.state.role === 2) {
            role = "助教";
        }

        const gender = this.state.gender.toString();
        // console.log('gender: ', gender);

        let status_html;
        if(!this.state.validating) {
            if (this.state.status) {
                status_html = (<span className="ant-form-text">已激活</span>);
            } else {
                status_html = (
                    <Row>
                        <Col span={16}>
                            <span className="ant-form-text">未激活</span>
                        </Col>
                        <Col span={8}>
                            <Button onClick={this.validate_account}>
                                发送验证码
                            </Button>
                        </Col>
                    </Row>
                )
            }
        } else {
            status_html = (
                <Row>
                    <Col span={16}>
                        <Form.Control value={this.state.validate_code} onChange={this.handleChange} />
                    </Col>
                    <Col span={8}>
                        <Button onClick={this.activate_account}>
                            激活
                        </Button>
                    </Col>
                </Row>
            )
        }

        return(
            <div>
            <Form onSubmit={this.handleSave}>
                <FormItem
                    {...formItemLayout}
                    label="用户名"
                >
                    {getFieldDecorator('username', {
                        initialValue: this.state.username,
                        rules: [{ required: true, message: '请输入您的用户名' }],
                    })(
                        <Input style={{ width: '100%' }} onChange={this.handleChange} />
                    )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="电子邮箱"
                >
                    {getFieldDecorator('email', {
                        initialValue: this.state.email,
                        rules: [{
                            type: 'email', message: '输入邮箱格式有误',
                        }, {
                            required: true, message: '请输入您的邮箱',
                        }],
                    })(
                        <Input onChange={this.handleChange} disabled={true}/>
                    )}
                </FormItem>

                <FormItem
                    {...formItemLayout}
                    label="性别"
                >
                    {getFieldDecorator('gender', {
                        initialValue: gender,
                        rules: [{required: true, message: '请选择您的性别'}],
                    })(
                    <Select onChange={this.handleGender}>
                        <Option value="0">男</Option>
                        <Option value="1">女</Option>
                        <Option value="2">未知</Option>
                    </Select>
                    )}
                </FormItem>

                <FormItem
                    {...formItemLayout}
                    label="真实姓名"
                >
                    {getFieldDecorator('realname', {
                        initialValue: this.state.realname,
                        rules: [{ required: true, message: '请输入您的真实姓名' }],
                    })(
                        <Input style={{ width: '100%' }} onChange={this.handleChange} />
                    )}
                </FormItem>

                <FormItem
                    {...formItemLayout}
                    label="学号"
                >
                    {getFieldDecorator('student_id', {
                        initialValue: this.state.student_id,
                        rules: [{ required: true, message: '请输入您的学号' }],
                    })(
                        <Input style={{ width: '100%' }} onChange={this.handleChange} />
                    )}
                </FormItem>

                <FormItem
                    {...formItemLayout}
                    label="身份"
                >
                    <span className="ant-form-text">{role}</span>
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="激活状态"
                >
                    {status_html}
                </FormItem>
                <Button type="primary" htmlType="submit">
                    保存
                </Button>
            </Form>
                <Modal
                    title="请输入确认密码"
                    visible={this.state.isOpen}
                    onOk={this.handleSave}
                    onCancel={()=>{this.setState({isOpen: false})}}
                >
                    <Input value={this.state.password}
                           onChange={(e)=>{console.log("password:", e.target.value);
                                    this.setState({password: e.target.value})}} />
                </Modal>
            </div>
        );
    }
}

const WrappedUserSettingsForm = Form.create()(UserSettingsForm);

export class UserSettings extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fields: {
                username: {
                    value: '',
                },
            },
        }
    }

    handleFormChange = (changedFields) => {
        this.setState(({ fields }) => ({
            fields: { ...fields, ...changedFields },
        }));
    }

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
                            <WrappedUserSettingsForm state={this.props.state} id={this.props.id} role={this.props.role}/>
                        </Container>
                    </Card.Body>
                </Card>
            </Content>
        );
    }
}