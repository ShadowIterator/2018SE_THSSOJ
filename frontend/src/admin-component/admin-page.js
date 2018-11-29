import React, {Component} from 'react';
import {ajax_post} from '../ajax-utils/ajax-method';
import { Menu, Icon, Layout, Breadcrumb, Table, Button } from 'antd';
import {api_list} from "../ajax-utils/api-manager";
const { Sider, Content } = Layout;

class AdminTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            page: 1,
            data: [],
            item_per_page: 10,
        };
        this.data = [];
    }
    static updataTable() {
        ajax_post(this.props.api, {
            start: (this.state.page-1)*this.state.item_per_page + 1,
            end: this.state.page*this.state.item_per_page,
        }, this, (that, result)=>{
            that.data = [];
            if(result.data.code===1) {
                alert("List failed.");
                return;
            }
            for(const d of result.data) {
                let new_record = {};
                for(const c of that.props.columns) {
                    new_record[c['dataIndex']] = d[c['dataIndex']];
                }
                that.data.push(new_record);
            }
            that.setState({
                data: that.data,
            })
        });
    }
    componentDidMount() {
        AdminPage.updataTable();
    }
    render() {
        return (
            <Table columns={this.props.columns} dataSource={this.state.data} />
        );
    }
}

const table_api = {
    'Users': api_list['list_user'],
};

const table_columns = {
    'Users': [
        {title: 'ID', dataIndex: 'id', key: 'id'},
        {title: 'Username', dataIndex: 'username', key: 'username'},
        {title: 'Email', dataIndex: 'email', key: 'email'},
        {title: 'Real Name', dataIndex: 'realname', key: 'realname'},
        {title: 'Student ID', dataIndex: 'student_id', key: 'student_id'},
        {title: 'Gender', dataIndex: 'gender', key: 'gender', render: (num) => {
            switch(num) {
                case 0:
                    return <span>Male</span>
                case 1:
                    return <span>Female</span>
                case 2:
                    return <span>Unknown</span>
            }
        }},
        {title: 'Role', dataIndex: 'role', key: 'role', render: (num) => {
            switch(num) {
                case 1:
                    return <span>Student</span>
                case 2:
                    return <span>Teaching Assistant</span>
                case 3:
                    return <span>Administrator</span>
            }
        }},
        {title: 'Student Courses', dataIndex: 'student_courses', key: 'student_courses'},
        {title: 'TA Courses', dataIndex: 'ta_courses', key: 'ta_courses'},
        {title: 'Action', dataIndex: 'action', key: 'action', render: (text, record) =>
            <span>
                <Button onClick={() => {
                    console.log('Delete Users', record.id);
                }}>Delete</Button>
            </span>
        },
    ]
};

class AdminPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            current: 'Users'
        };
        this.tables = ['Users', 'Courses', 'Homeworks', 'Problems', 'Records', 'Notices'];
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
                            <AdminTable columns={table_columns[this.state.current]} api={table_api[this.state.current]}/>
                        </Content>
                    </Layout>
                </Content>
            </div>
        )
    }
}

export {AdminPage}