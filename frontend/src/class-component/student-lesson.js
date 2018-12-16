import React, { Component } from 'react';

import {Icon as Blueicon} from '@blueprintjs/core';

import {api_list} from "../ajax-utils/api-manager";
import {ajax_post} from "../ajax-utils/ajax-method";
import {withRouter, Link} from "react-router-dom";

// import moment from 'moment';

import { Layout, Breadcrumb, Menu, List, Row, Col, Icon } from 'antd';
import moment from 'moment'
const {Content, Sider} = Layout;
const { SubMenu } = Menu;

const result_arr = ['Accepted',
    'Wrong Answer',
    'Runtime Error',
    'Time Limit Exceed',
    'Memory Limit Exceed',
    'Output Limit Exceed',
    'Danger System Call',
    'Judgement Failed',
    'Compile Error',
    'unknown',
];
/*
将作业状态一共分为三大类：未到截止日期，已过截止日期，全部
未到截止日期：使用timestamp区分是否到达截止日期
    未提交 issue 红 通过是否能够查询到record_type===2的记录来判断 "未提交"
    已提交 saved 绿 "已提交"
已过截止日期：
    未提交且无法补交 heart-broken 白 通过是否查询到记录来判断是否已经提交 并且通过作业中的状态submitable来判断是否可以补交 "无法补交"
    未提交但是可以补交 issue 红 "未提交"
    已提交但未批改 saved 绿 首先得要是提交过的，然后查询作业中的score_openness来判断是否已经公开成绩 "已提交"
    已提交且已批改 confirm 绿 如果已经公开成绩，则查询记录中的对应项 "{给分数就好了}"
 */


