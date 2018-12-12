import React, { Component } from 'react';
import {UnControlled as CodeMirror} from '../../node_modules/react-codemirror2';

import {Button} from '@blueprintjs/core';
import {ajax_post} from "../ajax-utils/ajax-method";
import {api_list} from "../ajax-utils/api-manager";
import {AuthContext} from "./auth-context";

import '../../node_modules/codemirror/lib/codemirror.css';
import '../../node_modules/codemirror/theme/material.css';
import '../../node_modules/codemirror/theme/neat.css';
import '../../node_modules/codemirror/mode/javascript/javascript.js';
import '../../node_modules/codemirror/mode/clike/clike.js';
import '../../node_modules/codemirror/mode/python/python.js';
import '../../node_modules/codemirror/addon/hint/show-hint.css';
import '../../node_modules/codemirror/addon/hint/show-hint.js';
import '../../node_modules/codemirror/addon/selection/active-line'

import {Select, Row, Col} from "antd";

const Option = Select.Option;

const defaultcode = {'javascript': '// javascript code here',
                     'C': '// C code here',
                     'C++': '// C++ code here',
                     'Python3': '# Python code here'};

class CodeInput extends Component {

    constructor(props) {
        super(props);
        let lang_str = '';
        let lang_type = '';
        switch(this.props.problem_info.language[0]) {
            case 1: lang_str='C'; lang_type='text/x-csrc'; break;
            case 2: lang_str='C++'; lang_type='text/x-c++src'; break;
            case 3: lang_str='javascript'; lang_type='text/javascript'; break;
            case 4: lang_str='Python3'; lang_type='text/x-python'; break;
            default: break;
        }
        this.state = {
            code: defaultcode[lang_str],
            mode: lang_str,
            language: lang_type,
        };
        this.clickSubmit = this.clickSubmit.bind(this);
        this.clickTest = this.clickTest.bind(this);
        this.codeChange = this.codeChange.bind(this);
        this.modeChange = this.modeChange.bind(this);
    }

    modeChange(value) {
        let mode = value;
        this.setState({
            code: defaultcode[mode],
            mode: mode
        });

        if (mode === 'javascript')
            this.setState({
                language: 'text/javascript',
            });
        else if (mode === 'C')
            this.setState({
                language: 'text/x-csrc',
            });
        else if (mode === 'C++')
            this.setState({
                language: 'text/x-c++src',
            });
        else if (mode === 'Python3')
            this.setState({
                language: 'text/x-python',
            })

    }

    codeChange(editor, data, value){
        this.setState({code: value});
    }

    clickSubmit(e){
        e.preventDefault();
        e.stopPropagation();
        let lang;
        if (this.state.mode === 'javascript')
            lang = 3;
        else if (this.state.mode === 'C')
            lang = 1;
        else if (this.state.mode === 'C++')
            lang = 2;
        else if (this.state.mode === 'Python3')
            lang = 4;
        else
            lang = -1;
        let record_type;
        let data = {};
        if(this.props.lesson_id === '0') {
            record_type = 0;
            data = {
                user_id: this.props.id,
                problem_id: this.props.problem_id,
                record_type: record_type,
                src_code: this.state.code,
                src_language: lang,
                test_ratio: 100,
            };
        } else {
            record_type = 2;
            data = {
                user_id: this.props.id,
                problem_id: this.props.problem_id,
                homework_id: this.props.homework_id,
                record_type: record_type,
                src_code: this.state.code,
                src_language: lang,
                test_ratio: 100,
            };
        }
        console.log(data);
        ajax_post(api_list['submit_problem'], data, this, CodeInput.submit_callback);
    }

    static submit_callback(that, result) {
        if(result.data.code===0) {
            alert("Successfully submit your code.");
        } else {
            alert("Something wrong while submitting your code.");
        }
    }

    clickTest(e) {
        e.preventDefault();
        e.stopPropagation();
        let lang;
        if (this.state.mode === 'javascript')
            lang = 3;
        else if (this.state.mode === 'C')
            lang = 1;
        else if (this.state.mode === 'C++')
            lang = 2;
        else if (this.state.mode === 'Python3')
            lang = 4;
        else
            lang = -1;
        const data = {
            user_id: this.props.id,
            problem_id: this.props.problem_id,
            homework_id: this.props.homework_id,
            record_type: 1,
            src_code: this.state.code,
            src_language: lang,
            test_ratio: 100,
        };
        ajax_post(api_list['submit_problem'], data, this, CodeInput.submit_callback);
    }

    render() {
        let options = [];
        let language;
        if(!this.props.problem_info.language) {
            language = [1, 2, 3, 4];
        } else {
            language = this.props.problem_info.language;
        }
        for(const lang_id of language) {
            if(lang_id === 1) {
                options.push(<Option value={"C"}>C</Option>);
            } else if(lang_id === 2) {
                options.push(<Option value={"C++"}>C++</Option>);
            } else if(lang_id === 3) {
                options.push(<Option value={"javascript"}>Javascript</Option>);
            } else if(lang_id === 4) {
                options.push(<Option value={"Python3"}>Python3</Option>);
            }
        }
        return (
            <div>
                <Select onChange={this.modeChange} value={this.state.mode} style={{outline: 0, width: 120, marginBottom: 10}}>
                    {options}
                </Select>
                <div style={{border: '1px solid grey'}}>
                    <CodeMirror options={{
                                    mode: this.state.language,
                                    theme: 'neat',
                                    lineNumbers: true,
                                    extraKeys: {"Ctrl": "autocomplete"},
                                    // autofocus: true
                                }}
                                onChange={this.codeChange}
                                value={this.state.code}
                    />
                </div>
                <Row type="flex" justify="center">
                    {this.props.lesson_id !== '0' &&
                    <Col span={4}>
                        <div style={{textAlign: 'center', marginTop: '10px'}}>
                            <Button icon="build" onClick={this.clickTest} style={{outline: 0}}>测试</Button>
                        </div>
                    </Col>
                    }
                    <Col span={4}>
                        <div style={{textAlign: 'center', marginTop: '10px'}}>
                            <Button icon="upload" onClick={this.clickSubmit} style={{outline: 0}}>提交</Button>
                        </div>
                    </Col>
                </Row>
            </div>
        )
    }

}
CodeInput.contextType = AuthContext;
export {CodeInput};