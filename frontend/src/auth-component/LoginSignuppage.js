import React, { Component } from 'react';
import { Button, Form, Card, Row, Col, Navbar, Nav, Dropdown, Container } from "react-bootstrap";
import {
    Link, Redirect, withRouter
} from "react-router-dom";
import PropTypes from 'prop-types';
import {ajax_post, ajax_get} from "../ajax-utils/ajax-method";
import {api_list} from "../ajax-utils/api-manager";
import {pwd_encrypt} from "./encrypt";
import Cookies from "js-cookie";

// import "../mock/auth-mock"

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
            Cookies.set('mid', id.toString());
            that.props.callback(id, role);
            if (role === 1) {
                that.context.router.history.push("/student");
            }
            else if (role === 2) {
                that.context.router.history.push("/ta");
            }
        } else{
            alert("Username or password incorrect.");
        }
    }
    render() {
        const { validated } = this.state;
        return (
            <Card>
                <Card.Header> Login </Card.Header>
                <Card.Body>
                    <Form noValidate
                          validated={validated}
                          onSubmit={this.handleSubmit}>
                        <Form.Group controlId="username">
                            <Form.Label>Username</Form.Label>
                            <Form.Control required type="username" placeholder="Enter username" onChange={this.handleChange} />
                            <Form.Control.Feedback type="invalid">
                                Please enter a username.
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group controlId="password">
                            <Form.Label>Password</Form.Label>
                            <Form.Control required type="password" placeholder="Password" onChange={this.handleChange} />
                            <Form.Control.Feedback type="invalid">
                                Please enter your password.
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            Login
                        </Button>
                        <Form.Text className="text-muted">
                            Don't have an account? <Link to="/signup">Sign up</Link> first.
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
            alert("Two password do not match.");
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
            that.context.router.history.push("/login");
        }
    }
    render() {
        const { validated } = this.state;
        return (
            <Card>
                <Card.Header> Sign up </Card.Header>
                <Card.Body>
                    <Form noValidate
                          validated={validated}
                          onSubmit={this.handleSubmit}>
                        <Form.Group controlId="username">
                            <Form.Label>Username</Form.Label>
                            <Form.Control required type="username" placeholder="Enter username" onChange={this.handleChange} />
                            <Form.Control.Feedback type="invalid">
                                Please choose a username.
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group controlId="email">
                            <Form.Label>Email</Form.Label>
                            <Form.Control required type="email" placeholder="Enter email" onChange={this.handleChange} />
                            <Form.Control.Feedback type="invalid">
                                Please enter your email.
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group controlId="password">
                            <Form.Label>Password</Form.Label>
                            <Form.Control required type="password" placeholder="Password" onChange={this.handleChange} />
                            <Form.Control.Feedback type="invalid">
                                Please choose a password.
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group controlId="passwordAgain">
                            <Form.Label>Password Again</Form.Label>
                            <Form.Control required type="password" placeholder="Password Again" onChange={this.handleChange} />
                            <Form.Control.Feedback type="invalid">
                                Please enter the password again.
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Button variant="primary" type="submit">
                            Sign up
                        </Button>
                        <Form.Text className="text-muted">
                            Already owned an account? You can <Link to="/login">Login</Link>.
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
                <Card.Img src="https://via.placeholder.com/1438x680.png" alt = "Card image" />
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
                <Card.Img src="https://via.placeholder.com/1438x680.png" alt="Card image" />
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
            } else if(this.props.role===2) {
                this.props.history.push('/ta');
            } else {
                alert("Bad role number.");
            }
        }
    }
    componentWillUpdate(nextProps) {
        if(nextProps.id===undefined)
            return;
        if(nextProps.id !== this.props.id) {
            if(nextProps.state && nextProps.role!==undefined) {
                if(nextProps.role === 1) {
                    this.props.history.push('/student');
                } else if(nextProps.role===2) {
                    this.props.history.push('/ta');
                } else {
                    alert("Bad role number.");
                }
            }
        }
    }
    render() {
        return (
            <>
                <LoginMiddlebody callback={this.props.callback} />
            </>
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
            } else {
                alert("Bad role number.");
            }
        }
    }
    componentWillUpdate(nextProps) {
        if(nextProps.id===undefined)
            return;
        if(nextProps.id !== this.props.id) {
            if(nextProps.state && nextProps.role!==undefined) {
                if(nextProps.role === 1) {
                    this.props.history.push('/student');
                } else if(nextProps.role===2) {
                    this.props.history.push('/ta');
                } else {
                    alert("Bad role number.");
                }
            }
        }
    }
    render() {
        return (
            <>
                <SignupMiddlebody/>
            </>
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
            alert("Logout succeed.");
        } else {
            alert("Logout failed.");
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
