import React, { Component } from 'react';

import {Container, Col, Row, Tabs, Tab} from 'react-bootstrap';

import {ZeroPadding, Spacing} from "./lesson-component";
import {withRouter, Link} from "react-router-dom";
import {WrappedAddNewNotice, TANoticeList} from "./TA-lesson-component";
import {AnchorButton, Button, Card, Code, H5, Intent, Menu as blueMenu, Switch} from "@blueprintjs/core";
import {ajax_post} from "../ajax-utils/ajax-method";
import {api_list} from "../ajax-utils/api-manager";
import {ShowLesson, ModifyLesson} from "./TA-create-lesson";

import { Layout, Breadcrumb, Menu, Icon, message } from 'antd';
const {Content, Sider} = Layout;
const { SubMenu } = Menu;

export class TALesson extends Component {
    constructor(props) {
        super(props);
        this.state = {
            course_name: '',
            current_selected: '1',

            clickNewnotice: false,
            infoitems: [],
            homeworkitems: [],
            problemitems: [],

        };

        this.query_notice_callback = this.query_notice_callback.bind(this);
        this.query_homework_callback = this.query_homework_callback.bind(this);
        this.newnotice_callback = this.newnotice_callback.bind(this);
        this.append_homeworkItems_callback = this.append_homeworkItems_callback.bind(this);
        this.clickNewnotice = this.clickNewnotice.bind(this);
        this.clickInfoModifyCallback = this.clickInfoModifyCallback.bind(this);
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
        ajax_post(api_list['query_course'], {id:course_id}, this, TALesson.query_course_callback);
        console.log("this.props ", this.props);

        this.setState({homeworkitems: []});
        this.setState({problemitems: []});
        this.homeworkitems = [];
        this.problemitems = [];

        ajax_post(api_list['query_notice'], {course_id:course_id}, this, this.query_notice_callback);
        ajax_post(api_list['query_course'], {id:course_id}, this, this.query_homework_callback);
    }

    static query_course_callback(that, result) {
        if (result.data.length === 0){
            console.log("result.data.length === 0");
            return;
        }
        that.setState({
            course_name: result.data[0].name,
        });
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
        console.log("newnotice_callback course_id: ", course_id);
        ajax_post(api_list['query_notice'], {course_id: course_id}, this, this.query_notice_callback);
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

    query_homework_callback(that, result) {
        console.log('require course ');
        if(result.data.length === 0) {
            console.log('No course');
            return;
        }
        const data = result.data[0];
        console.log('course data: ', data);
        let homeworkIdList = data.homeworks;
        console.log('homeworklist: ', homeworkIdList);
        for(let hid in homeworkIdList) {
            console.log('request hid: ', hid);
            ajax_post(api_list['query_homework'], {id: homeworkIdList[hid]}, that, that.append_homeworkItems_callback);
        }
    }

    append_homeworkItems_callback(that, result) {
        if(result.data.length === 0) {
            console.log('No items');
            return ;
        }
        let homeworklist = that.state.homeworkitems;
        const data = result.data[0];
        const code = parseInt(data.code);
        console.log('append homework: ', data);

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
            ajax_post(api_list['query_problem'], {id: pid}, that, TALesson.append_problem_callback_wraper(idx));
        }
    }

    clickInfoModifyCallback() {
        if (this.state.current_selected === '5')
            this.setState({current_selected: '6'});
        else if (this.state.current_selected === '6') {
            // this.query_data(parseInt(this.props.lesson_id));
            this.setState({current_selected: '5'});
        }
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

    render() {
        let breadcrumb;
        let content;
        const course_id = parseInt(this.props.lesson_id);
        if (this.state.current_selected === '1') {
            breadcrumb = (
                <>
                <Breadcrumb.Item>作业</Breadcrumb.Item>
                <Breadcrumb.Item>未截至作业</Breadcrumb.Item>
                </>
            );
            content = <h3>未截至作业</h3>;
        } else if (this.state.current_selected === '2') {
            breadcrumb = (
                <>
                    <Breadcrumb.Item>作业</Breadcrumb.Item>
                    <Breadcrumb.Item>未批改作业</Breadcrumb.Item>
                </>
            );
            content = <h3>未批改作业</h3>;
        } else if (this.state.current_selected === '3') {
            breadcrumb = (
                <>
                    <Breadcrumb.Item>作业</Breadcrumb.Item>
                    <Breadcrumb.Item>作业成绩</Breadcrumb.Item>
                </>
            );
            content = <h3>作业成绩</h3>;
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
                                    <Menu.Item key="1">未截至作业</Menu.Item>
                                    <Menu.Item key="2">未批改作业</Menu.Item>
                                    <Menu.Item key="3">作业成绩</Menu.Item>
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