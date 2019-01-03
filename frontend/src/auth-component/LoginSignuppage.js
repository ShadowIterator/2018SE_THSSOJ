import React, { Component } from 'react';
import { Button, Form, Card, Row, Col, Container } from "react-bootstrap";
import {
    Link, withRouter
} from "react-router-dom";
import PropTypes from 'prop-types';
import {ajax_post} from "../ajax-utils/ajax-method";
import {api_list} from "../ajax-utils/api-manager";
import {pwd_encrypt} from "./encrypt";
import Cookies from "js-cookie";
import {message} from 'antd';
import pageimage from '../static/tsinghua1.jpeg';

class Login extends Component
{
    constructor(props) {
        super(props);
        this.state = {
            username: "",
            password: "",
            validated: false
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    handleChange(event) {
        this.setState({
            [event.target.id]: event.target.value
        });
    }
    handleSubmit(event) {
        const form = event.currentTarget;
        event.preventDefault();
        event.stopPropagation();
        this.setState({validated: true});
        if (form.checkValidity() === false) {
            return;
        }
        const login_data = {
            username: this.state.username,
            password: pwd_encrypt(this.state.password)
        };
        ajax_post(api_list['login'], login_data, this, Login.login_callback);
    }
    static login_callback(that, result) {
        const code = result.data.code;
        if(code===0) {
            const id = result.data.id;
            const role = result.data.role;
            const username = result.data.username;
            Cookies.set('mid', id.toString());
            that.props.callback(id, role, username);
            if (role === 1) {
                that.context.router.history.push("/student");
            }
            else if (role === 2) {
                that.context.router.history.push("/ta");
            } else if (role === 3) {
                that.context.router.history.push("/admin")
            }
        } else{
            message.error("用户名或密码错误！");
        }
    }
    render() {
        const { validated } = this.state;
        return (
            <Card>
                <Card.Header> 登录 </Card.Header>
                <Card.Body>
                    <Form noValidate
                          validated={validated}
                          onSubmit={this.handleSubmit}>
                        <Form.Group controlId="username">
                            <Form.Label>用户名</Form.Label>
                            <Form.Control required type="username" placeholder="请输入用户名" onChange={this.handleChange} />
                            <Form.Control.Feedback type="invalid">
                                请输入您的用户名
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group controlId="password">
                            <Form.Label>密码</Form.Label>
                            <Form.Control required type="password" placeholder="请输入密码" onChange={this.handleChange} />
                            <Form.Control.Feedback type="invalid">
                                Please enter your password.
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            登录
                        </Button>
                        <Form.Text className="text-muted">
                            没有账号？ 请去<Link to="/signup">注册</Link>页面。
                        </Form.Text>
                    </Form>
                </Card.Body>
            </Card>
        )
    }
}
Login.contextTypes = {
    router: PropTypes.object.isRequired
};

class Signup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: "",
            email: "",
            password: "",
            passwordAgain: "",
            validated: false
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    handleChange(event) {
        this.setState({
            [event.target.id]: event.target.value
        });
    }
    handleSubmit(event) {
        const form = event.currentTarget;
        event.preventDefault();
        event.stopPropagation();
        this.setState({ validated: true });
        if (form.checkValidity() === false) {
            return;
        }
        if(this.checkvalidation() === false) {
            // alert("Two password do not match.");
            message.error("两次输入的密码不一致");
            return;
        }
        const signup_data = {
            username: this.state.username,
            password: pwd_encrypt(this.state.password),
            email: this.state.email,
            role: 1,
        };
        ajax_post(api_list['signup'], signup_data, this, Signup.signup_callback);
    }
    checkvalidation() {
        return this.state.password === this.state.passwordAgain;
    }
    static signup_callback(that, result) {
        const code = result.data.code;
        if(code===0) {
            message.success("注册成功，请登录");
            that.context.router.history.push("/login");
        } else
        {
            message.error("注册失败");
        }
    }
    render() {
        const { validated } = this.state;
        return (
            <Card>
                <Card.Header> 注册 </Card.Header>
                <Card.Body>
                    <Form noValidate
                          validated={validated}
                          onSubmit={this.handleSubmit}>
                        <Form.Group controlId="username">
                            <Form.Label>用户名</Form.Label>
                            <Form.Control required type="username" placeholder="请选择一个用户名" onChange={this.handleChange} />
                            <Form.Control.Feedback type="invalid">
                                请选择一个用户名
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group controlId="email">
                            <Form.Label>Email</Form.Label>
                            <Form.Control required type="email" placeholder="请输入你的email" onChange={this.handleChange} />
                            <Form.Control.Feedback type="invalid">
                                请输入您的email
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group controlId="password">
                            <Form.Label>密码</Form.Label>
                            <Form.Control required type="password" placeholder="请输入密码" onChange={this.handleChange} />
                            <Form.Control.Feedback type="invalid">
                                Please choose a password.
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group controlId="passwordAgain">
                            <Form.Label>确认密码</Form.Label>
                            <Form.Control required type="password" placeholder="请再输入一遍" onChange={this.handleChange} />
                            <Form.Control.Feedback type="invalid">
                                Please enter the password again.
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Button variant="primary" type="submit">
                            注册
                        </Button>
                        <Form.Text className="text-muted">
                            已经拥有账号？ 您可以 <Link to="/login">登录</Link>。
                        </Form.Text>
                    </Form>
                </Card.Body>
            </Card>
        )
    }
}
Signup.contextTypes = {
    router: PropTypes.object.isRequired
};

class LoginMiddlebody extends Component {
    render() {
        return (
            <Card>
                <Card.Img src={pageimage} alt = "Card image" />
                <Card.ImgOverlay>
                    <Container className="h-100">
                        <Row className="h-100 justify-content-center align-items-center">
                            <Col lg={{span:4, offset:8}}>
                                <Login callback={this.props.callback}/>
                            </Col>
                        </Row>
                    </Container>
                </Card.ImgOverlay>
            </Card>
        )
    }
}

class SignupMiddlebody extends Component {
    render() {
        return (
            <Card>
                <Card.Img src={pageimage} alt="Card image" />
                <Card.ImgOverlay>
                    <Container className="h-100">
                        <Row className="h-100 justify-content-center align-items-center">
                            <Col lg={{span:4, offset:8}}>
                                <Signup/>
                            </Col>
                        </Row>
                    </Container>
                </Card.ImgOverlay>
            </Card>
        )
    }
}

class mLoginPage extends Component {
    componentDidMount() {
        if(this.props.state && this.props.role!==undefined) {
            if(this.props.role === 1) {
                this.props.history.push('/student');
            } else if(this.props.role === 2) {
                this.props.history.push('/ta');
            } else if(this.props.role === 3) {
                this.props.history.push('/admin');
            } else {
                message.error("Role数字不对！");
            }
        }
    }
    componentWillUpdate(nextProps) {
        if(nextProps.id===-1)
            return;
        if(nextProps.id !== this.props.id) {
            if(nextProps.state && nextProps.role!==undefined) {
                if(nextProps.role === 1) {
                    this.props.history.push('/student');
                } else if(nextProps.role===2) {
                    this.props.history.push('/ta');
                } else if(nextProps.role===3) {
                    this.props.history.push('/admin')
                } else {
                    message.error("Role数字不对！");
                }
            }
        }
    }
    render() {
        return (
            <div>
                <LoginMiddlebody callback={this.props.callback} />
            </div>
        )
    }
}

const LoginPage = withRouter(mLoginPage);

class mSignupPage extends Component {
    componentDidMount() {
        if(this.props.state && this.props.role!==undefined) {
            if(this.props.role === 1) {
                this.props.history.push('/student');
            } else if(this.props.role===2) {
                this.props.history.push('/ta');
            } else if(this.props.role===3) {
                this.props.history.push('/admin')
            } else {
                // alert("Bad role number.");
                message.error("Role数字不对！");
            }
        }
    }
    componentWillUpdate(nextProps) {
        if(nextProps.id===-1)
            return;
        if(nextProps.id !== this.props.id) {
            if(nextProps.state && nextProps.role!==undefined) {
                if(nextProps.role === 1) {
                    this.props.history.push('/student');
                } else if(nextProps.role===2) {
                    this.props.history.push('/ta');
                } else if(nextProps.role===3) {
                    this.props.history.push('/admin')
                } else {
                    // alert("Bad role number.");
                    message.error("Role数字不对！");
                }
            }
        }
    }
    render() {
        return (
            <div>
                <SignupMiddlebody/>
            </div>
        )
    }
}
const SignupPage = withRouter(mSignupPage);

class mLogoutPage extends Component {
    componentDidMount() {
        if(this.props.state && this.props.id!==undefined) {
            const id = this.props.id;
            const logout_data = {id:id};
            ajax_post(api_list['logout'], logout_data, this, LogoutPage.logout_callback);
        }
    }
    static logout_callback(that, result) {
        const code = result.data.code;
        if(code===0) {
            Cookies.remove('mid');
            message.success("登出成功");
        } else {
            message.error("登出失败");
        }
        that.props.callback();
        that.props.history.push('/login');
    }
    render() {
        return null;
    }
}
const LogoutPage = withRouter(mLogoutPage);

export {LoginPage, SignupPage, LogoutPage};
