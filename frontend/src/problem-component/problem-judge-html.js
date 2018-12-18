import React, {Component} from 'react';
import {ajax_post} from "../ajax-utils/ajax-method";
import {api_list, URL} from "../ajax-utils/api-manager";
import {Layout, Menu, Breadcrumb, message, Row, Col, Input, Button} from 'antd';
import {Link} from 'react-router-dom';

const { Content, Sider } = Layout;

class JudgeHTML extends Component {
    constructor(props) {
        super(props);
        this.state = {
            records: {},
            uri: '',
            current_selected: '',
            current_score: '',
            course_info: {},
            homework_info: {},
            problem_info: {},
        };
        this.course_id = parseInt(this.props.course_id);
        this.homework_id = parseInt(this.props.homework_id);
        this.problem_id = parseInt(this.props.problem_id);
        console.log("course_id", this.course_id);
        console.log("homework_id", this.homework_id);
        console.log("problem_id", this.problem_id);

        this.changed = false;
    }
    componentDidMount() {
        if(this.props.id === -1) {
            return;
        }
        this.props.callback(true);
        this.fetchData(this.props.id);
    }
    componentWillUpdate(nextProps) {
        // if(this.changed === false) {
        //     this.props.callback(true);
        //     this.changed = true;
        // }
        if(nextProps.id === -1) {
            return;
        } else if(nextProps.id === this.props.id) {
            return;
        }
        this.props.callback(true);
        this.fetchData(nextProps.id);
    }
    fetchData = (id) => {
        console.log("fetching data...");
        ajax_post(api_list['query_course'], {id: this.course_id}, this, (that, result) => {
            if(result.data.code === 1 || result.data.length === 0) {
                message.error("请求课程信息失败");
                return;
            }
            that.setState({course_info: result.data[0]});
        });
        ajax_post(api_list['query_homework'], {id: this.homework_id}, this, (that, result) => {
            if(result.data.code === 1 || result.data.length === 0) {
                message.error("请求作业信息失败");
                return;
            }
            that.setState({homework_info: result.data[0]});
        });
        ajax_post(api_list['query_problem'], {id: this.problem_id}, this, (that, result) => {
            if(result.data.code === 1 || result.data.length === 0) {
                message.error("请求问题信息失败");
                return;
            }
            that.setState({problem_info: result.data[0]});
        });
        ajax_post(api_list['judge_all'], {
            homework_id: this.homework_id,
            problem_id: this.problem_id,
            course_id: this.course_id,
        }, this, (that, result) => {
            if(result.data.code === 1) {
                message.error("请求评测本次作业失败");
                return;
            }
            that.setState({uri: result.data.uri});
        });
        ajax_post(api_list['query_record'], {
            problem_id: this.problem_id,
            homework_id: this.homework_id,
            course_id: this.course_id,
            record_type: 4,
        }, this, (that, result) => {
            if(result.data.length === 0) {
                message.warning("暂无已提交作业");
                return;
            }
            let records = {};
            for(const re of result.data) {
                records[re.user_id.toString()] = re;
                records[re.user_id.toString()].user_info = {};
                records[re.user_id.toString()].user_info.id = 0;
            }
            that.setState({records: records});
            for(const re of result.data) {
                ajax_post(api_list['query_user'], {id: re.user_id}, that, (that, result) => {
                    if(result.data.length !== 0) {
                        let records = that.state.records;
                        records[result.data[0].id.toString()].user_info = result.data[0];
                        that.setState({records: records});
                    }
                });
            }
        })
    };
    render() {
        let records_arr = [];
        for(const id_str in this.state.records) {
            records_arr.push(this.state.records[id_str]);
        }
        records_arr.sort(function(a, b) {
            const ida = a.user_info.id;
            const idb = b.user_info.id;
            return (ida<idb) ? -1 : (ida>idb) ? 1 : 0;
        });
        if(records_arr.length === 0) {
            return <h2>当前无作业可以批改</h2>;
        }
        const selected_key = this.state.current_selected === '' ?
            records_arr[0].user_id.toString() : this.state.current_selected;
        if(this.state.current_selected === '') {
            this.setState({current_selected: selected_key});
        }
        const selected_record = this.state.records[selected_key];
        console.log("selected_key", selected_key);
        console.log("selected_record", selected_record);
        const iframe_src = URL+this.state.uri+'/'+selected_record.user_info.id.toString()+'/index.html';
        // const iframe_src = 'https://www.qq.com';
        const content = (
            <div style={{height: '100%'}}>
                {/*<Row>*/}
                <div style={{height: '95%'}}>
                    <iframe src={iframe_src} width={'100%'} height={'100%'} sandbox={''}>
                    </iframe>
                </div>
                {/*</Row>*/}
                <div style={{height: '4%', marginTop: '1%'}}>
                <Row type="flex" justify="space-around" align="middle">
                    <Col span={20}>
                        <Input onChange={(e)=>{this.setState({current_score: e.target.value})}}
                               value={this.state.current_score} placeholder="请输入所评分数" />
                    </Col>
                    <Col span={4}>
                        <Button type={"primary"} onClick={()=>{
                            const score = parseInt(this.state.current_score);
                            if(isNaN(score)) {
                                message.error("请输入0-100之间的整数");
                                return;
                            } else if(score<0 || score >100) {
                                message.error("请输入0-100之间的整数");
                                return;
                            }
                            ajax_post(api_list['judge_html'], {
                                record_id: selected_record.id,
                                score: score,
                                user_course_id: this.course_id,
                            }, this, (that, result) => {
                                if(result.data.code !== 0) {
                                    message.error("提交分数失败");
                                } else {
                                    message.success("提交分数成功");
                                }
                            });
                        }}>提交</Button>
                    </Col>
                </Row>
                </div>
            </div>
        );
        return (
            <div>
            <Layout>
                <Sider width={180}
                       style={{ background: '#fff', overflow: 'auto', height: '100vh', position: 'fixed', left: 0, }}>
                    <Menu
                        mode="inline"
                        defaultSelectedKeys={[records_arr[0].user_id.toString()]}
                        style={{ height: '100%', borderRight: 0 }}
                        onClick={(e)=>{this.setState({current_selected: e.key})}}
                    >
                        {records_arr.map((re) =>
                        <Menu.Item key={re.user_id.toString()}>
                            {re.user_info.realname === '' ? re.user_info.username:re.user_info.realname}
                        </Menu.Item>)}
                    </Menu>
                </Sider>
                <Layout style={{ marginLeft: 200, height: '88vh' }}>
                    <Breadcrumb style={{ margin: '16px 0' }}>
                        <Breadcrumb.Item><Link to='/ta' onClick={this.props.callback(false)}>主页</Link></Breadcrumb.Item>
                        <Breadcrumb.Item><Link to={'/talesson/'+this.course_id.toString()}
                                               onClick={this.props.callback(false)}>{this.state.course_info.name}
                                               </Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>{this.state.homework_info.name}</Breadcrumb.Item>
                        <Breadcrumb.Item>{this.state.problem_info.title}</Breadcrumb.Item>
                        <Breadcrumb.Item>HTML批改</Breadcrumb.Item>
                        <Breadcrumb.Item>{selected_record.user_info.realname === '' ?
                            selected_record.user_info.username:selected_record.user_info.realname}</Breadcrumb.Item>
                    </Breadcrumb>
                    <Content style={{
                        background: '#fff', padding: 24, margin: 0, height: '100%'
                    }}
                    >
                        {content}
                    </Content>
                </Layout>
            </Layout>
            </div>
        );
    }
}

export {JudgeHTML};