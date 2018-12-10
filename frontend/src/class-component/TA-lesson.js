import React, { Component } from 'react';

import {Container, Col, Row, Tabs, Tab} from 'react-bootstrap';

import {ZeroPadding, Spacing} from "./lesson-component";
import {Info} from "./lesson-component";
import {withRouter} from "react-router";
import {AnchorButton, Button, Card, Code, H5, Intent, Menu, Switch} from "@blueprintjs/core";
import {AddNewNotice} from "./TA-lesson-component";
import {ajax_post} from "../ajax-utils/ajax-method";
import {api_list} from "../ajax-utils/api-manager";

class mTAHomeworkCard extends Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }
    handleClick(event) {
        event.preventDefault();
        let id = event.target.id;
        id = id>=0? id:-id;
        const id_param = '/' + id.toString();
        const homework_id = '/' + this.props.homework_id.toString();
        const pathname = '/problemdetail';
        this.props.history.push({
            pathname: pathname + id_param + homework_id,
        });
    }
    render() {
        return (
            <Card style={Spacing}>
                <h5>{this.props.name}</h5>
                <Menu>
                    {this.props.questions.map((q)=>(<li>
                        <a id={(-q.id).toString()} onClick={this.handleClick} className="bp3-menu-item bp3-popover-dismiss">
                            <div id={q.id.toString()} className="bp3-text-overflow-ellipsis bp3-fill">{q.title}</div>
                        </a>
                    </li>))}
                </Menu>
            </Card>
        )
    }
}
const TAHomeworkCard = withRouter(mTAHomeworkCard);

class TAHomeworkPanel extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        console.log('TAHomeworkPanel: ', this.props);
        let homework2prob = {};
        for(let hw of this.props.homeworkitems) {
            homework2prob[hw.id.toString()] = [];
            const prob_ids = hw.problem_ids;
            console.log('TAHomeworkPanel: probs: ', hw.problems);
            // for(let prob of this.props.problemitems) {
            //     if(prob_ids.includes(prob.id)) {
            //         homework2prob[hw.id.toString()].push({
            //             id:prob.id,
            //             title:prob.title
            //         });
            //     }
            // }
            const pbs = hw.problems;
            for(let pb of pbs ) {
                homework2prob[hw.id.toString()].push({
                    id: pb.id,
                    title: pb.title,
                });
            }
        }
        return (
            <Card>
                {this.props.homeworkitems.map((hw)=>(
                    <TAHomeworkCard name={hw.name} questions={homework2prob[hw.id.toString()]} homework_id={hw.id} />
                ))}
            </Card>
        )
    }
}


class TAHomework extends Component {
    constructor(props) {
        super(props);
        console.log('TAHomework const', this.props);
        this.state= {
            tabname: [
                "已批改", "未批改"
            ],
            tabid: [
                'ch', 'uc'
            ],
            tabnum: [
                0, 1
            ],
            selectedId: 'ch'
        };
        this.handleChooseTab = this.handleChooseTab.bind(this);
    }

    handleChooseTab(newTabId, prevTabId, event) {
        this.setState({
            selectedId: newTabId
        })
    }

    render() {
        const tabname = this.state.tabname;
        const tabid = this.state.tabid;
        const tabnum = this.state.tabnum;
        const tabs = tabnum.map(
            (i) => <Tab eventKey={tabid[i]} title={tabname[i]}><TAHomeworkPanel
                homeworkitems={this.props.homeworkitems} problemitems={this.props.problemitems}/></Tab>
        );
        return (
            <Tabs defaultActiveKey={tabid[0]} id="homework-tab">
                {tabs}
            </Tabs>
        )
    }
}



class mTALessonPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            clickNewnotice: false,
            infoitems: [],
            homeworkitems: [],
            problemitems: [],
        };
        this.homeworkitems = [];
        this.problemitems = [];
        this.bindobjs = [];
        // this.courseInfo = null
        this.clickNewnotice = this.clickNewnotice.bind(this);
        this.query_notice_callback = this.query_notice_callback.bind(this);
        this.newnotice_callback = this.newnotice_callback.bind(this);
        this.query_homework_callback = this.query_homework_callback.bind(this);
        // this.append_homeworkItems_callback = this.append_homeworkItems_callback.bind(this);
    }

    query_homework_callback(that, result) {
        console.log('require course ');
        if(result.data.length === 0) {
            console.log('No course');
        }
        const data = result.data[0];
        console.log('course data: ', data)
        // const code = parseInt(data.code);
        // if(code !== 0){
        //     return ;
        // }
        let homeworkIdList = data.homeworks;
        console.log('homeworklist: ', homeworkIdList);
        // console.log
        for(let hid in homeworkIdList) {
            console.log('request hid: ', hid);
            ajax_post(api_list['query_homework'], {id: homeworkIdList[hid]}, that, that.append_homeworkItems_callback);
        }
        // let homeworks = [];
        // for(let index in result.data) {
        //     let item = {
        //         id: result.data[index].id,
        //         title: result.data[index].name,
        //         content: result.data[index].description
        //     };
        //     homeworks.push(item)
        // }
        // that.setState({homeworks: homeworks});
    }


    append_homeworkItems_callback(that, result) {
        // console.log('append homeworkitem: ', result);

        if(result.data.length === 0) {
            console.log('No items');
            return ;
        }
        // console.log('append homeworkitems-enter: ', this);
        let homeworklist = that.state.homeworkitems;
        const data = result.data[0];
        const code = parseInt(data.code);
        console.log('append homework: ', data);
        // if(code === 0) {
        // this.id_in_homeworklist = homeworklist.length;
        let idx = homeworklist.length;
        homeworklist.push({
            id: data.id,
            name: data.name,
            deadline: data.deadline,
            problem_ids: data.problems,
            problems: [],
        });
        that.setState({homeworkitems: homeworklist});
        that.homeworkitems = homeworklist;
        console.log('append homeworkitems: ', that.homeworkitems);
        for(let pid of data.problems) {
            ajax_post(api_list['query_problem'], {id: pid}, that, mTALessonPanel.append_problem_callback_wraper(idx));
        }
        // }

    }


    static append_problem_callback_wraper(idx) {
        return (function (that, result) {
            if(result.data.code===1) {
                return;
            }
            if(result.data.length===0)
                return;
            const title = result.data[0].title;
            const id = result.data[0].id;
            let homeworklist = that.state.homeworkitems;

            homeworklist[idx].problems.push({id: id, title: title});
            that.setState({homeworkitems: homeworklist});
            that.homeworkitems = homeworklist;
            console.log('append_prob: ', id, title, idx, that.homeworkitems);

        });
    }

    // static append_problem_callback(that, result) {
    //     if(result.data.code===1) {
    //         return;
    //     }
    //     if(result.data.length===0)
    //         return;
    //     const title = result.data[0].title;
    //     const id = result.data[0].id;
    //     let homeworklist = that.gp.state.homeworkitems;
    //     // homeworklist[that.id_in_homeworklist].problems.push({id:id, title:title});
    //     homeworklist[this.idx].problems.push({id: id, title: title});
    //     that.gp.setState({homeworkitems: homeworklist});
    //     that.gp.homeworkitems = homeworklist;
    //     console.log('append_prob: ', id, title, this.idx, that.gp);
    //     // that.problemitems.push({id:id, title:title});
    //     // that.setState({problemitems:that.problemitems});
    //     // that.problems.push({id:id, title:title})
    // }

    componentDidMount() {
        // console.log("componentDidMount");
        if (this.props.stu_id===-1 ||
            this.props.course_name==='') {
            return;
        }

        console.log("inside component did mount");
        console.log(this.props);

        console.log('mt: clear list');
        this.setState({homeworkitems: []});
        this.setState({problemitems: []});
        this.homeworkitems = [];
        this.problemitems = [];

        const course_id = this.props.course_id;
        ajax_post(api_list['query_notice'], {course_id:course_id}, this, this.query_notice_callback);
        ajax_post(api_list['query_course'], {id:course_id}, this, this.query_homework_callback);

        // ajax_post(api_list['query_homework'], {course_id:course_id}, this, this.query_homework_callback);

    }

    componentWillUpdate(nextProps) {
        // console.log('componentWillUpdate');
        if(nextProps.stu_id===-1)
            return;
        if(nextProps.stu_id !== this.props.stu_id ||
            nextProps.course_id !== this.props.course_id) {
            console.log(nextProps.course_id);
            const course_id = nextProps.course_id;
            // this.setState({homeworkitems: []});
            console.log('upd: clear list');
            this.setState({homeworkitems: []});
            this.setState({problemitems: []});
            this.homeworkitems = [];
            this.problemitems = [];

            ajax_post(api_list['query_notice'], {course_id: course_id}, this, this.query_notice_callback);
            // ajax_post(api_list['query_homework'], {course_id:course_id}, this, this.query_homework_callback);
            ajax_post(api_list['query_course'], {id:course_id}, this, this.query_homework_callback);

        }
    }

    clickNewnotice(event){
        event.preventDefault();
        event.stopPropagation();
        this.setState({
            clickNewnotice: true,
        });
    }

    newnotice_callback(){
        this.setState({
            clickNewnotice: false,
        });
        console.log(this.props.course_id);
        ajax_post(api_list['query_notice'], {course_id: this.props.course_id}, this, this.query_notice_callback);
    }



    query_notice_callback(that, result) {
        if (result.data.length === 0) {
            console.log("No notice got!");
            // return;
        }

        let infoItems = [];
        for (let index in result.data) {
            let item = {
                id: result.data[index].id,
                title: result.data[index].title,
                content: result.data[index].content
            };
            infoItems.push(item);
        }

        that.setState( {infoitems: infoItems} );
    }

    render() {
        let content;
        if (this.props.tabname === "作业"){
            console.log('to TAHomework', this.homeworkitems);
            content = (
                <Container fluid>
                    <Row>
                        <Col lg={9} style={ZeroPadding}>
                            <TAHomework homeworkitems={this.homeworkitems} problemitems={this.problemitems}/>
                        </Col>
                    </Row>
                </Container>

            );
        } else
        if (this.props.tabname === "成绩"){
            content = <div>cj</div>;
        } else
        if (this.props.tabname === "通知"){
            if (this.state.clickNewnotice) {
                content = (<AddNewNotice newnotice_callback={this.newnotice_callback}
                                         stu_id={this.props.stu_id}
                                         course_id={this.props.course_id}
                                         course_name={this.props.course_name}/>);
            } else
            {
                content = (<div>
                    <Button onClick={this.clickNewnotice}>
                        新建通知
                    </Button>
                    <Info infoitems={this.state.infoitems}/>
                </div>);
            }
        } else
        {
            content = <div></div>;
        }
        return (
            <div>
                {/*<h1>{this.props.tabname}</h1>*/}
                {content}
            </div>
        );
    }
}

