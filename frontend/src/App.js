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

import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";

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
    }
    render() {
        return (
            <>
                <Router>
                    <div>
                        <Topbar/>
                        <Route exact path="/" component={Home} />
                        <Route path="/login" component={LoginPage} />
                        <Route path="/signup" component={SignupPage} />
                        <Route path="/logout" component={LogoutPage} />
                        <Route path="/student" component={StudentHomepage} />
                        <Route path="/ta" component={TAHomepage} />
                        <Route path="/studentlesson" component={StudentLesson} />
                        <Route path="/usersettings" component={UserSettings} />
                        <Route path="/talesson" component={TALesson} />
                        <Route path="/problemdetail" component={ProblemDetail} />
                    </div>
                </Router>
                <Bottombar/>
            </>
        )
    }
}

export default App;
