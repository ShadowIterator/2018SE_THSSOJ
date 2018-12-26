import React, { Component } from 'react';

import {ajax_post} from "../ajax-utils/ajax-method";
import {api_list} from "../ajax-utils/api-manager";
import {Link} from "react-router-dom";

import { Layout, Breadcrumb, Radio, Card, Table, message, Input} from 'antd';
const {Content, Sider} = Layout;

const problemColumns = [
    {title: 'ID', dataIndex: 'id', key: 'id'},
    {title: '标题', dataIndex: 'title', key: 'title', render: (title, record) =>
            <Link to={'/problemdetail/'+record.id.toString()+'/0/0'}>{title}</Link>
    },
];

class ProblemBase extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // languages: [],
            value: 1,
            page: 1,
            data: [],
            item_per_page: 10,
            pagination: {},
            loading: false,
            count: 0,
        }
    }
    componentDidMount() {
        this.updateProblems(1, 1);
    }

    updateProblems = (page, value) => {
        this.setState({
            loading: true,
        });
        let post_data = {
            start: (page-1)*this.state.item_per_page + 1,
            end: page*this.state.item_per_page,
            // judge_method: 1
            openness: 1
        };
        if(value > 1) {
            post_data['judge_method'] = value - 2;
        }
        ajax_post(api_list['list_problem'], post_data, this, (that, result)=>{
            that.data = [];
            if(result.data.code===1) {
                // alert("List failed.");
                message.error("获取数据失败");
                return;
            }
            for(const d of result.data.list) {
                let new_record = {};
                for(const c of problemColumns) {
                    new_record[c['dataIndex']] = d[c['dataIndex']];
                }
                that.data.push(new_record);
            }
            const pagination = that.state.pagination;
            pagination.total = result.data.count;
            pagination.pageSize = that.state.item_per_page;
            that.setState({
                data: that.data.sort((a,b)=>{return a.id-b.id}),
                loading: false,
                count: result.data.count,
                pagination: pagination,
            })
        });
    };
    handleTableChange = (pagination) => {
        console.log("handleTableChange", pagination);
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
        this.updateProblems(params.page, this.state.value);
    };
    render() {
        const radioStyle = {
            display: 'block',
            height: '30px',
            lineHeight: '30px',
        };
        return(
            <Content style={{ padding: '0 50px' }}>
                <Breadcrumb style={{ margin: '16px 0' }}>
                    <Breadcrumb.Item>公共题库</Breadcrumb.Item>
                </Breadcrumb>
                <Layout style={{ padding: '24px 0', background: '#fff' }}>
                    <Sider width={200} style={{ background: '#fff' }}>
                        <Card title="选择题目类型" style={{width: "100%", padding: "5px", marginLeft: "5px"}}>
                            <Radio.Group onChange={
                                (e)=>{
                                    if(e.target.value !== 4) {
                                        let pager = this.state.pagination;
                                        pager.current = 1;
                                        this.setState({value:e.target.value, page: 1, pagination: pager});
                                        this.updateProblems(1, e.target.value);
                                    } else {
                                        let pager = this.state.pagination;
                                        pager.current = 1;
                                        this.setState({value: e.target.value, page: 1, pagination: pager, data: []});
                                    }
                                }
                            } value={this.state.value}>
                                <Radio style={radioStyle} value={1}>全部题目</Radio>
                                <Radio style={radioStyle} value={2}>传统IO评测</Radio>
                                <Radio style={radioStyle} value={3}>Javascript</Radio>
                                <Radio style={radioStyle} value={4}>搜索题目</Radio>
                            </Radio.Group>
                        </Card>
                    </Sider>
                    <Content style={{ padding: '0 24px', minHeight: 280 }}>
                        {this.state.value === 4 &&
                        <Input.Search
                            style={{width: '100%', marginBottom: '10px'}}
                            placeholder="输入搜索，使用空格隔开关键词"
                            onSearch={value => {
                                console.log(value);
                                ajax_post(api_list['search_problem'], {keywords: value}, this, (that, result) => {
                                    if(result.data.code === 1) {
                                        message.error("搜索题目失败");
                                        return;
                                    } else if(result.data.length === 0) {
                                        message.warning("暂无结果");
                                        return;
                                    }
                                    let data = [];
                                    for(const d of result.data) {
                                        let new_record = {};
                                        for(const c of problemColumns) {
                                            new_record[c['dataIndex']] = d[c['dataIndex']];
                                        }
                                        data.push(new_record);
                                    }
                                    that.setState({data: data.sort((a,b)=>{return a.id-b.id})});
                                })
                            }}
                            enterButton
                        />
                        }
                        <Table columns={problemColumns}
                               dataSource={this.state.data}
                               pagination={this.state.value === 4 ? false : this.state.pagination}
                               loading={this.state.loading}
                               onChange={this.handleTableChange} />
                    </Content>
                </Layout>
            </Content>
        );
    }
}

export {ProblemBase}