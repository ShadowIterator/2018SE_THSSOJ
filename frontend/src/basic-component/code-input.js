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

class CodeInput extends Component {

    constructor(props) {
        super(props);
        this.state = {
            code: '// code here'
        }
        this.clickHandler = this.clickHandler.bind(this);
        this.codeChange = this.codeChange.bind(this);
    }

    codeChange(editor, data, value){
        this.setState({code: value});
    }

    clickHandler(e){
        e.preventDefault();
        e.stopPropagation();
        const data = {
            user_id: this.context.id,
            problem_id: this.props.problem_id,
            homeword_id: this.props.homeword_id,
            src_code: this.state.code,
        };
        ajax_post(api_list['/api/problem/submit'], data, this, CodeInput.submit_callback);
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
            <CodeMirror value={this.state.code}
                        ref="editor"
                        options={{
                            mode: {name: "javascript"},
                            theme: 'neat',
                            lineNumbers: true,
                            extraKeys: {"Ctrl": "autocomplete"},
                        }}
                        onChange={this.codeChange}
            />
                <Button large icon="upload" onClick={this.clickHandler} style={{marginTop:'10px'}}>提交</Button>
            </div>
        )
    }

}
CodeInput.contextType = AuthContext;
export {CodeInput};