class mStudentHomeworkCard extends Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
        this.handleClickId = this.handleClickId.bind(this);
    }
    handleClick(event) {
        event.preventDefault();
        let id = event.target.id;
        id = id>=0? id:-id;
        const id_param = '/' + id.toString();
        const homework_id = '/' + this.props.homework_id.toString();
        const pathname = '/problemdetail';
        const course_id = '/' + this.props.course_id.toString();
        this.props.history.push({
            pathname: pathname + id_param + homework_id + course_id,
        });
    }
    handleClickId(id) {
        return (event) => {
            event.preventDefault();
            const id_param = '/' + id.toString();
            const homework_id = '/' + this.props.homework_id.toString();
            const pathname = '/problemdetail';
            const course_id = '/' + this.props.course_id.toString();
            this.props.history.push({
                pathname: pathname + id_param + homework_id + course_id,
            });
        }
    }
    render() {
        console.log("questions:", this.props.deadline);
        const ddl_str = moment.unix(this.props.deadline).format('YYYY年MM月DD日');
        // let xicon =

        console.log('krender-homework: ', this.props);
        return (
            <div style={{margin: '20px'}}>
                <List
                    header={
                        <Row type="flex" justify="space-around" align="middle">
                            <Col span={18}>
                                <h4>{this.props.name}</h4>
                            </Col>
                            <Col span={6} style={{textAlign: 'right'}}>
                                <span>截止日期：{ddl_str}</span>
                            </Col>
                        </Row>
                    }
                    bordered
                    dataSource={this.props.questions}
                    renderItem={item => {
                        // console.log("check homework item", item);
                        /*
                        将作业状态一共分为三大类：未到截止日期，已过截止日期，全部
                        未到截止日期：使用timestamp区分是否到达截止日期
                            未提交 issue 红 通过是否能够查询到record_type===2的记录来判断 "未提交"
                            已提交 saved 绿 "已提交"
                        已过截止日期：
                            未提交且无法补交 heart-broken 白 通过是否查询到记录来判断是否已经提交 并且通过作业中的状态submitable来判断是否可以补交 "无法补交"
                            未提交但是可以补交 issue 红 "未提交"
                            已提交但未批改 saved 绿 首先得要是提交过的，然后查询作业中的score_openness来判断是否已经公开成绩 "已提交"
                            已提交且已批改 confirm 绿 如果已经公开成绩，则查询记录中的对应项 "{给分数就好了}"
                         */
                        const now = moment().unix();
                        const delayed = (now >  this.props['deadline']);
                        const submitable = (this.props['submitable'] === undefined ? false : this.props['submitable']);
                        const judged = (this.props['score_openness'] === undefined ? false : this.props['score_openness']);
                        const submitted = (item.result_type !== -1);
                        console.log('render-problems: ', item, delayed, submitable, judged, submitted);
                        let problem_res = '没有结果';
                        let problem_info = '未知的作业状态';
                        let icon_name = 'issue';
                        let icon_intent = 'Danger';
                        if(item.status === undefined) {
                            item.status = {};
                        }
                        if(item.result_type === undefined)
                        {
                            item.status = 0;
                        }
                        else
                        {
                            if(item.result_type === 1) {
                                problem_res = result_arr[item.result];
                            }
                            else if(item.result_type === 2) {
                                problem_res = item.score.toString();
                            }
                            if( (!submitted) && (!delayed)) // 未提交未到截止日期
                            {
                                item.status = 1;
                                problem_info = '未提交未到截止日期';
                                icon_name = 'issue';
                                icon_intent = 'Danger';
                            }
                            else if((!!submitted) && (!delayed)) //已提交未到截止日期
                            {
                                item.status = 2;
                                problem_info = '已提交未到截止日期';
                                icon_name = 'saved';
                                icon_intent = 'Success';
                            }
                            else if((!submitted) && (!!delayed) && (!submitable)) //未提交无法补交
                            {
                                item.status = 3;
                                problem_info = '未提交无法补交'
                                icon_name = 'heart-broken';
                                icon_intent = 'None';
                            }
                            else if((!submitted) && (!!delayed) && (!!submitable)) //未提交可以补交
                            {
                                item.status = 4;
                                problem_info = '未提交可以补交';
                                icon_name = 'issue';
                                icon_intent = 'Danger';
                            }
                            else if((!!submitted) && (!!delayed) && (!judged)) //已提交未批改
                            {
                                item.status = 5;
                                problem_info = '已提交未批改';
                                icon_name = 'saved';
                                icon_intent = 'Success';
                            }
                            else if((!!submitted) && (judged) && (!!delayed)) //已提交已批改
                            {
                                problem_info = problem_res;
                                icon_name = 'confirm';
                                icon_intent = 'Warning';
                                if(problem_info === '100' || problem_info === 'Accepted')
                                {
                                    icon_intent = 'Success';
                                }
                            }

                        }
                        return (
                            <List.Item key={item.id}>
                                <List.Item.Meta title={<a onClick={this.handleClickId(item.id)}>{item.title}</a>} />
                                {<div><Blueicon icon={icon_name} intent={icon_intent} /><span style={{marginLeft: 5}}>{problem_info}</span></div>}
                            </List.Item>);
                    }}
                />
            </div>
        );

        // {item.status.flag === 0 && <div>未完成</div>}
        // {item.status.flag===1 && <div>已完成</div>}
        // {item.status.flag===2 && <div>已批改</div>}
    }
}
const StudentHomeworkCard = withRouter(mStudentHomeworkCard);

class StudentHomeworkPanel extends Component {
    render() {
        let homework2prob = {};
        for(let hw of this.props.homeworkitems) {
            homework2prob[hw.id.toString()] = [];
            const prob_ids = hw.problem_ids;
            for(let prob of this.props.problemitems) {
                if(prob_ids.includes(prob.id)) {
                    homework2prob[hw.id.toString()].push({
                        id:prob.id,
                        title:prob.title,
                        status:prob.status,
                    });
                }
            }
        }
        // return (
        //     <div>
        //         {this.props.homeworkitems.map((hw)=>(
        //             <StudentHomeworkCard name={hw.name} questions={homework2prob[hw.id.toString()]} homework_id={hw.id}
        //                                  course_id={this.props.course_id}
        //                                  deadline={hw.deadline === undefined ? 0 : hw.deadline} />
        //         ))}
        //     </div>
        // )
        return (
            <div>
                {this.props.homeworkitems.map((hw)=>(
                    <StudentHomeworkCard name={hw.name} questions={hw['problem_list']} homework_id={hw.id}
                                         course_id={this.props.course_id}
                                         deadline={hw.deadline === undefined ? 0 : hw.deadline}
                                         submitable = {hw['submitable']}
                                         score_openness = {hw['score_openness']}/>

                ))}
            </div>
        )
    }
}

