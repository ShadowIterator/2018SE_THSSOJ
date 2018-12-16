import React, { Component } from 'react';

import {Container, Col, Row, Tabs, Tab} from 'react-bootstrap';

import {ZeroPadding, Spacing} from "./lesson-component";
import {withRouter, Link} from "react-router-dom";
import {WrappedAddNewNotice, TANoticeList, TAHomeworkPanel, TACreateHomework} from "./TA-lesson-component";
import {AnchorButton, Card, Code, H5, Intent, Menu as blueMenu, Switch} from "@blueprintjs/core";
import {ajax_post} from "../ajax-utils/ajax-method";
import {api_list} from "../ajax-utils/api-manager";
import {ShowLesson, ModifyLesson} from "./TA-create-lesson";
import moment from 'moment';
import { Layout, Breadcrumb, Menu, Icon, message, Button } from 'antd';
const {Content, Sider} = Layout;
const { SubMenu } = Menu;

export class TALesson extends Component {
    constructor(props) {
        super(props);
        this.state = {
            course_name: '',
            current_selected: '1',

            clickNewnotice: false,
            clickNewhomework: -2,   // -2     not click
                                    // -1     click new-homework
                                    // others click edit-homework
            infoitems: [],
            homeworkitems: [],
            problemitems: {},

        };

        this.newnotice_callback = this.newnotice_callback.bind(this);
        this.clickNewnotice = this.clickNewnotice.bind(this);
        this.clickInfoModifyCallback = this.clickInfoModifyCallback.bind(this);
        this.clickHomeworkCallback = this.clickHomeworkCallback.bind(this);
    }

    componentDidMount() {
        if (this.props.id===-1 ||
            this.props.course_name==='') {
            return;
        }
        const course_id = parseInt(this.props.lesson_id);
        this.query_data(course_id)
    }

    componentWillUpdate(nextProps) {
        if(nextProps.id===-1)
            return;
        if(nextProps.id !== this.props.id ||
            nextProps.lesson_id !== this.props.lesson_id) {
            const next_course_id = parseInt(nextProps.lesson_id);
            this.query_data(next_course_id);
            // console.log('next course id ', next_course_id);
            //
            // ajax_post(api_list['query_course'], {id:next_course_id}, this, TALesson.query_course_callback);
            //
            // this.setState({homeworkitems: []});
            // this.setState({problemitems: []});
            // this.homeworkitems = [];
            // this.problemitems = [];
            //
            // ajax_post(api_list['query_notice'], {course_id: next_course_id}, this, this.query_notice_callback);
            // ajax_post(api_list['query_course'], {id: next_course_id}, this, this.query_homework_callback);
        }
    }

    query_data(course_id) {
        console.log(course_id);

        this.setState({
                        homeworkitems: [],
                        infoitems: [],
                        problemitems: {}
                    });
        ajax_post(api_list['query_course'], {id:course_id}, this, TALesson.query_course_callback);
    }

    static query_course_callback(that, result) {
        if (result.data.length === 0){
            console.log("result.data.length === 0");
            return;
        }
        that.setState({
            course_name: result.data[0].name,
        });

        for (let index in result.data[0].notices) {
            ajax_post(api_list['query_notice'], {id: result.data[0].notices[index]}, that, TALesson.query_notice_callback);
        }
        for (let index in result.data[0].homeworks) {
            ajax_post(api_list['query_homework'], {id: result.data[0].homeworks[index]}, that, TALesson.query_homework_callback);
        }
    }

    static query_notice_callback(that, result) {
        if (result.data.length === 0){
            console.log("result.data.length === 0");
            return;
        }
        let infolist = that.state.infoitems;
        infolist.push({
                        id: result.data[0].id,
                        title: result.data[0].title,
                        content: result.data[0].content,
                        time: result.data[0].create_time
                    });
        infolist = infolist.sort((a,b)=>{
            if (a.time !== undefined && b.time !== undefined)
                return a.time-b.time;
            return 0;
        });
        that.setState({infoitems: infolist});
    }

