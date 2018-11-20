import React, { Component } from 'react';

import {Container, Col, Row, Card,} from 'react-bootstrap';

import {api_list} from "../ajax-utils/api-manager";
import {ajax_post} from "../ajax-utils/ajax-method";

import ReactMarkdown from '../../node_modules/react-markdown';

import {CodeInput} from "../basic-component/code-input";

// import "../mock/course-mock";
// import "../mock/auth-mock";
// import "../mock/notice-mock";
// import "../mock/homework-mock";
// import "../mock/problem-mock";

class ProblemDetailBody extends Component {
    render() {
        return (
            <>
                <ReactMarkdown source={this.props.probleminfo.description} />
                <CodeInput />
            </>
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
        const consume_time = rec.comsume_time;
        const comsume_memory = rec.comsume_memory;
        const src_size = rec.src_size;
        for(let rec of that.records) {
            if(rec.id===id) {
                rec.submit_time = submit_time;
                rec.result = rec_result;
                rec.consume_time = consume_time;
                rec.comsume_memory = comsume_memory;
                rec.src_size = src_size;
                that.setState({records:that.records});
            }
        }
    }
    render() {
        return (
            <Card>
                <Card.Body>
                    {/*<Card.Title>{this.state.title}</Card.Title>*/}
                    <Container>
                        <ProblemDetailBody probleminfo={this.state}/>
                    </Container>
                </Card.Body>
            </Card>
        );
    }
}

export {ProblemDetail};