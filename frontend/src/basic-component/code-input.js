import React, { Component } from 'react';
import {UnControlled as CodeMirror} from '../../node_modules/react-codemirror2';

import {Button, Card} from '@blueprintjs/core';
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
import {Tabs} from "antd";

const defaultcode = {'javascript': '// javascript code here',
                     'C': '// C code here',
                     'C++': '// C++ code here',
                     'Python3': '# Python code here'};

class CodeInput extends Component {

    constructor(props) {
        super(props);
        this.state = {
            code: defaultcode['javascript'],
            mode: 'javascript',
            language: 'text/javascript'
        };
        this.clickHandler = this.clickHandler.bind(this);
        this.codeChange = this.codeChange.bind(this);
        this.modeChange = this.modeChange.bind(this);
    }

    modeChange(e) {
        let mode = e.target.value;
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

    clickHandler(e){
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
            src_code: this.state.code,
            src_language: lang
        };
        ajax_post(api_list['submit_problem'], data, this, CodeInput.submit_callback);
    }

    static submit_callback(that, result) {
        if(result.data.code===0) {
            alert("Successfully submit your code.");
        } else {
            alert("Something wrong while submitting your code.");
        }
    }

    render() {
        return (
            <div>
                {/*<Card>*/}
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
                {/*</Card>*/}
                <select onChange={this.modeChange} value={this.state.mode}>
                    <option value="javascript">javascript</option>
                    <option value="C">C</option>
                    <option value="C++">C++</option>
                    <option value="Python3">Python3</option>
                </select>
                <Button large icon="upload" onClick={this.clickHandler} style={{marginTop:'10px'}} style={{outline: 0}}>提交</Button>
            </div>
        )
    }

}
CodeInput.contextType = AuthContext;
export {CodeInput};