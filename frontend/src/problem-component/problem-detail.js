import React, {Component} from 'react';

import {Card, Container, Table} from 'react-bootstrap';
import {Tabs, Tab, Row, Col} from "react-bootstrap"
import {api_list} from "../ajax-utils/api-manager";
import {ajax_post} from "../ajax-utils/ajax-method";

import ReactMarkdown from '../../node_modules/react-markdown';

import {CodeInput} from "../basic-component/code-input";

// import {Tab, Tabs} from "@blueprintjs/core"

// import "../mock//course-mock";
// import "../mock/auth-mock";
// import "../mock/notice-mock";
// import "../mock/homework-mock";
// import "../mock/problem-mock";

class ProblemDetailBody extends Component {
    render() {
        return (
            <div>
                {/*<Tabs*/}
                    {/*animate={true}*/}
                    {/*id="question_id"*/}
                    {/*key="horizontal"*/}
                    {/*large*/}
                {/*>*/}
                    {/*<Tab id="rx" title="题目详情" panel={<ReactMarkdown source={this.props.probleminfo.description} />} />*/}
                    {/*<Tab id="ng" title="提交代码" panel={<CodeInput state={this.props.state} role={this.props.role}*/}
                                                                   {/*id={this.props.id} problem_id={this.props.probleminfo.id}*/}
                                                                   {/*homework_id={this.props.homework_id}*/}
                                                                   {/*/>} />*/}
                    {/*<Tab id="mb" title="查看结果" panel={<ProblemDetailRecord records={this.props.records} />} />*/}
                {/*</Tabs>*/}

                <Tabs defaultActiveKey="home" id="uncontrolled-tab-example" style={{marginBottom: '10px'}}>
                    <Tab eventKey="home" title="题目详情">
                        <ReactMarkdown source={this.props.probleminfo.description} />
                        {/*</TabPane>*/}
                    </Tab>
                    <Tab eventKey="profile" title="提交代码">
                        <CodeInput state={this.props.state} role={this.props.role}
                                   id={this.props.id} problem_id={this.props.probleminfo.id}
                                   homework_id={this.props.homework_id}/>
                    </Tab>
                    <Tab eventKey="contact" title="查看结果">
                        <ProblemDetailRecord records={this.props.records} />
                    </Tab>
                </Tabs>
            </div>
        );
    }
}

class ProblemDetailRecord extends Component {
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
        let body = [];
        // console.log('outside table render', this.props.records, this.props.records.consume_time);
        if(this.props.records[0]!==undefined && this.props.records[0].consume_time!==undefined) {
            console.log('inside table render', this.props.records);
            let counter = 1;
            for (const re of this.props.records) {
                if(re.consume_time===undefined)
                    continue;
                console.log("inside table render for loop", re);
                let result = '';
                if(re.result!==null) {
                    const result_id = re.result;
                    result = this.result_arr[result_id];
                } else {
                    result = re.score.toString() + ' 分';
                }
                body.push(
                    <tr>
                        <td>{counter}</td>
                        <td>{result}</td>
                        <td>{re.consume_time.toString() + ' ms'}</td>
                        <td>{re.consume_memory.toString() + ' kb'}</td>
                        <td>{re.src_size.toString() + ' B'}</td>
                        <td>{ProblemDetailRecord.timeConverter(re.submit_time)}</td>
                    </tr>
                );
                counter += 1;
            }
        }
        return (
            <Table striped bordered hover style={{marginTop: '10px'}}>
                <thead>
                <tr>
                    <th>#</th>
                    <th>运行结果</th>
                    <th>运行时间</th>
                    <th>所占空间</th>
                    <th>文件大小</th>
                    <th>提交时间</th>
                </tr>
                </thead>
                <tbody>
                    {body}
                </tbody>
            </Table>
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
        };
        this.records = [];
    }
    componentDidMount() {
        const id = parseInt(this.props.problem_id);
        this.setState({id:id});
        ajax_post(api_list['query_problem'], {id:id}, this, ProblemDetail.query_problem_callback);
    }
    static query_problem_callback(that, result) {
        if(result.data.length===0)
            return;
        const prob = result.data[0];
        for(let id of prob.records) {
            that.records.push({id:id});
        }
        that.setState({
            title: prob.title,
            description: prob.description,
            time_limit: parseInt(prob.time_limit),
            memory_limit: parseInt(prob.memory_limit),
            judge_method: parseInt(prob.judge_method),
            records: that.records,
        });
        for(let id of prob.records) {
            ajax_post(api_list['query_record'], {id:id}, that, ProblemDetail.query_record_callback);
        }
    }
    static query_record_callback(that, result) {
        if(result.data.length===0)
            return;
        const rec = result.data[0];
        const id = rec.id;
        const submit_time = rec.submit_time;
        const rec_result = rec.result;
        const rec_score = rec.score;
        const consume_time = rec.consume_time;
        const consume_memory = rec.consume_memory;
        const src_size = rec.src_size;
        for(let rec of that.records) {
            if(rec.id===id) {
                rec.submit_time = submit_time;
                rec.result = rec_result;
                rec.score = rec_score;
                rec.consume_time = consume_time;
                rec.consume_memory = consume_memory;
                rec.src_size = src_size;
                that.setState({records:that.records});
            }
        }
    }
    render() {
        return (
            <Card>
                <Card.Body>
                    <Card.Title className="text-center"><h1>{this.state.title}</h1></Card.Title>
                    <Container>
                        <div style={splitter} />
                        <ProblemDetailBody state={this.props.state} role={this.props.role}
                                           id={this.props.id} probleminfo={this.state}
                                           homework_id={parseInt(this.props.homework_id)}
                                           records={this.state.records}/>
                    </Container>
                </Card.Body>
            </Card>
        );
    }
}

const splitter =
{
    height:'1px',
    backgroundColor:'#ADADAD',
    float:'center',
    width:'100%',
    marginTop: '10px',
    marginBottom: '10px',
};

export {ProblemDetail};