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

import {AdminPage} from "./admin-component/admin-page";
import {ProblemBase} from "./problem-base/problem-base";

import {ProblemCreate} from "./problem-component/problem-create";
import {MyProblem} from "./problem-component/problem-my";

import {JudgeHTML} from "./problem-component/problem-judge-html";
import {AllLesson} from "./class-component/TA-allLesson";
import {TAJudge} from "./class-component/TA-judge";

import {Help} from "./basic-component/help";

import { Layout } from 'antd';
import 'antd/dist/antd.css';

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
            username: '',
            use_hard: false,
        };
        this.logout_callback = this.logout_callback.bind(this);
        this.login_callback = this.login_callback.bind(this);
        this.changeDisplay_calback = this.changeDisplay_calback(this);
    }
    componentDidMount() {
        const id_cookie = Cookies.get('mid');
        ////console.log('cookie: ', id_cookie);
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
            that.setState({
                jumpToLogin: true,
            });
            return;
        }
        if(result.data.length===0) {
            that.setState({
                jumpToLogin: true,
            });
            return;
        }
        const data = result.data[0];
        that.setState({
            state: true,
            id: data.id,
            role: data.role,
            username: data.username,
        });
    }
    logout_callback() {
        this.setState({
            state: false,
            id: -1,
            role: -1,
            username: '',
        });
    }
    login_callback(id, role, username) {
        this.setState({
            state: true,
            id: id,
            role: role,
            username: username,
        });
    }
    changeDisplay_calback(use_hard) {
        this.setState({
            use_hard: use_hard,
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
                        <Layout>
                            <Topbar {...this.state} callback={(use_hard)=>{this.setState({use_hard: use_hard})}}/>
                            <Route exact path="/" component={Home} />
                            <Route path="/admin" render={()=><AdminPage {...this.state} />} />
                            <Route path="/login" render={()=><LoginPage {...this.state} callback={this.login_callback} />} />
                            <Route path="/signup" render={()=><SignupPage {...this.state} />} />
                            <Route path="/logout" render={()=><LogoutPage {...this.state} callback={this.logout_callback} />} />
                            <Route path="/student" render={()=><StudentHomepage {...this.state} />} />
                            <Route path="/ta" render={()=><TAHomepage {...this.state} />} />
                            <Route path="/studentlesson/:id" render={(props) => <StudentLesson {...this.state}
                                                                                               lesson_id={props.match.params.id} />} />
                            <Route path="/usersettings" render={()=><UserSettings {...this.state} />} />
                            <Route path="/talesson/:id" render={(props)=><TALesson {...this.state} lesson_id={props.match.params.id} />} />
                            <Route path="/problemdetail/:pid/:hid/:lid" render={(props) => <ProblemDetail problem_id={props.match.params.pid}
                                                                                                         homework_id={props.match.params.hid}
                                                                                                         lesson_id={props.match.params.lid}
                                                                                                         {...this.state} />} />
                            <Route path="/createlesson" render={() => <CreateLesson {...this.state} />} />
                            <Route path="/editlesson/:id" render={(props) => <EditLesson lesson_id={props.match.params.id} {...this.state} />} />
                            <Route path="/problembase" render={(props) => <ProblemBase {...this.state} />} />
                            <Route path="/problemcreate" render={(props) => <ProblemCreate {...this.state} />} />
                            <Route path="/myproblem" render={(props) => <MyProblem {...this.state} />} />
                            <Route path="/problemedit/:id" render={(props) => <ProblemCreate {...this.state} isEditing={true}
                                                                                             problem_id={props.match.params.id} />} />
                            <Route path="/judgehtml/:cid/:hid/:pid" render={(props) => <JudgeHTML {...this.state}
                                                                                                  course_id={props.match.params.cid}
                                                                                                  homework_id={props.match.params.hid}
                                                                                                  problem_id={props.match.params.pid}
                                                                                                  callback={(use_hard)=>{this.setState({use_hard: use_hard})}}/>} />
                            <Route path="/alllessons" render={(props) => <AllLesson {...this.state} />}/>
                            <Route path="/tajudge/:cid/:hid/:pid" render={(props) => <TAJudge {...this.state}
                                                                                              course_id={props.match.params.cid}
                                                                                              homework_id={props.match.params.hid}
                                                                                              problem_id={props.match.params.pid} />} />
                            <Route path="/help" render={() => <Help />} />
                        </Layout>
                    </div>
                </Router>
                <Bottombar/>
            </div>
        )
    }
}

export default App;
