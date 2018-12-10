import React, { Component } from 'react';
import {
    BrowserRouter as Router,
    Route,
    Redirect,
} from "react-router-dom";

import {LoginPage, SignupPage, LogoutPage} from './auth-component/LoginSignuppage';
import {StudentHomepage} from './class-component/student-homepage';
import {TAHomepage} from "./class-component/TA-homepage";
import {StudentLesson} from "./class-component/student-lesson";
import {TALesson} from "./class-component/TA-lesson"
import {ProblemDetail} from "./problem-component/problem-detail";

import {Topbar, Bottombar} from "./basic-component/topbottom-bar";
import {UserSettings} from "./auth-component/user-setting";
import {CreateLesson, EditLesson} from "./class-component/TA-create-lesson";

import Cookies from 'js-cookie';

import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import {ajax_post} from "./ajax-utils/ajax-method";
import {api_list} from "./ajax-utils/api-manager";

class Home extends Component {
    render() {
        return (
            <Redirect to="/login" />
        )
    }
}

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            state: false,
            id: -1,
            role: -1,
            jumpToLogin: false,
        };
        this.logout_callback = this.logout_callback.bind(this);
        this.login_callback = this.login_callback.bind(this);
    }
    componentDidMount() {
        const id_cookie = Cookies.get('mid');
        console.log('cookie: ', id_cookie);
        if(!id_cookie) {
            this.setState({
                jumpToLogin: true,
            });
        }
        if (id_cookie && !this.state.state) {
            ajax_post(api_list['query_user'], {id: parseInt(id_cookie)}, this, App.query_user_callback);
        }
    }
    static query_user_callback(that, result) {
        if(result.data.code===1) {
            this.setState({
                jumpToLogin: true,
            });
        }
        if(result.data.length===0) {
            this.setState({
                jumpToLogin: true,
            });
        }
        const data = result.data[0];
        that.setState({
            state: true,
            id: data.id,
            role: data.role,
        });
    }
    logout_callback() {
        this.setState({
            state: false,
            id: -1,
            role: -1
        });
    }
    login_callback(id, role) {
        this.setState({
            state: true,
            id: id,
            role: role,
        });
    }
    render() {
        if(this.state.jumpToLogin) {
            this.setState({
                jumpToLogin: false,
            });
            return(
                <Router>
                    <Redirect to="/login" />
                </Router>
            );
        }
        return (
            <div>
                <Router>
                    <div>
                        <Topbar {...this.state}/>
                        <Route exact path="/" component={Home} />
                        <Route path="/login" render={()=><LoginPage {...this.state} callback={this.login_callback} />} />
                        <Route path="/signup" render={()=><SignupPage {...this.state} />} />
                        <Route path="/logout" render={()=><LogoutPage {...this.state} callback={this.logout_callback} />} />
                        <Route path="/student" render={()=><StudentHomepage {...this.state} />} />
                        <Route path="/ta" render={()=><TAHomepage {...this.state} />} />
                        <Route path="/studentlesson/:id" render={(props) => <StudentLesson {...this.state} lesson_id={props.match.params.id} />} />
                        <Route path="/usersettings" render={()=><UserSettings {...this.state} />} />
                        <Route path="/talesson/:id" render={(props)=><TALesson {...this.state} lesson_id={props.match.params.id} />} />
                        <Route path="/problemdetail/:id/:hid" render={(props) => <ProblemDetail problem_id={props.match.params.id} homework_id={props.match.params.hid} {...this.state} />} />
                        <Route path="/createlesson" component={CreateLesson}/>
                        <Route path="/editlesson/:id" render={(props) => <EditLesson lesson_id={props.match.params.id} />} />
                    </div>
                </Router>
                <Bottombar/>
            </div>
        )
    }
}

export default App;
