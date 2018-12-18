import React, {Component} from "react";

import {api_list} from "../ajax-utils/api-manager";
import {ajax_post} from "../ajax-utils/ajax-method";

import {Link} from 'react-router-dom';

import {Layout, Breadcrumb, Table, Button, Popconfirm, message} from 'antd';
const {Content} = Layout;

class MyProblem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
        }
    }
    request_data = (id) => {
        ajax_post(api_list['query_problem'], {user_id: id}, this, (that, result) => {
            if(result.data.code === 1) {
                return;
            }
            let data = [];
            for(const prob of result.data) {
                data.push({
                    id: prob.id,
                    title: prob.title,
                    status: prob.status,
                })
            }
            that.setState({
                data: data,
            })
        });
    };
    componentDidMount() {
        if(this.props.id === -1) {
            return;
        }
        this.request_data(this.props.id);
    }
    componentWillUpdate(nextProps) {
        if(nextProps.id===undefined || nextProps.id === -1)
            return;
        if(nextProps.id !== this.props.id) {
            this.request_data(nextProps.id);
        }
    }
    columns = [
        {title: 'ID', dataIndex: 'id', key: 'id'},
        {title: '标题', dataIndex: 'title', key: 'title'},
        {title: '状态', dataIndex: 'status', key: 'status', render: (status) => {
                switch (status) {
                    case 0:
                        return <span>未通过标准程序测试</span>;
                    case 1:
                        return <span>已通过标准程序测试</span>;
                    default:
                        return <span>获取数据失败</span>;
                }
            }
        },
        {title: '操作', dataIndex: 'action', key: 'action', render: (text, prob) =>
                <span>
                    <Button style={{outline: 0, marginRight: 5}}><Link to={"/problemedit/"+prob.id}>编辑</Link></Button>
                    <Popconfirm title={"你确定要删除题目 "+prob.title+" 吗？"} onConfirm={()=> {
                        ajax_post(api_list['delete_problem'], {id: prob.id}, this, (that, result) => {
                            if(result.data.code === 1) {
                                // alert("删除题目失败");
                                message.error("删除题目失败");
                            } else {
                                // alert("删除成功");
                                message.success("删除成功");
                                that.request_data(that.props.id);
                            }
                        })
                    }} okText="确定" cancelText="取消">
                    <Button style={{outline: 0}}>删除</Button>
                    </Popconfirm>
                </span>
        }
    ];
    render() {
        return (
            <Content style={{ padding: '0 50px' }}>
                <Breadcrumb style={{ margin: '16px 0' }}>
                    <Breadcrumb.Item><Link to="/ta">主页</Link></Breadcrumb.Item>
                    <Breadcrumb.Item>我的题目</Breadcrumb.Item>
                </Breadcrumb>
                <div style={{ background: '#fff', padding: 24, minHeight: 280 }}>
                    <Table columns={this.columns} dataSource={this.state.data} />
                </div>
            </Content>
        );
    }
}

export {MyProblem};