const TALessonPanel =  withRouter(mTALessonPanel);

class TALessonTabs extends Component {
    constructor(props) {
        super(props);
        this.state= {
            tabname: [
                "作业", "成绩", "通知", "课程信息"
            ],
            tabid: [
                'hw', 'sc', 'nt', 'in'
            ],
            tabnum: [
                0, 1, 2, 3
            ],
            selectedId: 'hw'
        };
        this.handleChooseTab = this.handleChooseTab.bind(this);
    }

    handleChooseTab(newTabId, prevTabId, event) {
        this.setState({
            selectedId: newTabId
        })
    }

    render() {
        const tabname = this.state.tabname;
        const tabid = this.state.tabid;
        const tabnum = this.state.tabnum;
        const tabs = tabnum.map(
            (i) => <Tab eventKey={tabid[i]} title={tabname[i]}><TALessonPanel stu_id={this.props.stu_id} course_id={this.props.course_id} course_name={this.props.course_name} tabname={tabname[i]}/></Tab>
        );
        return (
            <Tabs defaultActiveKey={tabid[0]} id="homework-tab">
                {tabs}
            </Tabs>
        )
    }
}

class TALessonMiddle extends Component {
    constructor(props) {
        super(props);
        // this.state = {
        //     infoitems: [],
        //     homeworkitems: [],
        // };
        // this.infoitems = [];
        // this.homeworkitems = [];
    }

    render() {
        return (
            <div>
                <h1>{this.props.course_name}</h1>
                <Container fluid>
                    <Row>
                        <Col lg={12} style={ZeroPadding}>
                            <TALessonTabs stu_id={this.props.stu_id} course_id={this.props.course_id} course_name={this.props.course_name}/>
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}

export class TALesson extends Component {
    constructor(props) {
        super(props);
        // console.log("props id");
        // console.log(this.props.id);
        this.state = {
            course_name: '',
        };
    }

    componentDidMount() {
        // console.log("TALesson componentDidMount");
        const course_id = parseInt(this.props.lesson_id);
        console.log(course_id);
        ajax_post(api_list['query_course'], {id:course_id}, this, TALesson.query_course_callback);
    }

    // query_closure(args) {
    //     return function(that, result) {
    //
    //     }
    // }

    static query_course_callback(that, result) {
        if (result.data.length === 0){
            console.log("result.data.length === 0");
            return;
        }
        that.setState({
            course_name: result.data[0].name,
        });
    }


    render() {
        console.log(this.state.course_name);
        return (
            <TALessonMiddle stu_id={this.props.id} course_id={parseInt(this.props.lesson_id)} course_name={this.state.course_name}/>
        );
    }

}