class StudentHomework extends Component {
    render() {
        return (
            <StudentHomeworkPanel
                homeworkitems={this.props.homeworkitems} problemitems={this.props.problemitems} course_id={this.props.course_id}/>
        )
    }
}

class mStudentLessonMiddle extends Component {
    constructor(props) {
        super(props);
        this.state = {
            infoitems: [],
            homeworkitems: [],
            problemitems: [],
            lesson_name: '',
            current_selected: '1',
            homeworkstatus: {},
        };
        this.infoitems = [];
        this.homeworkitems = [];
        this.problemitems = [];
        this.homeworkstatus = {};
    }
    componentDidMount() {
        const course_id = parseInt(this.props.course_id);
        // ajax_post(api_list['query_course'], {id:course_id}, this, StudentLessonMiddle.query_course_callback);
        this.setState({homeworkitems: []});
        this.update_pannel(course_id);
    }

    check_homework = (hw, selected) => {
        // 未截止日期作业
        //     {/*<Menu.Item key="1">已提交作业</Menu.Item>*/}
        //     {/*<Menu.Item key="2">未提交作业</Menu.Item>*/}
        // {/*</SubMenu>*/}
        // {/*<SubMenu key="sub1" title={<span><Icon type="edit" theme="twoTone" />已到截止日期作业</span>}>*/}
        // {/*<Menu.Item key="7">未提交且无法补交</Menu.Item>*/}
        //     {/*<Menu.Item key="8">未提交但是可以补交</Menu.Item>*/}
        //     {/*<Menu.Item key="9">已提交但未批改</Menu.Item>*/}
        //     {/*<Menu.Item key="10">已提交且已批改</Menu.Item>*/}
        //     if(that.state.current_selected === 1) {
        //         ajax_post(api_list['query_record'], {
        //             user_id: ,
        //
        //         })
        //     }
        //   const  now = moment();
        const now = moment().unix();
        // console.log('checkhw: ',hw, selected, now, !!hw['submited'], (now < hw['deadline']), (!!hw['submited']) && (now < hw['deadline']));

        switch (selected) {
          case '1':
              // console.log('checkhw case1: ', (!!hw['submited']) && (now < hw['deadline']));
              return (now < hw['deadline']);
              // break;
          case '2':
              return (now >= hw['deadline']);
              // break;
          case '3':
              return true;
          default:
              return false;
        }
    };

