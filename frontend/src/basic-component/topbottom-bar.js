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
import {withRouter} from "react-router";

class mDropdown extends Component {
    render() {
        let menuItem;
        if(this.props.state) {
            menuItem = (
                <div>
                    <Menu.Item text="全部课程" onClick={()=>{alert("Jump to all classes");}} />
                    <Menu.Divider />
                    <Menu.Item text="Logout" onClick={()=>{this.props.history.push("/logout");}} />
                </div>
            );
        } else {
            menuItem = (
                <div>
                    <Menu.Item text="Signup" onClick={()=>{this.props.history.push("/signup");}} />
                    <Menu.Divider />
                    <Menu.Item text="Login" onClick={()=>{this.props.history.push("/login");}} />
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
// mDropdown.contextType = AuthContext;

const Dropdown = withRouter(mDropdown);

class mTopbar extends Component {
    constructor(props) {
        super(props);
        this.handleHomeClick = this.handleHomeClick.bind(this);
        this.handlePublicClick = this.handlePublicClick.bind(this);
    }
    handleHomeClick() {
        if(this.props.state && this.props.role) {
            if (this.props.role === 1) {
                this.props.history.push('/student');
            } else if (this.props.role === 2) {
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
                    <Popover content={<Dropdown {...this.props}/>} position={Position.BOTTOM_LEFT}>
                        <Button className={Classes.MINIMAL} icon="user" />
                    </Popover>
                    {this.props.state &&
                        <Button className={Classes.MINIMAL} icon="cog" onClick={() => {
                            this.props.history.push('/usersettings');
                        }}/>
                    }
                </Navbar.Group>
            </Navbar>
        )
    }
}
// mTopbar.contextType = AuthContext;

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
