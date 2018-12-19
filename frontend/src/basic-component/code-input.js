import React, { Component } from 'react';
import {UnControlled as CodeMirror} from '../../node_modules/react-codemirror2';

// import {Button} from '@blueprintjs/core';
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
import '../../node_modules/codemirror/addon/selection/active-line';

import moment from 'moment';

import {Select, message, Form, Button, Modal} from "antd";

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
            submit_type: '4'
        };
        this.clickSubmit = this.clickSubmit.bind(this);
        this.clickTest = this.clickTest.bind(this);
        this.codeChange = this.codeChange.bind(this);
        this.modeChange = this.modeChange.bind(this);
    }

    modeChange(value) {
        let mode = value;
        this.setState({
            // code: defaultcode[mode],
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

    clickSubmit(){
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
            if(moment().unix() > this.props.homework_info.deadline) {
                Modal.confirm({
                    title: '您确定要提交吗？',
                    content: '已过截止日期的提交可能会被助教扣除一些分数，您想要继续提交吗？',
                    okText: '确定',
                    okType: 'danger',
                    cancelText: '取消',
                    onOk: () => {
                        ajax_post(api_list['submit_problem'], data, this, CodeInput.submit_callback);
                    },
                    onCancel: () => {
                        console.log('Cancel');
                    },
                });
                return;
            }
        }
        console.log("intime_submit_data",data);
        ajax_post(api_list['submit_problem'], data, this, CodeInput.submit_callback);
    }

    static submit_callback(that, result) {
        if(result.data.code===0) {
            message.success("您成功地提交了代码");
        } else {
            message.error("代码提交失败");
        }
    }

    clickTest() {
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
            test_ratio: parseInt(this.state.submit_type),
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
        let ratio_one_text, ratio_two_text, ratio_three_text;
        if(this.props.lesson_id !== '0') {
            ratio_one_text = "测试"+this.props.problem_info.ratio_one.toString()+
                "%数据(剩余测试次数："+(this.props.problem_info.ratio_one_limit-this.props.ratio.ratio_one_used).toString()+")";
            ratio_two_text = "测试"+this.props.problem_info.ratio_two.toString()+
                "%数据(剩余测试次数："+(this.props.problem_info.ratio_two_limit-this.props.ratio.ratio_two_used).toString()+")";
            ratio_three_text = "测试"+this.props.problem_info.ratio_three.toString()+
                "%数据(剩余测试次数："+(this.props.problem_info.ratio_three_limit-this.props.ratio.ratio_three_used).toString()+")";
        }
        let submit_options = [];
        if(this.props.lesson_id !== '0') {
            submit_options.push(<Option value={"1"}>{ratio_one_text}</Option>);
            submit_options.push(<Option value={"2"}>{ratio_two_text}</Option>);
            submit_options.push(<Option value={"3"}>{ratio_three_text}</Option>);
        }
        submit_options.push(<Option value={"4"} key={"o4"}>提交</Option>);
        return (
            <div>
                <Form layout="inline" onSubmit={(e)=>{e.preventDefault();}}>
                    <Form.Item label={"请选择提交语言"}>
                        <Select onChange={this.modeChange} value={this.state.mode}
                                style={{outline: 0, width: 150, marginBottom: 10}}>
                            {options}
                        </Select>
                    </Form.Item>
                    <Form.Item label={"请选择提交类型"}>
                        <Select onChange={(value)=>{this.setState({submit_type: value})}} value={this.state.submit_type}
                                style={{outline: 0, width: 300, marginBottom: 10}}>
                            {submit_options}
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" icon="upload" onClick={(e) => {
                            e.preventDefault();
                            if(this.props.lesson_id === '0') {
                                this.clickSubmit();
                            } else if(this.state.submit_type === '4') {
                                this.clickSubmit();
                            } else {
                                this.clickTest();
                            }
                        }}>
                            {this.state.submit_type==='4' ? (moment().unix() > this.props.homework_info.deadline ? "补交":"提交") : "测试"}
                        </Button>
                    </Form.Item>
                </Form>
                <div style={{border: '1px solid grey'}}>
                    <CodeMirror options={{
                                    mode: this.state.language,
                                    theme: 'neat',
                                    lineNumbers: true,
                                    extraKeys: {"Ctrl": "autocomplete"},
                                    smartIndent: true,
                                    matchBrackets: true,
                                }}
                                onChange={this.codeChange}
                    />
                </div>
            </div>
        )
    }

}
CodeInput.contextType = AuthContext;
export {CodeInput};