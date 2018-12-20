import React, {Component} from 'react';
import {ajax_post} from '../ajax-utils/ajax-method';
import {HTMLTable} from '@blueprintjs/core';
import { Menu, Icon, Layout, Breadcrumb, Table, Button, message, Modal } from 'antd';
import {api_list} from "../ajax-utils/api-manager";
const { Sider, Content } = Layout;

class AdminTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            page: 1,
            data: [],
            item_per_page: 10,
            pagination: {},
            loading: false,
            count: 0,
            visible: false,
            current_record: {}
        };
        this.data = [];
        this.updateTable = this.updateTable.bind(this);
    }
    updateTable = function(page) {
        console.log(this.state);
        // const column_len = this.props.columns.length;
        let need_update = true;
        for(const cl of this.props.columns) {
            if(cl.title === '操作' || cl.title === '查看详情'){
                need_update = false;
            }
            console.log(cl.title);
        }
        console.log(need_update);
        console.log(this.props.columns);
        if(need_update) {
            this.props.columns.push(
                {
                    title: '查看详情', dataIndex: 'info', key: 'info', render: (text, record) =>
                        <span>
                            <Button onClick={() => {
                                this.setState({current_record: record, visible: true});
                                console.log("点击查看详情");
                            }}>查看详情</Button>
                        </span>
                },
            );
            if(this.props.current !== 'Ratios' && this.props.current !== 'Judge States') {
                this.props.columns.push(
                    {
                        title: '操作', dataIndex: 'action', key: 'action', render: (text, record) =>
                            <span>
                        <Button onClick={() => {
                            ajax_post(this.props.delete_api, {id: record.id}, this, (that, result) => {
                                if (result.data.code === 1) {
                                    message.error("删除失败！");
                                } else {
                                    this.updateTable(this.state.page);
                                }
                            });
                        }}>删除</Button>
                    </span>
                    });
            }
        }
        ajax_post(this.props.api, {
            start: (page-1)*this.state.item_per_page + 1,
            end: page*this.state.item_per_page,
        }, this, (that, result)=>{
            that.data = [];
            if(result.data.code===1) {
                // alert("List failed.");
                message.error("查询数据失败！")
                return;
            }
            for(const d of result.data.list) {
                that.data.push(d);
            }
            const pagination = that.state.pagination;
            pagination.total = result.data.count;
            pagination.pageSize = that.state.item_per_page;
            that.setState({
                data: that.data,
                loading: false,
                count: result.data.count,
                pagination: pagination,
            })
        });
    };
    handleTableChange = (pagination) => {
        const pager = { ...this.state.pagination };
        pager.current = pagination.current;
        this.setState({
            pagination: pager,
        });
        this.fetch({
            page: pagination.current
        });
    };
    fetch = (params = {}) => {
        console.log('params:', params);
        this.setState({
            loading: true,
            page: params.page,
        });
        this.updateTable(params.page);
    };
    componentDidMount() {
        this.setState({
            loading: true,
        });
        this.updateTable(1);
    }
    componentDidUpdate(prevProps) {
        if(prevProps === this.props)
            return;
        this.setState({
            loading: true,
        });
        this.updateTable(1);
    }
    render() {
        let info_table = [];
        if(this.state.visible) {
            console.log(this.state.current_record);
            for(const re_name in this.state.current_record) {
                info_table.push(
                    <tr>
                        <td>{re_name}</td>
                        <td>{this.state.current_record[re_name] === null ?
                            'null' : this.state.current_record[re_name].toString()}</td>
                    </tr>
                )
            }
        }
        return (
            <>
            <Table columns={this.props.columns}
                   dataSource={this.state.data}
                   // scroll={{ x: this.props.scroll_x }}
                   pagination={this.state.pagination}
                   loading={this.state.loading}
                   onChange={this.handleTableChange}/>
            <Modal
                    title="查看详情"
                    visible={this.state.visible}
                    onOk={()=>{this.setState({visible: false})}}
                    onCancel={()=>{this.setState({visible: false})}}
                    >
                <HTMLTable bordered condensed>
                    <tbody>
                        {info_table}
                    </tbody>
                </HTMLTable>
            </Modal>
            </>
        );
    }
}

const scroll_x = {
    'Users': 1300,
    'Courses': 1150,
    'Homeworks': 600,
    'Problems': 1450,
    'Records': 1750,
    'Notices': 600,
};

const table_api = {
    'Users': api_list['list_user'],
    'Courses': api_list['list_course'],
    'Homework': api_list['list_homework'],
    'Problems': api_list['list_problem'],
    'Records': api_list['list_record'],
    'Notices': api_list['list_notice'],
    'Ratios': api_list['list_ratio'],
    'Judge States': api_list['list_judgestates'],
};