    update_pannel = (course_id) => {
        console.log('update_pannel');
        ajax_post(api_list['query_course'], {id:course_id}, this, (that, result) =>{
            if(result.data.length===0)
                return;
            that.setState({lesson_name:result.data[0].name});
            const notice_ids = result.data[0].notices;
            const homework_ids = result.data[0].homeworks;
            let homework_items = [];
            for(let homework_id of homework_ids) {
                ajax_post(api_list['query_homework'], {id:homework_id}, that, (that, result) => {
                    console.log('query_homework: ', homework_id);
                    let hw = result.data[0];
                    if(!this.check_homework(hw, that.state.current_selected)) {
                        console.log('query_homework: returned');
                        return ;
                    }
                    console.log('query_homework: succeed');

                    hw['problem_list'] = [];
                    hw['type_key'] = that.state.current_selected;
                    // homework_items[homework_id.toString()] = hw;
                    homework_items.push(hw);
                    const problem_ids = hw['problems'];
                    for(let problem_id of problem_ids) {
                        ajax_post(api_list['query_problem'], {id: problem_id}, that, (that, result) => {
                            let prob = result.data[0];
                            console.log('query_problem: ', problem_id, result.data);
                            hw['problem_list'].push(prob);
                            console.log('query_problem: ', homework_items);
                            console.log('query_problems_after_setstate: ', that.state.homeworkitems);
                            ajax_post(api_list['query_record'],
                                {
                                        user_id: this.props.id,
                                        homework_id: homework_id,
                                        problem_id: problem_id,
                                        record_type: 2,
                                    },
                                that,
                                (that, result) => {
                                    if(result.data.length > 0) {
                                        const data = result.data[0];
                                        prob['result_type'] = data['result_type'];
                                        prob['result'] = data['result'];
                                        prob['score'] = data['score'];
                                    }
                                    else prob['result_type'] = -1;
                                    that.setState({homeworkitems: homework_items});
                            });
                            /*
                            将作业状态一共分为三大类：未到截止日期，已过截止日期，全部
                            未到截止日期：使用timestamp区分是否到达截止日期
                                未提交 issue 红 通过是否能够查询到record_type===2的记录来判断 "未提交"
                                已提交 saved 绿 "已提交"
                            已过截止日期：
                                未提交且无法补交 heart-broken 白 通过是否查询到记录来判断是否已经提交 并且通过作业中的状态submitable来判断是否可以补交 "无法补交"
                                未提交但是可以补交 issue 红 "未提交"
                                已提交但未批改 saved 绿 首先得要是提交过的，然后查询作业中的score_openness来判断是否已经公开成绩 "已提交"
                                已提交且已批改 confirm 绿 如果已经公开成绩，则查询记录中的对应项 "{给分数就好了}"
                             */

                        });
                    }
                });
            }

        });
    };
    static query_course_callback(that, result) {
        if(result.data.length===0)
            return;
        that.setState({lesson_name:result.data[0].name});
        const notice_ids = result.data[0].notices;
        const homework_ids = result.data[0].homeworks;
        for(let notice_id of notice_ids) {
            ajax_post(api_list['query_notice'], {id:notice_id}, that, StudentLessonMiddle.query_notice_callback);
        }
        for(let homework_id of homework_ids) {
            ajax_post(api_list['query_homework'], {id:homework_id}, that, StudentLessonMiddle.query_homework_callback);
        }
    }
    static query_homework_callback(that, result) {
        if(result.data.length===0)
            return;
        const hw = result.data[0];
        const id = hw.id;
        const name = hw.name;
        const deadline = hw.deadline;
        const problem_ids = hw.problems;
        that.homeworkitems.push({
            id:id,
            name:name,
            deadline:deadline,
            problem_ids:problem_ids,
        });
        that.homeworkstatus[id.toString()] = {};
        that.setState({homeworkitems:that.homeworkitems});
        for(let prob_id of problem_ids) {
            ajax_post(api_list['query_record'], {
                user_id: that.props.id,
                problem_id: prob_id,
                homework_id: id,
                record_type: 2,
            }, that, (that, result)=>{
                if(result.data.length === 0) {
                    that.homeworkstatus[id.toString()][prob_id.toString()] = {
                        flag: 0,
                        record: null,
                    };
                } else if(result.data[0].status === 0) {
                    that.homeworkstatus[id.toString()][prob_id.toString()] = {
                        flag: 1,
                        record: result.data[0],
                    };
                } else {
                    that.homeworkstatus[id.toString()][prob_id.toString()] = {
                        flag: 1,
                        record: result.data[0],
                    };
                }
                that.setState({homeworkstatus: that.homeworkstatus});
            });
        }
        for(let prob_id of problem_ids) {
            ajax_post(api_list['query_problem'], {id:prob_id}, that, StudentLessonMiddle.query_problem_callback);
        }
    }
    static query_notice_callback(that, result) {
        if(result.data.length===0)
            return;
        const title = result.data[0].title;
        const content = result.data[0].content;
        const id = result.data[0].id;
        that.infoitems.push({id:id, title:title, content:content});
        that.setState({infoitems:that.infoitems});
    }
    static query_problem_callback(that, result) {
        if(result.data.code===1) {
            return;
        }
        if(result.data.length===0)
            return;
        const title = result.data[0].title;
        const id = result.data[0].id;
        that.problemitems.push({id:id, title:title});
        console.log("query_problem_callback", that.problemitems);
        that.setState({problemitems:that.problemitems});
    }
    render() {
        // console.log("problem items", this.problemitems);
        // console.log("homework items", this.homeworkitems);
        // console.log("homework status", this.homeworkstatus);
        console.log('render-homework: ', this.state.homeworkitems);
        // this.infoitems.sort(function(a, b) {
        //     const ida = a.id;
        //     const idb = b.id;
        //     return (ida<idb) ? -1 : (ida>idb) ? 1 : 0;
        // });
        // this.problemitems.sort(function(a, b) {
        //     const ida = a.id;
        //     const idb = b.id;
        //     return (ida<idb) ? -1 : (ida>idb) ? 1 : 0;
        // });
        // this.homeworkitems.sort(function(a, b) {
        //     const ida = a.id;
        //     const idb = b.id;
        //     return (ida<idb) ? -1 : (ida>idb) ? 1 : 0;
        // });
        let breadcrumb, panel;
        // if(this.state.current_selected==='1') {
        //     breadcrumb=(<>
        //         <Breadcrumb.Item>作业</Breadcrumb.Item>
        //         <Breadcrumb.Item>未完成作业</Breadcrumb.Item>
        //     </>);
        //     let unfinished_homeworkitems = [];
        //     let unfinished_problemitems = [];
        //     for(const homework of this.homeworkitems) {
        //         const id = homework.id;
        //         let flag = 0;
        //         for(const prob_id in this.homeworkstatus[id.toString()]) {
        //             if(this.homeworkstatus[id.toString()][prob_id].flag===0) {
        //                 flag = 1;
        //                 break;
        //             }
        //         }
        //         for(const prob_id in this.homeworkstatus[id.toString()]) {
        //             if(this.homeworkstatus[id.toString()][prob_id].flag===2) {
        //                 flag = 0;
        //                 break;
        //             }
        //         }
        //         if(flag === 1) {
        //             unfinished_homeworkitems.push(homework);
        //             for(const prob_id of homework.problem_ids) {
        //                 for(const prob_item of this.problemitems) {
        //                     if(prob_id === prob_item.id) {
        //                         let prob_item_new = prob_item;
        //                         prob_item_new.status = this.homeworkstatus[id.toString()][prob_id.toString()];
        //                         unfinished_problemitems.push(prob_item_new);
        //                     }
        //                 }
        //             }
        //         }
        //     }
        //     if(unfinished_homeworkitems.length !== 0) {
        //         panel = (
        //             <StudentHomework homeworkitems={unfinished_homeworkitems} problemitems={unfinished_problemitems}
        //                              course_id={this.props.course_id}/>);
        //     } else {
        //         panel = (<h3>您当前没有未完成的作业</h3>)
        //     }
        //
        // } else if(this.state.current_selected==='2') {
        //     breadcrumb=(<>
        //         <Breadcrumb.Item>作业</Breadcrumb.Item>
        //         <Breadcrumb.Item>已完成但未批改作业</Breadcrumb.Item>
        //     </>);
        //     let finished_homeworkitems = [];
        //     let finished_problemitems = [];
        //     for(const homework of this.homeworkitems) {
        //         const id = homework.id;
        //         let flag = 0;
        //         for(const prob_id in this.homeworkstatus[id.toString()]) {
        //             if(this.homeworkstatus[id.toString()][prob_id].flag!==1) {
        //                 flag = 1;
        //                 break;
        //             }
        //         }
        //         if(flag === 0) {
        //             finished_homeworkitems.push(homework);
        //             for(const prob_id of homework.problem_ids) {
        //                 for(const prob_item of this.problemitems) {
        //                     if(prob_id === prob_item.id) {
        //                         let prob_item_new = prob_item;
        //                         prob_item_new.status = this.homeworkstatus[id.toString()][prob_id.toString()];
        //                         finished_problemitems.push(prob_item_new);
        //                     }
        //                 }
        //             }
        //         }
        //     }
        //     if(finished_homeworkitems.length !== 0) {
        //         panel = (<StudentHomework homeworkitems={finished_homeworkitems} problemitems={finished_problemitems}
        //                                   course_id={this.props.course_id}/>);
        //     } else {
        //         panel = (<h3>您当前没有已完成但未批改的作业</h3>)
        //     }
        // } else if(this.state.current_selected==='3') {
        //     breadcrumb=(<>
        //         <Breadcrumb.Item>作业</Breadcrumb.Item>
        //         <Breadcrumb.Item>已批改作业</Breadcrumb.Item>
        //     </>);
        //     let judged_homeworkitems = [];
        //     let judged_problemitems = [];
        //     for(const homework of this.homeworkitems) {
        //         const id = homework.id;
        //         let flag = 0;
        //         for(const prob_id in this.homeworkstatus[id.toString()]) {
        //             if(this.homeworkstatus[id.toString()][prob_id].flag===2) {
        //                 flag = 1;
        //                 break;
        //             }
        //         }
        //         if(flag === 1 || homework.status === 2) {
        //             judged_homeworkitems.push(homework);
        //             for(const prob_id of homework.problem_ids) {
        //                 for(const prob_item of this.problemitems) {
        //                     if(prob_id === prob_item.id) {
        //                         let prob_item_new = prob_item;
        //                         prob_item_new.status = this.homeworkstatus[id.toString()][prob_id.toString()];
        //                         judged_problemitems.push(prob_item_new);
        //                     }
        //                 }
        //             }
        //         }
        //     }
        //     if(judged_homeworkitems.length !== 0) {
        //         panel = (<StudentHomework homeworkitems={judged_homeworkitems} problemitems={judged_problemitems}
        //                                   course_id={this.props.course_id}/>);
        //     } else {
        //         panel = (<h3>您当前没有已批改的作业</h3>)
        //     }
        // } else if(this.state.current_selected==='4') {
        //     breadcrumb=(<>
        //         <Breadcrumb.Item>作业</Breadcrumb.Item>
        //         <Breadcrumb.Item>全部作业</Breadcrumb.Item>
        //     </>);
        //     if(this.homeworkitems.length !== 0) {
        //         panel = (<StudentHomework homeworkitems={this.homeworkitems} problemitems={this.problemitems}
        //                                   course_id={this.props.course_id}/>);
        //     } else {
        //         panel = (<h3>您当前没有作业</h3>)
        //     }
        // } else if(this.state.current_selected==='5') {
        //     breadcrumb=(<Breadcrumb.Item>通知</Breadcrumb.Item>);
        //     panel=(<Info infoitems={this.infoitems}/>);
        // } else if(this.state.current_selected==='6') {
        //     breadcrumb = (<Breadcrumb.Item>课程信息</Breadcrumb.Item>);
        //     panel = (<div>TODO: 课程信息</div>)
        // }
        breadcrumb=(<Breadcrumb.Item>通知</Breadcrumb.Item>);
        if(this.state.homeworkitems.length !== 0) {
            panel = (<StudentHomework homeworkitems={this.state.homeworkitems} problemitems={this.problemitems}
                                      course_id={this.props.course_id}/>);
        } else {
            panel = (<h3>您当前没有作业</h3>)
        }
        return (
            <Content style={{ padding: '0 50px' }}>
                <Breadcrumb style={{ margin: '16px 0' }}>
                    <Breadcrumb.Item>
                        <Link to={"/student"}>主页</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <Link to={"/studentlesson/"+parseInt(this.props.course_id)}>
                            {this.state.lesson_name}
                        </Link>
                    </Breadcrumb.Item>
                    {breadcrumb}
                </Breadcrumb>
                <Layout style={{ padding: '24px 0', background: '#fff' }}>
                    <Sider width={200} style={{ background: '#fff' }}>
                        <Menu
                            onClick={
                                (e)=>{
                                    const course_id = parseInt(this.props.course_id);
                                    this.setState({current_selected: e.key})
                                    this.setState({homeworkitems: []});
                                    this.update_pannel(course_id);
                                }
                            }
                            mode="inline"
                            defaultSelectedKeys={['1']}
                            defaultOpenKeys={['sub1']}
                            style={{ height: '100%' }}
                        >
              <SubMenu key="sub1" title={<span><Icon type="edit" theme="twoTone" />作业</span>}>
                                <Menu.Item key="1">未到截止日期作业</Menu.Item>
                                <Menu.Item key="2">已到截止日期作业</Menu.Item>
                                <Menu.Item key="3">全部</Menu.Item>
                            </SubMenu>
                            <Menu.Item key="5"><Icon type="notification" theme="twoTone" />通知</Menu.Item>
                            <Menu.Item key="6"><Icon type="info-circle" theme="twoTone" />课程信息</Menu.Item>
                        </Menu>
                    </Sider>
                    <Content style={{ padding: '0 24px', minHeight: 280 }}>
                        {panel}
                    </Content>
                </Layout>
            </Content>
        )
    }
}

const StudentLessonMiddle = withRouter(mStudentLessonMiddle);

export class StudentLesson extends Component {
    render() {
        return (
            <div>
                <StudentLessonMiddle course_id={this.props.lesson_id} id={this.props.id} state={this.props.state} />
            </div>
        )
    }
}