import React, {Component} from 'react';
import {ajax_post} from "../ajax-utils/ajax-method";
import {api_list} from "../ajax-utils/api-manager";
import {pwd_encrypt} from "./encrypt";

import { Layout, Breadcrumb } from 'antd';
import { Form, Input, Select, Row, Col, message, Button, Modal, Menu, Icon} from 'antd';
import {withRouter, Link} from "react-router-dom";
const FormItem = Form.Item;
const Option = Select.Option;
const {Content, Sider} = Layout;

class ModifyPwdForm extends Component {

    handleSubmit = (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.props.form.validateFields((err, fieldsValue) => {
            if (err) {
                return;
            }
            if (fieldsValue.new_pwd !== fieldsValue.new_pwd2){
                message.error("两次新密码不一致！");
                return;
            }
            const data = {
                id: this.props.id,
                old_pwd: fieldsValue.old_pwd,
                new_pwd: fieldsValue.new_pwd
            };
            // console.log(data);
            ajax_post(api_list['modifypwd_user'], data, this, (that, result)=>{
                if (result.data.code === 0){
                    message.success("密码修改成功！");
                } else
                {
                    message.error("密码修改失败！");
                }
            });
        });
    };

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
        const tailFormItemLayout = {
            wrapperCol: {
                xs: {
                    span: 24,
                    offset: 0,
                },
                sm: {
                    span: 24,
                    offset: 0,
                },
            },
        };

        return (
            <Form onSubmit={this.handleSubmit}>
                <FormItem
                    {...formItemLayout}
                    label="旧密码："
                >
                    {getFieldDecorator('old_pwd', {
                        rules: [{ required: true, message: '请输入您的旧密码' }],
                    })(
                        <Input type="password" style={{ width: '100%' }} />
                    )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="新密码："
                >
                    {getFieldDecorator('new_pwd', {
                        rules: [{ required: true, message: '请输入您的新密码' }],
                    })(
                        <Input type="password" style={{ width: '100%' }} />
                    )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="重复密码："
                >
                    {getFieldDecorator('new_pwd2', {
                        rules: [{ required: true, message: '请重复您的新密码' }],
                    })(
                        <Input type="password" style={{ width: '100%' }} />
                    )}
                </FormItem>
                <Button htmlType={"submit"}>修改密码</Button>
            </Form>
        );
    }
}

const WrappedModifyPwdForm = Form.create({
    onFieldsChange(props, changedFields) {
        props.onChange(changedFields);
    },
    onValuesChange(_, values) {
        // console.log(values);
    },
    mapPropsToFields(props) {
        return {
            old_pwd: Form.createFormField({
                ...props.old_pwd,
                value: props.old_pwd.value,
            }),
            new_pwd: Form.createFormField({
                ...props.new_pwd,
                value: props.new_pwd.value,
            }),
            new_pwd2: Form.createFormField({
                ...props.new_pwd2,
                value: props.new_pwd2.value,
            }),
        };
    }
})(withRouter(ModifyPwdForm));


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
                    username: this.state.username,
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
                        <Input style={{ width: '100%' }} disabled={true} />
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
                {/*<FormItem*/}
                    {/*{...formItemLayout}*/}
                    {/*label="激活状态"*/}
                {/*>*/}
                    {/*{status_html}*/}
                {/*</FormItem>*/}
                <Button type="primary" htmlType="submit">
                    保存
                </Button>
            </Form>
            </div>
        );
    }
}

const WrappedUserSettingsForm = Form.create()(UserSettingsForm);

export class UserSettings extends Component {
    constructor(props) {
        super(props);
        this.state = {
            status: 1,
            fields: {
                old_pwd: {
                    value: '',
                },
                new_pwd: {
                    value: ''
                },
                new_pwd2: {
                    value: ''
                }
            },
        }
    }

    handleFormChange = (changedFields) => {
        this.setState(({ fields }) => ({
            fields: { ...fields, ...changedFields },
        }));
    };

    render() {
        console.log(this.props);
        let homelink = '/';
        if (this.props.role === 1) {
            homelink = '/student';
        } else if (this.props.role === 2) {
            homelink = '/ta';
        } else if (this.props.role === 3) {
            homelink = '/admin';
        }

        let content;
        let breadcrumb;
        if (this.state.status === 1) {
            breadcrumb = (
                <Breadcrumb.Item>修改个人信息</Breadcrumb.Item>
            );
            content = (
                <div style={{ background: '#fff', padding: 24, minHeight: 280, textAlign: 'center' }}>
                    <h3>修改个人信息</h3>
                    <WrappedUserSettingsForm state={this.props.state}
                                             id={this.props.id}
                                             role={this.props.role}/>
                </div>
            );
        } else
        if (this.state.status === 2) {
            breadcrumb = (
                <Breadcrumb.Item>修改密码</Breadcrumb.Item>
            );
            content = (
                <div style={{ background: '#fff', padding: 24, minHeight: 280, textAlign: 'center' }}>
                    <h3>修改密码</h3>
                    <WrappedModifyPwdForm id={this.props.id}
                                          onChange={this.handleFormChange}
                                          {...this.state.fields}/>
                </div>
            );
        }
        else {
            content = (
                <h3>
                    我也不知道发生了什么QAQ
                </h3>
            );
        }


        return (
            <Content style={{padding: '0 50px'}}>
                <Breadcrumb style={{margin: '16px 0'}}>
                    <Breadcrumb.Item><Link to={homelink}>Home</Link></Breadcrumb.Item>
                    {breadcrumb}
                </Breadcrumb>

                <Layout style={{ padding: '24px 0', background: '#fff' }}>
                    <Sider width={200} style={{ background: '#fff' }}>
                        <Menu
                            onClick={(e)=>{this.setState({status: parseInt(e.key)})}}
                            mode="inline"
                            defaultSelectedKeys={['1']}
                            defaultOpenKeys={['sub1']}
                            style={{ height: '100%' }}
                        >
                            <Menu.Item key="1"><Icon type="notification" />修改个人信息</Menu.Item>
                            <Menu.Item key="2"><Icon type="info-circle" />修改密码</Menu.Item>
                        </Menu>
                    </Sider>
                    <Content style={{ padding: '0 24px', minHeight: 280 }}>
                        {content}
                    </Content>
                </Layout>
            </Content>
        );
    }
}