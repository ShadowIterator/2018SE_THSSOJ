import React, {Component} from 'react';

import { Menu, Icon, Layout, Breadcrumb } from 'antd';
const { Sider, Content } = Layout;

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
                            Content
                        </Content>
                    </Layout>
                </Content>
            </div>
        )
    }
}

export {AdminPage}