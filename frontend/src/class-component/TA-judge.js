import React, {Component} from 'react';
import {ajax_post} from "../ajax-utils/ajax-method";
import {api_list} from "../ajax-utils/api-manager";
import {Link} from 'react-router-dom';
import moment from 'moment';
import {message, Layout, Menu, Breadcrumb, Table, Button} from 'antd';
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

const columns = {
    '1': [
        {title: 'ID', dataIndex: 'user_id', key: 'user_id'},
        {title: '用户名', dataIndex: 'username', key: 'username'},
        {title: '真实姓名', dataIndex: 'realname', key: 'realname'},
        {title: '学号', dataIndex: 'student_id', key: 'student_id'},
        {title: '评测状态', dataIndex: 'judge_state', key: 'judge_state'},
        {title: '操作', dataIndex: 'action', key: 'action', render: (type, record) => {
            switch (type) {
                case 0: return <Button onClick={()=>{console.log("提交评测"+record.record_id)}}>提交评测</Button>;
                case 1: return <Button onClick={()=>{console.log("提交重新评测"+record.record_id);}}>重新评测</Button>;
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
                case 0: return <Button onClick={()=>{console.log("提交评测"+record.record_id)}}>提交评测</Button>;
                case 1: return <Button onClick={()=>{console.log("提交重新评测"+record.record_id);}}>重新评测</Button>;
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
                case 0: return <Button onClick={()=>{console.log("提交评测"+record.record_id)}}>提交评测</Button>;
                case 1: return <Button onClick={()=>{console.log("提交重新评测"+record.record_id);}}>重新评测</Button>;
                case 2: return <span>未提交</span>;
                default: return <span>准备数据出错</span>;
            }
        }}
    ]
};

class TAJudge extends Component {
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
            that.setState({homework_ddl: result.data[0].deadline});
        });
        ajax_post(api_list['query_problem'], {id: this.problem_id}, this, (that, result) => {
            if(result.data.length === 0){
                message.error("请求题目数据失败");
                return;
            }
            that.setState({problem_name: result.data[0].title, problem_type: result.data[0].judge_method});
        });
        ajax_post(api_list['query_course'], {id: this.course_id}, this, (that, result) => {
            if(result.data.length === 0) {
                message.error("请求课程数据失败");
                return;
            }
            that.setState({
                course_name: result.data[0].name,
                student_id: result.data[0].students,
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
        let dataSourse = [];
        let column = [];
        if (this.state.current_key === '1' ||
            this.state.current_key === '2' ||
            this.state.current_key === '3') {
            column = columns['1'];
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
            column = columns['2'];
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
            column = columns['3'];
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
            column = columns['4'];
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
                        submit_time: -1
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
        }
        dataSourse = dataSourse.sort((a, b) => {
            return a.user_id - b.user_id;
        });
        let panel = <Table dataSource={dataSourse} columns={column} pagination={false} />;
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
            default: breadcrumb = <></>; break;
        }
        return (
            <Content style={{ padding: '0 50px' }}>
                <Breadcrumb style={{ margin: '16px 0' }}>
                    <Breadcrumb.Item><Link to={"/ta"}>主页</Link></Breadcrumb.Item>
                    <Breadcrumb.Item><Link to={"/talesson/"+this.course_id.toString()}>{this.state.course_name}</Link></Breadcrumb.Item>
                    <Breadcrumb.Item>查看题目完成情况</Breadcrumb.Item>
                    <Breadcrumb.Item>{this.state.problem_name}</Breadcrumb.Item>
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
                                <Menu.Item key="1">全部</Menu.Item>
                                <Menu.Item key="2">已评测</Menu.Item>
                                <Menu.Item key="3">未评测</Menu.Item>
                            </SubMenu>
                            <SubMenu key="sub2" title={<span>迟交的同学</span>}>
                                <Menu.Item key="4">全部</Menu.Item>
                                <Menu.Item key="5">已评测</Menu.Item>
                                <Menu.Item key="6">未评测</Menu.Item>
                            </SubMenu>
                            <Menu.Item key="7">未提交的同学</Menu.Item>
                            <Menu.Item key="8">全部同学</Menu.Item>
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

export {TAJudge};