    static query_homework_callback(that, result) {
        if (result.data.length === 0){
            console.log("result.data.length === 0");
            return;
        }
        let homeworklist = that.state.homeworkitems;
        homeworklist.push({
            id: result.data[0].id,
            name: result.data[0].name,
            description: result.data[0].description,
            deadline: result.data[0].deadline,
            problems: result.data[0].problems,
            score_openness: result.data[0].score_openness,
            submitable: result.data[0].submitable
        });
        homeworklist = homeworklist.sort((a,b)=>{
            if (a.deadline !== undefined && b.deadline !== undefined)
                return a.deadline-b.deadline;
            return 0;
        });
        that.setState({homeworkitems: homeworklist});
        for (let index in result.data[0].problems) {
            ajax_post(api_list['query_problem'], {id: result.data[0].problems[index]}, that, TALesson.query_problem_callback);
            ajax_post(api_list['query_judgestates'], {homework_id: result.data[0].id, problem_id: result.data[0].problems[index]}, that,
                (that, res) => {
                    let problemset = that.state.problemitems;
                    const id_str = result.data[0].problems[index].toString();
                    let problemitem;

                    if (res.data.length === 1) {    // get data
                        if (id_str in problemset) {
                            problemitem = problemset[id_str];
                        } else
                        {
                            problemitem = { id: result.data[0].problems[index] };
                        }
                        if (res.data[0].total === res.data[0].judged)
                            problemitem['judger_status'] = 2;   // finished
                        else
                            problemitem['judger_status'] = 1;   // judging
                    } else      // no data gotten
                    {
                        if (id_str in problemset) {
                            problemitem = problemset[id_str];

                        } else
                        {
                            problemitem = { id: result.data[0].problems[index] };
                        }
                        problemitem['judger_status'] = 0;   // NoStarted
                    }

                    problemset[id_str] = problemitem;
                    that.setState({
                        problemitems: problemset
                    });
                });
        }
    }

    static query_problem_callback(that, result) {
        if (result.data.length === 0){
            console.log("result.data.length === 0");
            return;
        }
        let problemset = that.state.problemitems;
        const id_str = result.data[0].id.toString();
        let problemitem;

        if (id_str in problemset) {
            problemitem = problemset[id_str];
            for (let key in result.data[0]) {
                problemitem[key] = result.data[0][key];
            }
        } else
        {
            problemitem = {
                id: result.data[0].id,
                title: result.data[0].title,
                description: result.data[0].description,
                time_limit: result.data[0].time_limit,
                memory_limit: result.data[0].memory_limit,
                judge_method: result.data[0].judge_method,
                language: result.data[0].language,
                openness: result.data[0].openness,
                status: result.data[0].status,
                user_id: result.data[0].user_id,
                test_language: result.data[0].test_language
            };
        }

        problemset[id_str] = problemitem;
        that.setState({problemitems: problemset});
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
        const course_id = parseInt(this.props.lesson_id);
        // console.log("newnotice_callback course_id: ", course_id);
        this.query_data(course_id);
    }

    clickInfoModifyCallback() {
        if (this.state.current_selected === '5')
            this.setState({current_selected: '6'});
        else if (this.state.current_selected === '6') {
            // this.query_data(parseInt(this.props.lesson_id));
            this.setState({current_selected: '5'});
        }
    }

    clickHomeworkCallback() {
        const course_id = parseInt(this.props.lesson_id);
        this.query_data(course_id);
        this.setState({
            clickNewhomework: -2,
        });
    }

