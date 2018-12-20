import React, {Component} from 'react';

import {Card, Container, Table} from 'react-bootstrap';
import {api_list, URL} from "../ajax-utils/api-manager";
import {ajax_post} from "../ajax-utils/ajax-method";

import ReactMarkdown from '../../node_modules/react-markdown';

import {CodeInput} from "../basic-component/code-input";

import {Link} from 'react-router-dom';

import {UnControlled as CodeMirror} from '../../node_modules/react-codemirror2';

import "./problem_tab.css";

import moment from 'moment';

import '../../node_modules/codemirror/lib/codemirror.css';

import { Layout, Breadcrumb, Tabs, Modal, Upload, Button, Icon, message, Input } from 'antd';
const {Content} = Layout;
const TabPane = Tabs.TabPane;

class ProblemDetailBody extends Component {
    constructor(props) {
        super(props);
        this.state = {
            file: null,
            fileList: [],
            isEditing: this.props.submit_record !== null || this.props.html_record !== null,
            reupload: false,
        }
    }
    componentWillUpdate(nextProps) {
        if(nextProps === this.props) {
            return;
        }
        this.setState({
            isEditing: nextProps.submit_record !== null || nextProps.html_record !== null,
        })
    }
    render() {
        console.log("this.state", this.state);
        console.log("this.props", this.props);
        console.log("bool", this.props.submit_record !== null || this.props.html_record !== null);
        return (
            <div>
                <Tabs defaultActiveKey="1" onChange={(value)=>{
                    console.log(value);
                    if(value==="3"){
                        this.props.update_record(this.props.id);
                    }}} className='problem_tab'>
                    <TabPane tab="题目详情" key="1">
                        <ReactMarkdown source={this.props.probleminfo.description} />
                    </TabPane>
                    <TabPane tab="提交代码" key="2">
                        <div>
                        {this.props.probleminfo.judge_method !== 2 &&
                        <CodeInput state={this.props.state} role={this.props.role}
                                   id={this.props.id} problem_id={this.props.probleminfo.id}
                                   problem_info={this.props.probleminfo}
                                   homework_id={this.props.homework_id} lesson_id={this.props.lesson_id}
                                   homework_info={this.props.homework_info} ratio={this.props.ratio}
                                   update_record={this.props.update_record}/>
                        }
                        {!this.state.isEditing && this.props.probleminfo.judge_method === 2 &&
                        <Upload.Dragger name="file" multiple={false} action={URL+api_list['upload_html']}
                                        fileList={this.state.fileList} style={{outline: 0}}
                                        onChange={(info) => {
                                            let fileList = info.fileList;
                                            console.log("upload_script", fileList);
                                            fileList = fileList.slice(-1);
                                            fileList = fileList.map((file) => {
                                                if (file.response) {
                                                    file.uri = file.response.uri;
                                                }
                                                return file;
                                            });
                                            fileList = fileList.filter((file) => {
                                                if (file.response) {
                                                    return file.response.code === 0;
                                                }
                                                return true;
                                            });
                                            this.setState({file: fileList[0], fileList: fileList});
                                        }}>
                            <p className="ant-upload-drag-icon">
                                <Icon type="inbox" />
                            </p>
                            <p className="ant-upload-text">点击这里或者将文件拖拽进来以上传</p>
                            <p className="ant-upload-hint">请注意您的压缩包格式应为zip，压缩方式为进入您需要压缩的文件夹，全选所有文件后压缩</p>
                        </Upload.Dragger>
                        }
                        {!this.state.isEditing && this.props.probleminfo.judge_method === 2 &&
                        <div style={{textAlign: 'center', marginTop: 15}}>
                            <Button type={"primary"}
                                    disabled={this.props.homework_info.submitable === 0}
                                    onClick={() => {
                                if(this.state.file===null) {
                                    message.error("请上传你的作业");
                                }
                                if(moment().unix() > this.props.homework_info.deadline) {
                                    Modal.confirm({
                                        title: '您确定要提交吗？',
                                        content: '已过截止日期的提交可能会被助教扣除一些分数，您想要继续提交吗？',
                                        okText: '确定',
                                        okType: 'danger',
                                        cancelText: '取消',
                                        onOk: () => {
                                            ajax_post(api_list['submit_problem'], {
                                                user_id: this.props.id,
                                                problem_id: this.props.probleminfo.id,
                                                homework_id: this.props.homework_id,
                                                record_type: 4,
                                                src_code: this.state.file.uri,
                                            }, this, (that, result) => {
                                                if(result.data.code === 0) {
                                                    message.success("上传成功");
                                                } else {
                                                    message.error("上传失败");
                                                }
                                            });
                                        },
                                        onCancel: () => {
                                            console.log('Cancel');
                                        },
                                    });
                                    return;
                                }
                                ajax_post(api_list['submit_problem'], {
                                    user_id: this.props.id,
                                    problem_id: this.props.probleminfo.id,
                                    homework_id: this.props.homework_id,
                                    record_type: 4,
                                    src_code: this.state.file.uri,
                                }, this, (that, result) => {
                                    if(result.data.code === 0) {
                                        message.success("上传成功");
                                    } else {
                                        message.error("上传失败");
                                    }
                                });
                            }}>{moment().unix() > this.props.homework_info.deadline ? "补交" : "提交"}</Button>
                        </div>
                        }
                        {this.state.isEditing && this.props.probleminfo.judge_method === 2 && this.state.reupload &&
                        <Upload.Dragger name="file" multiple={false} action={URL+api_list['upload_html']}
                                        fileList={this.state.fileList} style={{outline: 0}}
                            onChange={(info) => {
                            let fileList = info.fileList;
                            console.log("upload_script", fileList);
                            fileList = fileList.slice(-1);
                            fileList = fileList.map((file) => {
                            if (file.response) {
                            file.uri = file.response.uri;
                        }
                            return file;
                        });
                            fileList = fileList.filter((file) => {
                            if (file.response) {
                            return file.response.code === 0;
                        }
                            return true;
                        });
                            this.setState({file: fileList[0], fileList: fileList});
                        }}>
                            <p className="ant-upload-drag-icon">
                            <Icon type="inbox" />
                            </p>
                            <p className="ant-upload-text">点击这里或者将文件拖拽进来以上传</p>
                            <p className="ant-upload-hint">请注意您的压缩包格式应为zip，压缩方式为进入您需要压缩的文件夹，全选所有文件后压缩</p>
                        </Upload.Dragger>
                        }
                        {this.state.isEditing && this.props.probleminfo.judge_method === 2 && this.state.reupload &&
                        <div style={{textAlign: 'center', marginTop: 15}}>
                            <Button type={"primary"}
                                    disabled={this.props.homework_info.submitable === 0}
                                    onClick={() => {
                                if(this.state.file===null) {
                                    message.error("请上传你的作业");
                                }
                                if(moment().unix() > this.props.homework_info.deadline) {
                                    Modal.confirm({
                                        title: '您确定要提交吗？',
                                        content: '已过截止日期的提交可能会被助教扣除一些分数，您想要继续提交吗？',
                                        okText: '确定',
                                        okType: 'danger',
                                        cancelText: '取消',
                                        onOk: () => {
                                            ajax_post(api_list['submit_problem'], {
                                                user_id: this.props.id,
                                                problem_id: this.props.probleminfo.id,
                                                homework_id: this.props.homework_id,
                                                record_type: 4,
                                                src_code: this.state.file.uri,
                                            }, this, (that, result) => {
                                                if(result.data.code === 0) {
                                                    message.success("上传成功");
                                                } else {
                                                    message.error("上传失败");
                                                }
                                            });
                                        },
                                        onCancel: () => {
                                            console.log('Cancel');
                                        },
                                    });
                                    return;
                                }
                                ajax_post(api_list['submit_problem'], {
                                    user_id: this.props.id,
                                    problem_id: this.props.probleminfo.id,
                                    homework_id: this.props.homework_id,
                                    record_type: 4,
                                    src_code: this.state.file.uri,
                                }, this, (that, result) => {
                                    if(result.data.code === 0) {
                                        message.success("上传成功");
                                    } else {
                                        message.error("上传失败");
                                    }
                                });
                            }}>{moment().unix() > this.props.homework_info.deadline ? "补交" : "提交"}</Button>
                        </div>
                        }
                        {this.state.isEditing && this.props.probleminfo.judge_method === 2 && !this.state.reupload &&
                        <div style={{textAlign: 'center'}}>
                            <a href={URL+api_list['download_html']+"?id="+this.props.html_record.id.toString()} download={"html.zip"} >下载已上传文件</a><br/>
                            <Button style={{marginTop: 15}}
                                    disabled={this.props.homework_info.submitable === 0}
                                    onClick={()=>{this.setState({reupload: true})}}>重新上传</Button>
                        </div>
                        }
                        </div>
                    </TabPane>
                    <TabPane tab="查看结果" key="3">
                        <ProblemDetailRecord records={this.props.records} submit_record={this.props.submit_record}
                                             lesson_id={this.props.lesson_id} html_record={this.props.html_record}
                                             judge_method={this.props.probleminfo.judge_method} />
                    </TabPane>
                </Tabs>
            </div>
        );
    }
}