const table_delete_api = {
    'Users': api_list['delete_user'],
    'Courses': api_list['delete_course'],
    'Homework': api_list['delete_homework'],
    'Problems': api_list['delete_problem'],
    'Records': api_list['delete_record'],
    'Notices': api_list['delete_notice'],
};

function timeConverter(UNIX_timestamp){
    let a = new Date(UNIX_timestamp * 1000);
    let months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    let year = a.getFullYear();
    let month = months[a.getMonth()];
    let date = a.getDate();
    let hour = a.getHours();
    let min = a.getMinutes();
    let sec = a.getSeconds();
    return date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
}

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

const table_columns = {
    'Users': [
        {title: 'ID', dataIndex: 'id', key: 'id'},
        {title: '用户名', dataIndex: 'username', key: 'username'},
        {title: 'Email', dataIndex: 'email', key: 'email'},
        // {title: '真实姓名', dataIndex: 'realname', key: 'realname', width: 150},
        // {title: '学号', dataIndex: 'student_id', key: 'student_id', width: 150},
        // {title: '性别', dataIndex: 'gender', key: 'gender', width: 150, render: (num) => {
        //     switch(num) {
        //         case 0: return <span>男</span>;
        //         case 1: return <span>女</span>;
        //         case 2: return <span>未知</span>;
        //         default: return <span>读取数据错误</span>;
        //     }
        // }},
        // {title: '角色', dataIndex: 'role', key: 'role', width: 150, render: (num) => {
        //     switch(num) {
        //         case 1: return <span>学生</span>;
        //         case 2: return <span>助教</span>;
        //         case 3: return <span>管理员</span>;
        //         default: return <span>读取数据错误</span>;
        //     }
        // }},
        // {title: '学生课程', dataIndex: 'student_courses', key: 'student_courses', width: 150, render: (courses) => {
        //     if(courses === undefined) {
        //         courses = [];
        //     }
        //     return (<span>[{courses.map((c) => {return c + ','})}]</span>);
        // }},
        // {title: '助教课程', dataIndex: 'ta_courses', key: 'ta_courses', width: 150, render: (courses) => {
        //     if(courses === undefined) {
        //         courses = [];
        //     }
        //     return (<span>[{courses.map((c) => {return c + ','})}]</span>);
        // }}
    ],
    'Courses': [
        {title: 'ID', dataIndex: 'id', key: 'id'},
        {title: '课堂名称', dataIndex: 'name', key: 'name'},
        // {title: '课程描述', dataIndex: 'description', key: 'description', width: 150},
        {title: '状态', dataIndex: 'status', key: 'status', render: (num) => {
            switch(num) {
                case 0: return <span>未发布</span>;
                case 1: return <span>已发布</span>;
                default: return <span>读取数据错误</span>;
            }
        }},
        // {title: '助教', dataIndex: 'tas', key: 'tas', width: 150, render: (tas) => {
        //     if(tas===undefined) {
        //         tas = [];
        //     }
        //     return (<span>[{tas.map((c) => {return c + ','})}]</span>);
        // }},
        // {title: '学生', dataIndex: 'students', key: 'students', width: 150, render: (sts) => {
        //     if(sts === undefined) {
        //         sts = [];
        //     }
        //     return (<span>[{sts.map((c)=>{return c+','})}]</span>);
        // }},
        // {title: '作业', dataIndex: 'homeworks', key: 'homeworks', width: 150, render: (hws) => {
        //     if(hws === undefined) {
        //         hws = [];
        //     }
        //     return (<span>[{hws.map((c)=>{return c+','})}]</span>);
        // }},
        // {title: '通知', dataIndex: 'notices', key: 'notices', width: 150, render: (nts) => {
        //     if(nts === undefined) {
        //         nts = [];
        //     }
        //     return (<span>[{nts.map((c)=>{return c+','})}]</span>);
        // }},
    ],
    'Homework': [
        {title: 'ID', dataIndex: 'id', key: 'id'},
        {title: '作业名称', dataIndex: 'name', key: 'name'},
        // {title: '作业描述', dataIndex: 'description', key: 'description', width: 150},
        {title: '截止日期', dataIndex: 'deadline', key: 'deadline', render: (timestamp) => {
            if(timestamp === undefined) {
                return <span>读取数据错误</span>;
            }
            return <span>{timeConverter(timestamp)}</span>;
        }},
        // {title: '包含题目', dataIndex: 'problems', key: 'problems', width: 150, render: (pbs) => {
        //     if(pbs === undefined) {
        //         pbs = [];
        //     }
        //     return (<span>[{pbs.map((c)=>{return c+','})}]</span>);
        // }},
        // {title: '状态', dataIndex: 'status', key: 'status', width: 150, render: (status) => {
        //     switch(status) {
        //         case 0: return <span>未开始评测</span>;
        //         case 1: return <span>正在评测</span>;
        //         case 2: return <span>评测完成</span>;
        //         default: return <span>读取数据错误</span>;
        //     }
        // }},
    ],
    'Problems': [
        {title: 'ID', dataIndex: 'id', key: 'id'},
        {title: '标题', dataIndex: 'title', key: 'title'},
        {title: '创建者', dataIndex: 'user_id', key: 'user_id'},
        // {title: '题目描述', dataIndex: 'description', key: 'description', width: 150},
        // {title: '时间限制', dataIndex: 'time_limit', key: 'time_limit', width: 150, render: (time) => {
        //     if(time === undefined) {
        //         return <span>读取数据错误</span>;
        //     }
        //     return <span>{time + 'ms'}</span>;
        // }},
        // {title: '内存限制', dataIndex: 'memory_limit', key: 'memory_limit', width: 150, render: (memory) => {
        //     if(memory === undefined) {
        //         return <span>读取数据错误</span>;
        //     }
        //     return <span>{memory + 'kb'}</span>;
        // }},
        // {title: '评测方式', dataIndex: 'judge_method', key: 'judge_method', width: 150, render: (method) => {
        //     switch(method) {
        //         case 0: return <span>传统评测</span>;
        //         case 1: return <span>脚本评测</span>;
        //         case 2: return <span>HTML手工评测</span>;
        //         default: return <span>读取数据错误</span>;
        //     }
        // }},
        // {title: '允许使用的语言', dataIndex: 'language', key: 'language', width: 150, render: (language) => {
        //     if(language === undefined) {
        //         language = [];
        //     }
        //     return <span>[{language.map((lang)=>{
        //         switch(lang) {
        //             case 1: return 'C,';
        //             case 2: return 'C++,';
        //             case 3: return 'Javascript';
        //             case 4: return 'Python3';
        //             default: return '未知语言';
        //         }
        //     })}]</span>;
        // }},
        // {title: '开放性', dataIndex: 'openness', key: 'openness', width: 150, render: (openness) => {
        //     switch(openness) {
        //         case 0: return <span>私密</span>;
        //         case 1: return <span>公开</span>;
        //         default: return <span>读取数据错误</span>;
        //     }
        // }},
        // {title: '状态', dataIndex: 'status', key: 'status', width: 150, render: (status) => {
        //     switch(status) {
        //         case 0: return <span>标准程序未通过测试</span>;
        //         case 1: return <span>标准程序通过测试</span>;
        //         default: return <span>读取数据错误</span>;
        //     }
        // }},
    ],
    'Records': [
        {title: 'ID', dataIndex: 'id', key: 'id'},
        {title: '提交用户', dataIndex: 'user_id', key: 'user_id'},
        {title: '提交时间', dataIndex: 'submit_time', key: 'submit_time', render: (time) => {
            if(time === undefined || time === null) {
                return <span>读取数据错误</span>;
            }
            return <span>{timeConverter(time)}</span>;
        }},
        // {title: '题目', dataIndex: 'problem_id', key: 'problem_id', width: 100},
        // {title: '所属作业', dataIndex: 'homework_id', key: 'homework_id', width: 100},
        // {title: '提交语言', dataIndex: 'src_language', key: 'src_language', width: 100, render: (language) => {
        //     switch(language) {
        //         case 1: return <span>C</span>;
        //         case 2: return <span>C++</span>;
        //         case 3: return <span>Javascript</span>;
        //         case 4: return <span>Python3</span>;
        //         default: return <span>未知语言</span>;
        //     }
        // }},
        // {title: '记录类型', dataIndex: 'record_type', key: 'record_type', width: 150, render: (type) => {
        //     switch(type) {
        //         case 0: return <span>公共图库提交</span>;
        //         case 1: return <span>课程作业测试</span>;
        //         case 2: return <span>课程作业提交</span>;
        //         default: return <span>读取数据错误</span>;
        //     }
        // }},
        // {title: '测试比例', dataIndex: 'test_ratio', key: 'test_ratio', width: 100, render: (ratio) => {
        //     if(ratio === undefined || ratio === null) {
        //         return <span>无数据</span>;
        //     }
        //     return <span>{ratio + '%'}</span>;
        // }},
        // {title: '记录状态', dataIndex: 'status', key: 'status', width: 150, render: (status) => {
        //     switch(status) {
        //         case 0: return <span>未完成评测</span>;
        //         case 1: return <span>已完成评测</span>;
        //         default: return <span>读取数据错误</span>;
        //     }
        // }},
        // {title: '传统评测结果', dataIndex: 'result', key: 'result', width: 100, render: (result) => {
        //     if(isNaN(result) || result === undefined || result === null) {
        //         return <span>无数据</span>;
        //     }
        //     return <span>{result_arr[result]}</span>;
        // }},
        // {title: '脚本评测结果', dataIndex: 'score', key: 'score', width: 100, render: (score) => {
        //     if(isNaN(score) || score === undefined || score === null) {
        //         return <span>无数据</span>;
        //     }
        //     return <span>{score+'分'}</span>;
        // }},
        // {title: '结果类型', dataIndex: 'result_type', key: 'result_type', width: 150, render: (type) => {
        //     switch(type) {
        //         case 0: return <span>编译型结果</span>;
        //         case 1: return <span>脚本测试结果</span>;
        //         default: return <span>读取数据错误</span>;
        //     }
        // }},
        // {title: '消耗时间', dataIndex: 'consume_time', key: 'consume_time', width: 100, render: (time) => {
        //     if(time === undefined || time === null) {
        //         return <span>无数据</span>;
        //     }
        //     return <span>{time + 'ms'}</span>;
        // }},
        // {title: '消耗内存', dataIndex: 'consume_memory', key: 'consume_memory', width: 100, render: (memory) => {
        //     if(memory === undefined || memory === null) {
        //         return <span>无数据</span>;
        //     }
        //     return <span>{memory + 'kb'}</span>;
        // }},
        // {title: '源码大小', dataIndex: 'src_size', key: 'src_size', width: 100, render: (size) => {
        //     if(size === undefined || size === null) {
        //         return <span>无数据</span>;
        //     }
        //     return <span>{size + 'B'}</span>;
        // }},
    ],
    'Notices': [
        {title: 'ID', dataIndex: 'id', key: 'id'},
        {title: '标题', dataIndex: 'title', key: 'title'},
        // {title: '正文', dataIndex: 'content', key: 'content', width: 250},
        {title: '创建用户', dataIndex: 'user_id', key: 'user_id'},
        // {title: '相关课程', dataIndex: 'course_id', key: 'course_id', width: 150},
    ],
    'Ratios': [
        {title: 'ID', dataIndex: 'id', key: 'id'},
        {title: '相关作业', dataIndex: 'homework_id', key: 'homework_id'},
        {title: '相关题目', dataIndex: 'problem_id', key: 'problem_id'}
    ],
    'Judge States': [
        {title: 'ID', dataIndex: 'id', key: 'id'},
        {title: '相关作业', dataIndex: 'homework_id', key: 'homework_id'},
        {title: '相关题目', dataIndex: 'problem_id', key: 'problem_id'}
    ]
};

class AdminPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            current: 'Users'
        };
        this.tables = ['Users', 'Courses', 'Homework', 'Problems', 'Records', 'Notices', 'Ratios', 'Judge States'];
    }
    handleClick = (e) => {
        this.setState({
            current: e.key,
        });
    };
    render() {
        return (
            <div>
                <Content style={{ padding: '0 50px' }}>
                    <Breadcrumb style={{ margin: '16px 0' }}>
                        <Breadcrumb.Item>{this.state.current}</Breadcrumb.Item>
                    </Breadcrumb>
                    <Layout style={{ padding: '24px 0', background: '#fff' }}>
                        <Sider style={{ background: '#fff', width: '100%' }}>
                            <Menu
                                onClick={this.handleClick}
                                style={{ width: '100%', height: '100%' }}
                                defaultSelectedKeys={['Users']}
                                mode="inline"
                            >
                                {this.tables.map((name)=><Menu.Item key={name}><Icon type="table" />{name}</Menu.Item>)}
                            </Menu>
                        </Sider>
                        <Content style={{ padding: '0 24px', minHeight: 280 }}>
                            <AdminTable columns={table_columns[this.state.current]}
                                        api={table_api[this.state.current]}
                                        delete_api={table_delete_api[this.state.current]}
                                        scroll_x={scroll_x[this.state.current]}
                                        current_tab={this.state.current}
                                        current={this.state.current}/>
                        </Content>
                    </Layout>
                </Content>
            </div>
        )
    }
}

export {AdminPage}