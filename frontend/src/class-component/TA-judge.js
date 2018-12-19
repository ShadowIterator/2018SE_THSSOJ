import React, {Component} from 'react';
import {ajax_post} from "../ajax-utils/ajax-method";
import {api_list} from "../ajax-utils/api-manager";
import {Link, withRouter} from 'react-router-dom';
import moment from 'moment';
import {message, Layout, Menu, Breadcrumb, Table, Button, Badge, Form} from 'antd';
const { SubMenu } = Menu;
const { Content, Sider } = Layout;

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

class mTAJudge extends Component {
    columns = {
        '1': [
            {title: 'ID', dataIndex: 'user_id', key: 'user_id'},
            {title: '用户名', dataIndex: 'username', key: 'username'},
            {title: '真实姓名', dataIndex: 'realname', key: 'realname'},
            {title: '学号', dataIndex: 'student_id', key: 'student_id'},
            {title: '评测状态', dataIndex: 'judge_state', key: 'judge_state'},
            {title: '操作', dataIndex: 'action', key: 'action', render: (type, record) => {
                    switch (type) {
                        case 0: return <Button onClick={()=>{
                            console.log("提交评测"+record.record_id);
                            if(this.state.problem_type === 2) {
                                this.props.history.push({
                                    pathname: "/judgehtml/"+
                                        this.course_id.toString()+"/"+
                                        this.homework_id.toString()+"/"+
                                        this.problem_id.toString()+"/",
                                    state: { user_id: record.user_id.toString() }
                                });
                            } else {
                                ajax_post(api_list['judge_one'], {
                                    course_id: this.course_id,
                                    problem_id: this.problem_id,
                                    record_id: record.record_id,
                                }, this, (that, result) => {
                                    if(result.data.code === 1) {
                                        message.error("提交评测失败");
                                    } else {
                                        message.success("开始评测");
                                    }
                                })
                            }
                        }}>提交评测</Button>;
                        case 1: return <Button onClick={()=>{
                            console.log("提交重新评测"+record.record_id);
                            if(this.state.problem_type === 2) {
                                this.props.history.push({
                                    pathname: "/judgehtml/"+
                                        this.course_id.toString()+"/"+
                                        this.homework_id.toString()+"/"+
                                        this.problem_id.toString()+"/",
                                    state: { user_id: record.user_id.toString() }
                                });
                            } else {
                                ajax_post(api_list['judge_one'], {
                                    course_id: this.course_id,
                                    problem_id: this.problem_id,
                                    record_id: record.record_id,
                                }, this, (that, result) => {
                                    if(result.data.code === 1) {
                                        message.error("提交评测失败");
                                    } else {
                                        message.success("开始评测");
                                    }
                                })
                            }
                        }}>重新评测</Button>;
                        default: return <span>准备数据出错</span>;
                    }
                }}
        ],
        '2': [
            {title: 'ID', dataIndex: 'user_id', key: 'user_id'},
            {title: '用户名', dataIndex: 'username', key: 'username'},
            {title: '真实姓名', dataIndex: 'realname', key: 'realname'},
            {title: '学号', dataIndex: 'student_id', key: 'student_id'},
            {title: '迟交时间', dataIndex: 'second', key: 'second', render: (second) => {
                    return <span>{second+'秒'}</span>
                }},
            {title: '评测状态', dataIndex: 'judge_state', key: 'judge_state'},
            {title: '操作', dataIndex: 'action', key: 'action', render: (type, record) => {
                    switch (type) {
                        case 0: return <Button onClick={()=>{
                            console.log("提交评测"+record.record_id);
                            if(this.state.problem_type === 2) {
                                this.props.history.push({
                                    pathname: "/judgehtml/"+
                                        this.course_id.toString()+"/"+
                                        this.homework_id.toString()+"/"+
                                        this.problem_id.toString()+"/",
                                    state: { user_id: record.user_id.toString() }
                                });
                            } else {
                                ajax_post(api_list['judge_one'], {
                                    course_id: this.course_id,
                                    problem_id: this.problem_id,
                                    record_id: record.record_id,
                                }, this, (that, result) => {
                                    if(result.data.code === 1) {
                                        message.error("提交评测失败");
                                    } else {
                                        message.success("开始评测");
                                    }
                                })
                            }
                        }}>提交评测</Button>;
                        case 1: return <Button onClick={()=>{
                            console.log("提交重新评测"+record.record_id);
                            if(this.state.problem_type === 2) {
                                this.props.history.push({
                                    pathname: "/judgehtml/"+
                                        this.course_id.toString()+"/"+
                                        this.homework_id.toString()+"/"+
                                        this.problem_id.toString()+"/",
                                    state: { user_id: record.user_id.toString() }
                                });
                            } else {
                                ajax_post(api_list['judge_one'], {
                                    course_id: this.course_id,
                                    problem_id: this.problem_id,
                                    record_id: record.record_id,
                                }, this, (that, result) => {
                                    if(result.data.code === 1) {
                                        message.error("提交评测失败");
                                    } else {
                                        message.success("开始评测");
                                    }
                                })
                            }
                        }}>重新评测</Button>;
                        default: return <span>准备数据出错</span>;
                    }
                }}
        ],
        '3': [
            {title: 'ID', dataIndex: 'user_id', key: 'user_id'},
            {title: '用户名', dataIndex: 'username', key: 'username'},
            {title: '真实姓名', dataIndex: 'realname', key: 'realname'},
            {title: '学号', dataIndex: 'student_id', key: 'student_id'},
        ],
        '4': [
            {title: 'ID', dataIndex: 'user_id', key: 'user_id'},
            {title: '用户名', dataIndex: 'username', key: 'username'},
            {title: '真实姓名', dataIndex: 'realname', key: 'realname'},
            {title: '学号', dataIndex: 'student_id', key: 'student_id'},
            {title: '提交时间', dataIndex: 'submit_time', key: 'submit_time', render: (time) => {
                    if(time === -1) {
                        return <span>未提交</span>;
                    }
                    return <span>{moment.unix(time).format("YYYY年MM月DD日HH时")}</span>
                }},
            {title: '评测状态', dataIndex: 'judge_state', key: 'judge_state'},
            {title: '操作', dataIndex: 'action', key: 'action', render: (type, record) => {
                    switch (type) {
                        case 0: return <Button onClick={()=>{
                            console.log("提交评测"+record.record_id)
                            if(this.state.problem_type === 2) {
                                this.props.history.push({
                                    pathname: "/judgehtml/"+
                                        this.course_id.toString()+"/"+
                                        this.homework_id.toString()+"/"+
                                        this.problem_id.toString()+"/",
                                    state: { user_id: record.user_id.toString() }
                                });
                            } else {
                                ajax_post(api_list['judge_one'], {
                                    course_id: this.course_id,
                                    problem_id: this.problem_id,
                                    record_id: record.record_id,
                                }, this, (that, result) => {
                                    if(result.data.code === 1) {
                                        message.error("提交评测失败");
                                    } else {
                                        message.success("开始评测");
                                    }
                                })
                            }
                        }}>提交评测</Button>;
                        case 1: return <Button onClick={()=>{
                            console.log("提交重新评测"+record.record_id);
                            if(this.state.problem_type === 2) {
                                this.props.history.push({
                                    pathname: "/judgehtml/"+
                                        this.course_id.toString()+"/"+
                                        this.homework_id.toString()+"/"+
                                        this.problem_id.toString()+"/",
                                    state: { user_id: record.user_id.toString() }
                                });
                            } else {
                                ajax_post(api_list['judge_one'], {
                                    course_id: this.course_id,
                                    problem_id: this.problem_id,
                                    record_id: record.record_id,
                                }, this, (that, result) => {
                                    if(result.data.code === 1) {
                                        message.error("提交评测失败");
                                    } else {
                                        message.success("开始评测");
                                    }
                                })
                            }
                        }}>重新评测</Button>;
                        case 2: return <span>未提交</span>;
                        default: return <span>准备数据出错</span>;
                    }
                }},
        ]
    };
    constructor(props) {
        super(props);
        this.state = {
            course_name: '',
            problem_name: '',
            problem_type: -1,
            homework_ddl: -1,
            student_id: [],
            records: {},
            student_info: {},
            current_key: '1',
            judge_state: null,
            course_info: {},
            homework_info: {},
            problem_info: {},
        };
        this.course_id = parseInt(this.props.course_id);
        this.homework_id = parseInt(this.props.homework_id);
        this.problem_id = parseInt(this.props.problem_id);
    }
    componentDidMount() {
        if(this.props.id === -1) {
            return;
        }
        this.fetchData();
    }
    componentWillUpdate(nextProps) {
        if(nextProps.id === -1) {
            return;
        } else if(nextProps.id === this.props.id) {
            return;
        }
        this.fetchData();
    }
    fetchData = () => {
        ajax_post(api_list['query_judgestates'], {
            problem_id: this.problem_id,
            homework_id: this.homework_id,
        }, this, (that, result) => {
            if(result.data.length !== 0) {
                that.setState({judge_state: result.data[0]});
            }
        });
        ajax_post(api_list['query_homework'], {id: this.homework_id}, this, (that, result) => {
            if(result.data.length === 0) {
                message.error("请求作业数据失败");
                return;
            }
            that.setState({homework_ddl: result.data[0].deadline,
                homework_info: result.data[0]});
        });
        ajax_post(api_list['query_problem'], {id: this.problem_id}, this, (that, result) => {
            if(result.data.length === 0){
                message.error("请求题目数据失败");
                return;
            }
            that.setState({problem_name: result.data[0].title,
                problem_type: result.data[0].judge_method,
                problem_info: result.data[0]});
        });
        ajax_post(api_list['query_course'], {id: this.course_id}, this, (that, result) => {
            if(result.data.length === 0) {
                message.error("请求课程数据失败");
                return;
            }
            that.setState({
                course_name: result.data[0].name,
                student_id: result.data[0].students,
                course_info: result.data[0],
            });
            for(const id of result.data[0].students) {
                ajax_post(api_list['query_user'], {id: id}, this, (that, result) => {
                    if(result.data.length === 0) {
                        message.error("请求用户"+id.toString()+"数据失败");
                        return;
                    }
                    let student_info = that.state.student_info;
                    student_info[id.toString()] = result.data[0];
                    that.setState({student_info: student_info});
                });
            }
        });
        ajax_post(api_list['query_record'], {
            course_id: this.course_id,
            homework_id: this.homework_id,
            problem_id: this.problem_id,
        }, this, (that, result) => {
            if(result.data.length === 0) {
                message.warning("暂无提交数据");
                return;
            }
            let records = {};
            for(const re of result.data) {
                records[re.user_id.toString()] = re;
            }
            that.setState({records: records});
        });
    };
    render() {
        let panel;
        let records_arr = [];
        let stu_arr = [];
        for(const re_id in this.state.records) {
            records_arr.push(this.state.records[re_id]);
        }
        for(const stu_id in this.state.student_info) {
            stu_arr.push(this.state.student_info[stu_id]);
        }
        const countIntimeAll = records_arr.filter((item) => {
            return (item.submit_time <= this.state.homework_ddl);
        }).length;
        const countIntimeJudged = records_arr.filter((item) => {
            return (item.submit_time <= this.state.homework_ddl) && (item.status > 0);
        }).length;
        const countIntimeUnjudged = countIntimeAll - countIntimeJudged;
        const countDelayAll = records_arr.filter((item) => {
            return (item.submit_time > this.state.homework_ddl);
        }).length;
        const countDelayJudged = records_arr.filter((item) => {
            return (item.submit_time > this.state.homework_ddl) && (item.status > 0);
        }).length;
        const countDelayUnjudged = countDelayAll - countDelayJudged;
        const countAllStudent = stu_arr.length;
        const countNotSubmitted = countAllStudent - records_arr.length;
        let dataSourse = [];
        let column = [];
        if (this.state.current_key === '1' ||
            this.state.current_key === '2' ||
            this.state.current_key === '3') {
            column = this.columns['1'];
            for (const re_id in this.state.records) {
                const re = this.state.records[re_id];
                if (re.submit_time <= this.state.homework_ddl) {
                    let stu = this.state.student_info[re.user_id.toString()];
                    stu = stu === undefined ? {} : stu;
                    dataSourse.push({
                        record_id: re.id,
                        user_id: re.user_id,
                        username: stu.username,
                        realname: stu.realname,
                        student_id: stu.student_id,
                        judge_state: re.status === 0 ? '未评测' :
                            (re.result_type === 0 ? result_arr[re.result] : re.score.toString() + '分'),
                        action: re.status === 0 ? 0 : 1,
                    })
                }
            }
            if (this.state.current_key === '2') {
                dataSourse = dataSourse.filter((item) => {
                    return item.judge_state !== '未评测';
                });
            } else if (this.state.current_key === '3') {
                dataSourse = dataSourse.filter((item) => {
                    return item.judge_state === '未评测';
                });
            }
        } else if (this.state.current_key === '4' ||
                   this.state.current_key === '5' ||
                   this.state.current_key === '6') {
            column = this.columns['2'];
            for (const re_id in this.state.records) {
                const re = this.state.records[re_id];
                if (re.submit_time > this.state.homework_ddl) {
                    let stu = this.state.student_info[re.user_id.toString()];
                    stu = stu === undefined ? {} : stu;
                    dataSourse.push({
                        record_id: re.id,
                        user_id: re.user_id,
                        username: stu.username,
                        realname: stu.realname,
                        student_id: stu.student_id,
                        judge_state: re.status === 0 ? '未评测' :
                            (re.result_type === 0 ? result_arr[re.result] : re.score.toString() + '分'),
                        action: re.status === 0 ? 0 : 1,
                        second: re.submit_time - this.state.homework_ddl,
                    })
                }
            }
            if (this.state.current_key === '5') {
                dataSourse = dataSourse.filter((item) => {
                    return item.judge_state !== '未评测';
                });
            } else if (this.state.current_key === '6') {
                dataSourse = dataSourse.filter((item) => {
                    return item.judge_state === '未评测';
                });
            }
        } else if (this.state.current_key === '7') {
            column = this.columns['3'];
            for (const id of this.state.student_id) {
                if (this.state.records[id.toString()] === undefined) {
                    let stu = this.state.student_info[id.toString()];
                    stu = stu === undefined ? {} : stu;
                    dataSourse.push({
                        user_id: id,
                        username: stu.username,
                        realname: stu.realname,
                        student_id: stu.student_id,
                    })
                }
            }
        } else if (this.state.current_key === '8') {
            column = this.columns['4'];
            for (const id of this.state.student_id) {
                let stu = this.state.student_info[id.toString()];
                stu = stu === undefined ? {} : stu;
                if(this.state.records[id.toString()] === undefined) {
                    dataSourse.push({
                        record_id: -1,
                        user_id: id,
                        username: stu.username,
                        realname: stu.realname,
                        student_id: stu.student_id,
                        judge_state: '未提交',
                        action: 2,
                        submit_time: -1,
                    })
                } else {
                    const re = this.state.records[id.toString()];
                    dataSourse.push({
                        record_id: re.id,
                        user_id: re.user_id,
                        username: stu.username,
                        realname: stu.realname,
                        student_id: stu.student_id,
                        judge_state: re.status === 0 ? '未评测' :
                            (re.result_type === 0 ? result_arr[re.result] : re.score.toString() + '分'),
                        action: re.status === 0 ? 0 : 1,
                        submit_time: re.submit_time,
                    })
                }
            }
        } else if (this.state.current_key === '9') {
            const formItemLayout = {
                labelCol: {
                    xs: { span: 12 },
                    sm: { span: 12 },
                    md: { span: 12 },
                },
                wrapperCol: {
                    xs: { span: 12 },
                    sm: { span: 12 },
                    md: { span: 12 },
                },
            };
            panel = (
                <Form>
                    <Form.Item {...formItemLayout} label={"已评测/总提交数"}>
                        {(countIntimeJudged + countDelayJudged).toString() + '/' + (countIntimeAll + countDelayAll).toString() }
                    </Form.Item>
                    <Form.Item {...formItemLayout} label={"评测状态"}>
                        <Button onClick={() => {
                            ajax_post(api_list['judge_all'], {
                                homework_id: this.homework_id,
                                problem_id: this.problem_id,
                                course_id: this.course_id,
                            }, this, (that, result) => {
                                if(result.data.code === 1) {
                                    message.error("评测请求失败");
                                } else {
                                    message.success("开始评测");
                                }
                            });
                        }} disabled={this.state.judge_state.total_waiting > 0
                        && this.state.judge_state.total_waiting > this.state.judge_state.judged}>
                            {this.state.judge_state.total_waiting<=0 ?
                            "开始评测" :
                            (this.state.judge_state.total_waiting > this.state.judge_state.judged ? "正在评测" : "重新评测")}
                        </Button>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label={"下载成绩单"}>
                        <Button onClick={()=>{message.success("开始下载成绩单")}}>下载</Button>
                    </Form.Item>
                </Form>
            );
        }
        dataSourse = dataSourse.sort((a, b) => {
            return a.user_id - b.user_id;
        });
        if(this.state.current_key !== '9') {
            panel = <Table dataSource={dataSourse} columns={column} pagination={false} />;
        }
        let breadcrumb;
        switch (this.state.current_key) {
            case '1': breadcrumb = (<>
                <Breadcrumb.Item>按时提交的同学</Breadcrumb.Item>
                <Breadcrumb.Item>全部</Breadcrumb.Item>
            </>); break;
            case '2': breadcrumb = (<>
                <Breadcrumb.Item>按时提交的同学</Breadcrumb.Item>
                <Breadcrumb.Item>已评测</Breadcrumb.Item>
            </>); break;
            case '3': breadcrumb = (<>
                <Breadcrumb.Item>按时提交的同学</Breadcrumb.Item>
                <Breadcrumb.Item>未评测</Breadcrumb.Item>
            </>); break;
            case '4': breadcrumb = (<>
                <Breadcrumb.Item>迟交的同学</Breadcrumb.Item>
                <Breadcrumb.Item>全部</Breadcrumb.Item>
            </>); break;
            case '5': breadcrumb = (<>
                <Breadcrumb.Item>迟交的同学</Breadcrumb.Item>
                <Breadcrumb.Item>已评测</Breadcrumb.Item>
            </>); break;
            case '6': breadcrumb = (<>
                <Breadcrumb.Item>迟交的同学</Breadcrumb.Item>
                <Breadcrumb.Item>未评测</Breadcrumb.Item>
            </>); break;
            case '7': breadcrumb = (<>
                <Breadcrumb.Item>未提交的同学</Breadcrumb.Item>
            </>); break;
            case '8': breadcrumb = (<>
                <Breadcrumb.Item>全部同学</Breadcrumb.Item>
            </>); break;
            case '9': breadcrumb = (<>
                <Breadcrumb.Item>统计信息</Breadcrumb.Item>
            </>); break;
            default: breadcrumb = <></>; break;
        }
        return (
            <Content style={{ padding: '0 50px' }}>
                <Breadcrumb style={{ margin: '16px 0' }}>
                    <Breadcrumb.Item><Link to={"/ta"}>主页</Link></Breadcrumb.Item>
                    <Breadcrumb.Item><Link to={"/talesson/"+this.course_id.toString()}>{this.state.course_name}</Link></Breadcrumb.Item>
                    <Breadcrumb.Item>{this.state.homework_info.name}</Breadcrumb.Item>
                    <Breadcrumb.Item>{this.state.problem_info.title}</Breadcrumb.Item>
                    {breadcrumb}
                </Breadcrumb>
                <Layout style={{ padding: '24px 0', background: '#fff' }}>
                    <Sider width={200} style={{ background: '#fff' }}>
                        <Menu
                            mode="inline"
                            defaultSelectedKeys={['1']}
                            defaultOpenKeys={['sub1']}
                            style={{ height: '100%' }}
                            onClick={(e)=>{this.setState({current_key: e.key})}}
                        >
                            <SubMenu key="sub1" title={<span>按时提交的同学</span>}>
                                <Menu.Item key="1">
                                    全部<Badge count={countIntimeAll} style={{ marginLeft: 5, backgroundColor: '#fff', color: '#999', boxShadow: '0 0 0 1px #d9d9d9 inset' }} />
                                </Menu.Item>
                                <Menu.Item key="2">
                                    已评测<Badge count={countIntimeJudged} style={{ marginLeft: 5, backgroundColor: '#fff', color: '#999', boxShadow: '0 0 0 1px #d9d9d9 inset' }} />
                                </Menu.Item>
                                <Menu.Item key="3">
                                    未评测<Badge count={countIntimeUnjudged} style={{ marginLeft: 5, backgroundColor: '#fff', color: '#999', boxShadow: '0 0 0 1px #d9d9d9 inset' }} />
                                </Menu.Item>
                            </SubMenu>
                            <SubMenu key="sub2" title={<span>迟交的同学</span>}>
                                <Menu.Item key="4">
                                    全部<Badge count={countDelayAll} style={{ marginLeft: 5, backgroundColor: '#fff', color: '#999', boxShadow: '0 0 0 1px #d9d9d9 inset' }} />
                                </Menu.Item>
                                <Menu.Item key="5">
                                    已评测<Badge count={countDelayJudged} style={{ marginLeft: 5, backgroundColor: '#fff', color: '#999', boxShadow: '0 0 0 1px #d9d9d9 inset' }} />
                                </Menu.Item>
                                <Menu.Item key="6">
                                    未评测<Badge count={countDelayUnjudged} style={{ marginLeft: 5, backgroundColor: '#fff', color: '#999', boxShadow: '0 0 0 1px #d9d9d9 inset' }} />
                                </Menu.Item>
                            </SubMenu>
                            <Menu.Item key="7">
                                未提交的同学<Badge count={countNotSubmitted} style={{ marginLeft: 5, backgroundColor: '#fff', color: '#999', boxShadow: '0 0 0 1px #d9d9d9 inset' }} />
                            </Menu.Item>
                            <Menu.Item key="8">
                                全部同学<Badge count={countAllStudent} style={{ marginLeft: 5, backgroundColor: '#fff', color: '#999', boxShadow: '0 0 0 1px #d9d9d9 inset' }} />
                            </Menu.Item>
                            <Menu.Item key="9">
                                统计信息
                            </Menu.Item>
                        </Menu>
                    </Sider>
                    <Content style={{ padding: '0 24px', minHeight: 280 }}>
                        {panel}
                    </Content>
                </Layout>
            </Content>
        );
    }
}

const TAJudge = withRouter(mTAJudge);

export {TAJudge};