class ProblemDetailRecord extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            judger_info_visible: false,
            modal_text: '',
            src_code: ''
        }
    }
    result_arr = ['Accepted',
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
    static timeConverter(UNIX_timestamp){
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
    render() {
        const language = ['C', 'C++', 'Javascript', 'Python'];
        let body = [];
        if(this.props.submit_record !== null || this.props.html_record !== null) {
            const sub = this.props.submit_record===null ? this.props.html_record : this.props.submit_record;
            let result = '';
            if(sub.status === 0) {
                result = '等待评测';
            } else {
                if (sub.result_type === 0) {
                    const result_id = sub.result;
                    if (isNaN(result_id)) {
                        result = '找不到结果';
                    } else {
                        result = this.result_arr[result_id];
                    }
                } else {
                    if (isNaN(sub.score)) {
                        result = '找不到结果';
                    } else {
                        result = sub.score.toString() + ' 分';
                    }
                }
            }
            body.push(
                <tr>
                    <td>0</td>
                    {this.props.lesson_id !== '0' &&
                    <td>正式提交</td>
                    }
                    <td>{result}</td>
                    <td>{sub.consume_time === null ? -1 : (sub.consume_time.toString() + 'ms')}</td>
                    <td>{sub.consume_memory === null ? -1 : (sub.consume_memory.toString() + ' kb')}</td>
                    <td>{sub.src_size === null ? -1 : (sub.src_size.toString() + ' B')}</td>
                    <td>{ProblemDetailRecord.timeConverter(sub.submit_time)}</td>
                    <td>{language[sub.src_language-1]}</td>
                    {this.props.judge_method !== 2 &&
                    <td><a onClick={() => {
                        ajax_post(api_list['srcCode_record'], {id: sub.id}, this, (that, result) => {
                            if(result.data.code === 1) {
                                message.error("请求源码失败");
                                return;
                            }
                            that.setState({src_code: result.data.src_code, visible: true});
                        });
                    }}>查看源码</a></td>
                    }
                    {this.props.judge_method !== 2 &&
                    <td><a onClick={() => {
                        if(sub.status === 0) {
                            message.warning("暂无评测信息");
                        }
                        ajax_post(api_list['judger_info'], {record_id: sub.id}, this, (that, result) => {
                            if(result.data.code === 1) {
                                message.error("请求评测数据失败");
                                return;
                            }
                            that.setState({judger_info: result.data.info, judger_info_visible: true});
                        })
                    }}>查看评测信息</a></td>
                    }
                </tr>
            )
        }
        if(this.props.records[0]!==undefined && this.props.records[0].consume_time!==undefined) {
            console.log('inside table render', this.props.records);
            let counter = 1;
            const records = this.props.records.sort((a, b)=>{
                return b.id-a.id;
            });
            for (const re of records) {
                if(re.consume_time===undefined)
                    continue;
                console.log("inside table render for loop", re);
                let result = '';
                if(re.status === 0) {
                    result = '正在评测';
                } else {
                    if (re.result_type === 0) {
                        const result_id = re.result;
                        if (isNaN(result_id)) {
                            result = '找不到结果';
                        } else {
                            result = this.result_arr[result_id];
                        }
                    } else {
                        if (isNaN(re.score)) {
                            result = '找不到结果';
                        } else {
                            result = re.score.toString() + ' 分';
                        }
                    }
                }
                body.push(
                    <tr>
                        <td>{counter}</td>
                        {this.props.lesson_id !== '0' &&
                        <td>{'测试' + re.test_ratio.toString() + '%数据'}</td>
                        }
                        <td>{result}</td>
                        <td>{re.consume_time === null ? -1 : (re.consume_time.toString() + ' ms')}</td>
                        <td>{re.consume_memory === null ? -1 : (re.consume_memory.toString() + ' kb')}</td>
                        <td>{re.src_size === null ? -1 : (re.src_size.toString() + ' B')}</td>
                        <td>{ProblemDetailRecord.timeConverter(re.submit_time)}</td>
                        <td>{language[re.src_language-1]}</td>
                        {this.props.judge_method !== 2 &&
                        <td><a onClick={() => {
                            ajax_post(api_list['srcCode_record'], {id: re.id}, this, (that, result) => {
                                that.setState({src_code: result.data.src_code});
                            });
                            this.setState({visible: true});
                        }}>查看源码</a></td>
                        }
                        {this.props.judge_method !== 2 &&
                        <td><a onClick={() => {
                            if(re.status === 0) {
                                message.warning("暂无评测信息");
                            }
                            ajax_post(api_list['judger_info'], {record_id: re.id}, this, (that, result) => {
                                if(result.data.code === 1) {
                                    message.error("请求评测数据失败");
                                    return;
                                }
                                that.setState({judger_info: result.data.info, judger_info_visible: true});
                            })
                        }}>查看评测信息</a></td>
                        }
                    </tr>
                );
                counter += 1;
            }
        }
        return (
            <div>
                <Table striped bordered hover style={{marginTop: '10px'}}>
                    <thead>
                    <tr>
                        <th>#</th>
                        {this.props.lesson_id !== '0' &&
                        <th>测试类型</th>
                        }
                        <th>运行结果</th>
                        <th>运行时间</th>
                        <th>所占空间</th>
                        <th>文件大小</th>
                        <th>提交时间</th>
                        <th>语言</th>
                        {this.props.judge_method !== 2 &&
                        <th>源码</th>
                        }
                        {this.props.judge_method !== 2 &&
                        <th>评测信息</th>
                        }
                    </tr>
                    </thead>
                    <tbody>
                        {body}
                    </tbody>
                </Table>
                <Modal
                    title="查看源码"
                    visible={this.state.visible}
                    width='55%'
                    onOk={()=>{this.setState({visible: false})}}
                    onCancel={()=>{this.setState({visible: false})}}
                >
                    <CodeMirror options={{
                        theme: 'neat',
                        lineNumbers: true,
                        readOnly: true,
                    }} value={this.state.src_code} />
                </Modal>
                {this.state.judger_info_visible &&
                <Modal
                    title="查看评测详细信息"
                    visible={this.state.judger_info_visible}
                    width='55%'
                    onOk={() => {
                        this.setState({judger_info_visible: false})
                    }}
                    onCancel={() => {
                        this.setState({judger_info_visible: false})
                    }}
                >
                    <CodeMirror options={{
                        readOnly: true,
                    }}
                        value={this.state.judger_info}
                    />
                </Modal>
                }
            </div>
        );
    }
}

class ProblemDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: -1,
            title: '',
            description: '',
            time_limit: 0,
            memory_limit: 0,
            judge_method: 0,
            records: [],
            lesson_name: '',
            submit_record: null,
            html_record: null,
            language: [],
            homework_info: {},
            problem_info: {},
            ratio: {ratio_one_used: 10, ratio_two_used: 10, ratio_three_used: 10},
        };
        this.records = [];
    }
    componentDidMount() {
        const id = parseInt(this.props.problem_id);
        this.setState({id:id});
        ajax_post(api_list['query_problem'], {
            id:id,
            homework_id: parseInt(this.props.homework_id),
            course_id: parseInt(this.props.lesson_id),
        }, this, ProblemDetail.query_problem_callback);
        ajax_post(api_list['query_homework'], {
            id: parseInt(this.props.homework_id),
        }, this, (that, result) => {
            if(result.data.code === 1) {
                message.error("请求作业数据失败");
                return;
            }
            if(result.data.length === 0) {
                return;
            }
            that.setState({
                homework_info: result.data[0],
            })
        });
        if(this.props.lesson_id==='0')
            return;
        ajax_post(api_list['query_course'], {id:parseInt(this.props.lesson_id)}, this, (that, result)=>{
            if(result.data.code===1) {
                return;
            }
            const course = result.data[0];
            that.setState({lesson_name:course.name});
        });
        if(this.props.id !== -1) {
            this.update_record(this.props.id);
        }
    }
    componentWillUpdate(nextProps) {
        if(nextProps.id===undefined || nextProps.id === -1)
            return;
        if(nextProps.id !== this.props.id) {
            this.update_record(nextProps.id);
        }
    }
    update_record = (id) => {
        if(id === -1)
            return;
        if(this.props.lesson_id === '0') {
            ajax_post(api_list['query_record'], {
                user_id: id,
                problem_id: parseInt(this.props.problem_id),
                record_type: 0,
            }, this, (that, result) => {
                if(result.data.length === 0) {
                    return;
                }
                that.setState({records: result.data});
            });
        } else {
            ajax_post(api_list['query_ratio'], {
                user_id: id,
                homework_id: parseInt(this.props.homework_id),
                problem_id: parseInt(this.props.problem_id),
            }, this, (that, result) => {
                if(result.data.code === 1 || result.data.length === 0) {
                    message.error("请求剩余测试数据失败");
                    return;
                }
                that.setState({ratio: result.data[0]});
            });
            ajax_post(api_list['query_record'], {
                user_id: id,
                problem_id: parseInt(this.props.problem_id),
                homework_id: parseInt(this.props.homework_id),
                record_type: 1,
            }, this, (that, result) => {
                if(result.data.code === 1 || result.data.length === 0) {
                    return;
                }
                that.setState({records: result.data});
            });
            ajax_post(api_list['query_record'], {
                user_id: id,
                problem_id: parseInt(this.props.problem_id),
                homework_id: parseInt(this.props.homework_id),
                record_type: 2,
            }, this, (that, result) => {
                if(result.data.code === 1 || result.data.length === 0) {
                    return;
                }
                that.setState({submit_record: result.data[0]});
            });
            ajax_post(api_list['query_record'], {
                user_id: id,
                problem_id: parseInt(this.props.problem_id),
                homework_id: parseInt(this.props.homework_id),
                record_type: 4,
            }, this, (that, result) => {
                if(result.data.code === 1 || result.data.length === 0) {
                    return;
                }
                that.setState({html_record: result.data[0]});
            });
        }
    };
    static query_problem_callback(that, result) {
        if(result.data.length===0)
            return;
        const prob = result.data[0];
        that.setState({
            title: prob.title,
            description: prob.description,
            time_limit: parseInt(prob.time_limit),
            memory_limit: parseInt(prob.memory_limit),
            judge_method: parseInt(prob.judge_method),
            language: prob.language,
            problem_info: prob,
        });
    }
    render() {
        return (
            <Content style={{ padding: '0 50px' }}>
                {this.props.lesson_id !== '0' &&
                    <Breadcrumb style={{margin: '16px 0'}}>
                        <Breadcrumb.Item><Link to='/student'>主页</Link></Breadcrumb.Item>
                        <Breadcrumb.Item><Link to={'/studentlesson/' + this.props.lesson_id}>{this.state.lesson_name}</Link></Breadcrumb.Item>
                        <Breadcrumb.Item>{this.state.title}</Breadcrumb.Item>
                    </Breadcrumb>
                }
                {this.props.lesson_id === '0' &&
                    <Breadcrumb style={{margin: '16px 0'}}>
                        <Breadcrumb.Item><Link to='/problembase'>公共题库</Link></Breadcrumb.Item>
                        <Breadcrumb.Item>{this.state.title}</Breadcrumb.Item>
                    </Breadcrumb>
                }
                <Card>
                    <Card.Body>
                        <Card.Title className="text-center"><h1>{this.state.title}</h1></Card.Title>
                        <Container>
                            <ProblemDetailBody state={this.props.state} role={this.props.role}
                                               id={this.props.id} probleminfo={this.state.problem_info}
                                               homework_id={parseInt(this.props.homework_id)}
                                               records={this.state.records} lesson_id={this.props.lesson_id}
                                               submit_record={this.state.submit_record}
                                               html_record={this.state.html_record}
                                               homework_info={this.state.homework_info} ratio={this.state.ratio}
                                               update_record={this.update_record}/>
                        </Container>
                    </Card.Body>
                </Card>
            </Content>
        );
    }
}

export {ProblemDetail};