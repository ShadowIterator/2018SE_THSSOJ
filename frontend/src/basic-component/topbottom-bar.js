import React, { Component } from 'react';
import {Alignment,
    Button,
    Classes,
    Navbar,
    Menu,
    Popover,
    Position
} from "@blueprintjs/core";
import {ajax_post} from "../ajax-utils/ajax-method";
import {Layout, message, Modal, Form, Input, Icon} from 'antd';
import {withRouter} from "react-router-dom";
import {api_list} from "../ajax-utils/api-manager";

const { Footer } = Layout;
class mDropdown extends Component {
    render() {
        let menuItem;
        if(this.props.state) {
            menuItem = (
                <div>
                    {this.props.role !== 3 &&
                    <Menu.Item text="全部课程" onClick={() => {
                        this.props.callback(false);
                        this.props.history.push("/alllessons");
                    }}/>
                    }
                    {this.props.role === 2 &&
                    <Menu.Item text="我的题目" onClick={() => {
                        this.props.callback(false);
                        this.props.history.push("/myproblem");
                    }
                    }/>
                    }
                    {this.props.role !== 3 &&
                        <Menu.Divider/>
                    }
                    <Menu.Item text="Logout" onClick={()=>{
                        this.props.callback(false);
                        this.props.history.push("/logout");}} />
                </div>
            );
        } else {
            menuItem = (
                <div>
                    <Menu.Item text="Signup" onClick={()=>{
                        this.props.callback(false);
                        this.props.history.push("/signup");}} />
                    <Menu.Divider />
                    <Menu.Item text="Login" onClick={()=>{
                        this.props.callback(false);
                        this.props.history.push("/login");}} />
                </div>
            )
        }
        return (
            <Menu className={Classes.ELEVATION_1}>
                {menuItem}
            </Menu>
        )
    }
}

const Dropdown = withRouter(mDropdown);

class mTopbar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible:false,
            username: '',
            password: '',
            email: '',
            realname: '',
            student_id: '',
        };
        this.handleHomeClick = this.handleHomeClick.bind(this);
        this.handlePublicClick = this.handlePublicClick.bind(this);
    }
    handleHomeClick() {
        this.props.callback(false);
        if(this.props.state && this.props.role) {
            if (this.props.role === 1) {
                this.props.history.push('/student');
            } else if (this.props.role === 2) {
                this.props.history.push('/ta');
            } else if(this.props.role === 3) {
                this.props.history.push('/admin');
            }
        } else {
            message.warning("请先登录");
        }
    }
    handlePublicClick() {
        if(this.props.state === false) {
            message.warning("请先登录");
            return;
        }
        this.props.callback(false);
        this.props.history.push('/problembase');
    }
    render() {
        let style = {};
        if(this.props.use_hard) {
            style['height'] = '6vh';
        }
        return (
            <>
            <Navbar style={style}>
                <Navbar.Group align={Alignment.LEFT}>
                    <Navbar.Heading>THSSOJ</Navbar.Heading>
                    <Navbar.Divider />
                    <Button className={Classes.MINIMAL} icon="home" text="主页" onClick={this.handleHomeClick} style={{outline: 0}} />
                    {this.props.role !== 3 &&
                        <Button className={Classes.MINIMAL} icon="document" text="公共题库" onClick={this.handlePublicClick} style={{outline: 0}}/>
                    }
                    {this.props.role === 2 &&
                        <Button className={Classes.MINIMAL} icon="new-object" text="新建题目" onClick={()=>{
                            this.props.callback(false);
                            this.props.history.push('/problemcreate');
                        }} style={{outline: 0}} />
                    }
                    {this.props.role === 3 &&
                        <Button className={Classes.MINIMAL} icon="new-object" text="新建助教" onClick={() => {
                            this.setState({visible: true, username: '', password: '', email: ''});
                        }} style={{outline: 0}} />
                    }
                </Navbar.Group>
                <Navbar.Group align={Alignment.RIGHT}>
                    <Navbar.Divider />
                    <Popover content={<Dropdown {...this.props} callback={this.props.callback}/>} position={Position.BOTTOM_LEFT}>
                        <Button className={Classes.MINIMAL} icon="user" style={{outline: 0}} text={this.props.username} />
                    </Popover>
                    {this.props.state &&
                        <Button className={Classes.MINIMAL} icon="cog" style={{outline: 0}} onClick={() => {
                            this.props.callback(false);
                            this.props.history.push('/usersettings');
                        }} text={"设置"}/>
                    }
                </Navbar.Group>
            </Navbar>
            <Modal
                title="新建助教"
                visible={this.state.visible}
                onOk={()=>{
                    // this.setState({visible: false});
                    if(this.state.username === '') {
                        message.error("用户名不能为空");
                    } else if(this.state.password === '') {
                        message.error("密码不能为空");
                    } else if(this.state.email === '') {
                        message.error("邮箱不能为空");
                    } else if(this.state.realname === '') {
                        message.error("真实姓名不能为空");
                    } else if(this.state.student_id === '') {
                        message.error("学号不能为空");
                    } else if(isNaN(parseInt(this.state.student_id))) {
                        message.error("学号格式错误");
                    } else {
                        ajax_post(api_list['create_ta'], {
                            username: this.state.username,
                            password: this.state.password,
                            email: this.state.email,
                            realname: this.state.realname,
                            student_id: this.state.student_id,
                        }, this, (that, result) => {
                            if(result.data.code !== 0) {
                                message.error("助教创建失败");
                            } else {
                                message.success("创建成功");
                                that.setState({visible: false});
                            }
                        });
                    }
                }}
                onCancel={()=>{this.setState({visible: false})}}
                okText={"创建助教"}
                cancelText={"取消"}>
                <Form onSubmit={(e)=>{e.preventDefault()}}>
                    <Form.Item>
                        <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Username"
                               value={this.state.username} onChange={(e) => {this.setState({username: e.target.value})}} />
                    </Form.Item>
                    <Form.Item >
                        <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="Password"
                               value={this.state.password} onChange={(e) => {this.setState({password: e.target.value})}} />
                    </Form.Item>
                    <Form.Item >
                        <Input prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />} type="email" placeholder="Email"
                               value={this.state.email} onChange={(e) => {this.setState({email: e.target.value})}} />
                    </Form.Item>
                    <Form.Item >
                        <Input prefix={<Icon type="contacts" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="真实姓名"
                               value={this.state.realname} onChange={(e) => {this.setState({realname: e.target.value})}} />
                    </Form.Item>
                    <Form.Item >
                        <Input prefix={<Icon type="smile" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="学号"
                               value={this.state.student_id} onChange={(e) => {this.setState({student_id: e.target.value})}} />
                    </Form.Item>
                </Form>
            </Modal>
            </>
        )
    }
}
// mTopbar.contextType = AuthContext;

class Bottombar extends Component {
    render() {
        let style = { textAlign: 'center'};
        if(this.props.use_hard) {
            style['height'] = '6vh';
        }
        return (
            <Footer style={style}>
                THSSOJ ©2018 Created by THSS
            </Footer>
        )
    }
}

const Topbar = withRouter(mTopbar);

export {Topbar, Bottombar};
