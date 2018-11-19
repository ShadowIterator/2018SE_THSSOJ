import React, { Component } from 'react';
import {Navbar as BSNavbar} from "react-bootstrap";
import {Alignment,
    Button,
    Classes,
    Navbar,
    Menu,
    Popover,
    Position
} from "@blueprintjs/core";
import {AuthContext, auth_state} from './auth-context';
import {withRouter} from "react-router";
// import Cookies from 'universal-cookie';
import Cookies from 'js-cookie';
import {ajax_post} from "../ajax-utils/ajax-method";
import {api_list} from "../ajax-utils/api-manager";

// const cookies = new Cookies();

class mDropdown extends Component {
    render() {
        let menuItem;
        if(this.context.state) {
            menuItem = (
                <>
                    <Menu.Item text="全部课程" onClick={()=>{alert("Jump to all classes");}} />
                    <Menu.Divider />
                    <Menu.Item text="Logout" onClick={()=>{this.props.history.push("/logout");}} />
                </>
            );
        } else {
            menuItem = (
                <>
                    <Menu.Item text="Signup" onClick={()=>{this.props.history.push("/signup");}} />
                    <Menu.Divider />
                    <Menu.Item text="Login" onClick={()=>{this.props.history.push("/login");}} />
                </>
            )
        }
        return (
            <Menu className={Classes.ELEVATION_1}>
                {menuItem}
            </Menu>
        )
    }
}
mDropdown.contextType = AuthContext;

const Dropdown = withRouter(mDropdown);

class mTopbar extends Component {
    constructor(props) {
        super(props);
        this.handleHomeClick = this.handleHomeClick.bind(this);
        this.handlePublicClick = this.handlePublicClick.bind(this);
    }
    componentDidMount() {
        console.log(Cookies.get('mid'))
        if(this.context.state === false) {
            const id_cookie = Cookies.get('mid');
            console.log('cookie: ', id_cookie);
            if (!id_cookie) {
                this.props.history.push('/login');
            } else {
                ajax_post(api_list['query_user'], {id: parseInt(id_cookie)}, this, mTopbar.query_user_callback);
            }
        }
        // if(this.context.state === false) {
        //     this.props.history.push('/login');
        // }
    }
    static query_user_callback(that, result) {
        if(result.data.length===0)
            return;
        const data = result.data[0];
        auth_state.id = data.id;
        auth_state.role = data.role;
        auth_state.state = true;
    }
    handleHomeClick() {
        if(this.context.state) {
            if (this.context.role === 1) {
                this.props.history.push('/student');
            } else if (this.context.role === 2) {
                this.props.history.push('/ta');
            }
        } else {
            this.props.history.push('/login');
        }
    }
    handlePublicClick() {
        alert("Should jump to public questions.");
    }
    render() {
        return (
            <Navbar>
                <Navbar.Group align={Alignment.LEFT}>
                    <Navbar.Heading>THSSOJ</Navbar.Heading>
                    <Navbar.Divider />
                    <Button className={Classes.MINIMAL} icon="home" text="主页" onClick={this.handleHomeClick} />
                    <Button className={Classes.MINIMAL} icon="document" text="公共题库" onClick={this.handlePublicClick} />
                </Navbar.Group>
                <Navbar.Group align={Alignment.RIGHT}>
                    <Navbar.Divider />
                    <Popover content={<Dropdown></Dropdown>} position={Position.BOTTOM_LEFT}>
                        <Button className={Classes.MINIMAL} icon="user" />
                    </Popover>
                    <Button className={Classes.MINIMAL} icon="cog" onClick={()=>{
                        this.props.history.push('/usersettings');}}/>
                </Navbar.Group>
            </Navbar>
        )
    }
}
mTopbar.contextType = AuthContext;

class Bottombar extends Component {
    render() {
        return (
            <BSNavbar bg="light" sticky="bottom">
                <BSNavbar.Collapse className="justify-content-lg-center">
                    <BSNavbar.Text>
                        Developped by Thss
                    </BSNavbar.Text>
                </BSNavbar.Collapse>
            </BSNavbar>
        )
    }
}

const Topbar = withRouter(mTopbar);

export {Topbar, Bottombar};