    render() {
        console.log('problems ', this.state.problems);
        let breadcrumb;
        let content;
        const all_homework = this.state.homeworkitems;
        const before_ddl_homework = all_homework.filter(item => item.deadline >= moment().format('X'));
        const after_ddl_homework = all_homework.filter(item => item.deadline < moment().format('X'));
        const course_id = parseInt(this.props.lesson_id);
        if (this.state.clickNewhomework === -1) {
            breadcrumb = (
                <>
                    <Breadcrumb.Item>作业</Breadcrumb.Item>
                    <Breadcrumb.Item>新建作业</Breadcrumb.Item>
                </>
            );
            content = (
                <div>
                    <center><h3>新建作业</h3></center>
                    <TACreateHomework course_id={course_id}
                                      isEditing={false}
                                      id={this.props.id}
                                      clickCallback={this.clickHomeworkCallback}
                    />
                </div>
            );
        } else if (this.state.clickNewhomework !== -2) {
            const homeworkInfo = this.state.homeworkitems.filter(item => item.id===this.state.clickNewhomework)[0];
            if (homeworkInfo === undefined) {
                breadcrumb = (
                    <>
                        <Breadcrumb.Item>作业</Breadcrumb.Item>
                    </>
                );
                content = (
                    <div></div>
                )
            } else {
                breadcrumb = (
                    <>
                        <Breadcrumb.Item>作业</Breadcrumb.Item>
                        <Breadcrumb.Item>编辑作业<i>{homeworkInfo.name}</i></Breadcrumb.Item>
                    </>
                );
                const problems = Object.values(this.state.problemitems).filter(item => homeworkInfo.problems.indexOf(item.id) >= 0);
                content = (
                    <div>
                        <center><h3>编辑作业<i>{homeworkInfo.name}</i></h3></center>
                        <TACreateHomework course_id={course_id}
                                          isEditing={true}
                                          id={this.props.id}
                                          homework_id={homeworkInfo.id}
                                          name={homeworkInfo.name}
                                          description={homeworkInfo.description}
                                          deadline={homeworkInfo.deadline}
                                          problems={problems}
                                          clickCallback={this.clickHomeworkCallback}
                        />
                    </div>
                );
            }
        } else
        if (this.state.current_selected === '1') {
            breadcrumb = (
                <>
                <Breadcrumb.Item>作业</Breadcrumb.Item>
                <Breadcrumb.Item>未截止作业</Breadcrumb.Item>
                </>
            );
            if (before_ddl_homework.length === 0) {
                content = (
                    <div>
                        <h3>没有未截止的作业QAQ</h3>
                        <Button htmlType='button' onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            this.setState({clickNewhomework: -1});
                        }}>新建作业</Button>
                    </div>
                );
            } else {
                content = (
                    <div>
                        <Button htmlType='button' onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            this.setState({clickNewhomework: -1});
                        }}>新建作业</Button>
                        <TAHomeworkPanel homeworkitems={before_ddl_homework}
                                         problemitems={Object.values(this.state.problemitems)}
                                         course_id={parseInt(this.props.lesson_id)}
                                         clickEditCallback={(homework_id)=>{
                                             this.setState({
                                                 clickNewhomework: homework_id
                                             });
                                         }}
                        />
                    </div>
                );
            }
        } else if (this.state.current_selected === '2') {
            breadcrumb = (
                <>
                    <Breadcrumb.Item>作业</Breadcrumb.Item>
                    <Breadcrumb.Item>已截止作业</Breadcrumb.Item>
                </>
            );
            if (after_ddl_homework.length === 0) {
                content = (
                    <div>
                        <h3>没有已截止作业QAQ</h3>
                    </div>
                );
            } else {
                content = (
                    <div>
                        <TAHomeworkPanel homeworkitems={after_ddl_homework}
                                         problemitems={Object.values(this.state.problemitems)}
                                         course_id={parseInt(this.props.lesson_id)}
                                         clickEditCallback={(homework_id)=>{
                                             this.setState({
                                                 clickNewhomework: homework_id
                                             });
                                         }}
                        />
                    </div>
                );
            }
        } else if (this.state.current_selected === '3') {
            breadcrumb = (
                <>
                    <Breadcrumb.Item>作业</Breadcrumb.Item>
                    <Breadcrumb.Item>全部作业</Breadcrumb.Item>
                </>
            );
            if (all_homework.length === 0) {
                content = (
                    <div>
                        <h3>没有作业QAQ</h3>
                        <Button htmlType='button' onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            this.setState({clickNewhomework: -1});
                        }}>新建作业</Button>
                    </div>
                );
            } else {
                content = (
                    <div>
                        <Button htmlType='button' onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            this.setState({clickNewhomework: -1});
                        }}>新建作业</Button>
                        <TAHomeworkPanel homeworkitems={all_homework}
                                         problemitems={Object.values(this.state.problemitems)}
                                         course_id={parseInt(this.props.lesson_id)}
                                         clickEditCallback={(homework_id)=>{
                                             this.setState({
                                                 clickNewhomework: homework_id
                                             });
                                         }}
                        />
                    </div>
                );
            }
        } else if (this.state.current_selected === '4') {
            breadcrumb = (
                    <Breadcrumb.Item>通知</Breadcrumb.Item>
            );
            if (this.state.clickNewnotice) {
                content = (<WrappedAddNewNotice newnotice_callback={this.newnotice_callback}
                                                 stu_id={this.props.id}
                                                 course_id={course_id}
                                                 course_name={this.state.course_name}
                                                 cancel_callback={()=>{this.setState({clickNewnotice:false})}}/>);
            } else {
                content = (<TANoticeList infoitems={this.state.infoitems} newNotice={this.clickNewnotice}/>);
            }
        } else if (this.state.current_selected === '5') {
            breadcrumb = (
                    <Breadcrumb.Item>课程信息</Breadcrumb.Item>
            );
            content = (
                <ShowLesson {...this.props} clickModifyCallback={this.clickInfoModifyCallback} />
            );
        } else if (this.state.current_selected === '6') {
            breadcrumb = (
                <>
                    <Breadcrumb.Item>课程信息</Breadcrumb.Item>
                    <Breadcrumb.Item>修改</Breadcrumb.Item>
                </>
            );
            content = (
                <ModifyLesson {...this.props} clickModifyCallback={this.clickInfoModifyCallback}/>
            );
        }

        return (
            <>
            {/*<Container>*/}
                {/*<TALessonMiddle stu_id={this.props.id} course_id={parseInt(this.props.lesson_id)} course_name={this.state.course_name}/>*/}
            {/*</Container>*/}
                <Content style={{ padding: '0 50px' }}>
                    <Breadcrumb style={{ margin: '16px 0' }}>
                        <Breadcrumb.Item><Link to="/ta">主页</Link></Breadcrumb.Item>
                        <Breadcrumb.Item><Link to={"/talesson/"+this.props.lesson_id}>{this.state.course_name}</Link></Breadcrumb.Item>
                        {breadcrumb}
                    </Breadcrumb>
                    <Layout style={{ padding: '24px 0', background: '#fff' }}>
                        <Sider width={200} style={{ background: '#fff' }}>
                            <Menu
                                onClick={(e)=>{this.setState({current_selected: e.key})}}
                                mode="inline"
                                defaultSelectedKeys={['1']}
                                defaultOpenKeys={['sub1']}
                                style={{ height: '100%' }}
                            >
                                <SubMenu key="sub1" title={<span><Icon type="edit" />作业</span>}>
                                    <Menu.Item key="1">未截止作业</Menu.Item>
                                    <Menu.Item key="2">已截止作业</Menu.Item>
                                    <Menu.Item key="3">全部作业</Menu.Item>
                                </SubMenu>
                                <Menu.Item key="4"><Icon type="notification" />通知</Menu.Item>
                                <Menu.Item key="5"><Icon type="info-circle" />课程信息</Menu.Item>
                            </Menu>
                        </Sider>
                        <Content style={{ padding: '0 24px', minHeight: 280 }}>
                            {content}
                        </Content>
                    </Layout>
                </Content>
            </>
        );
    }

}