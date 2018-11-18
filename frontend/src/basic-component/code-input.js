import React, { Component } from 'react';
import {UnControlled as CodeMirror} from 'react-codemirror2'

require('codemirror/lib/codemirror.css');
require('codemirror/theme/material.css');
require('codemirror/theme/neat.css');
require('codemirror/mode/javascript/javascript.js');
require('codemirror/mode/clike/clike.js')
require('codemirror/mode/python/python.js')
require('codemirror/addon/hint/show-hint.css')
require('codemirror/addon/hint/show-hint.js')

// class CodeInput extends Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             code: '// code',
//             language: 'C'
//         }
//         this.updateCode = this.updateCode.bind(this);
//     }
//
//     updateCode(editor, data, newCode) {
//         this.setState({code: {newCode}});
//     }
//
//     render() {
//         const options = {
//             lineNumbers: true,
//             readOnly: false,
//             mode: 'markdown'
//         };
//         const code = this.state.code;
//         return (
//             <div>
//                 <CodeMirror detachOnMount={true} value={code} onChange={this.updateCode} options={options} />
//                 {/*<div style={{ marginTop: 10 }}>*/}
//                     {/*<select onChange={this.changeMode} value={this.state.mode}>*/}
//                         {/*<option value="markdown">Markdown</option>*/}
//                         {/*<option value="javascript">JavaScript</option>*/}
//                     {/*</select>*/}
//                     {/*<button onClick={this.toggleReadOnly}>Toggle read-only mode (currently {this.state.readOnly ? 'on' : 'off'})</button>*/}
//                 {/*</div>*/}
//             </div>
//             // <CodeMirror value={code} onChange={this.updateCode} options={options} />
//         );
//     }
// }

class CodeInput extends Component {

    constructor(props) {
        super(props);
        this.state = {
            code: '// code'
        }
        this.clickhandler = this.clickhandler.bind(this);
        this.codeChange = this.codeChange.bind(this);
    }

    codeChange(editor, data, value){
        this.setState({code: value});
    }

    clickhandler(e){
        console.log(this.state.code)
    }

    render() {
        return (
            <div>
            <CodeMirror value={'// code'}
                        ref="editor"
                        options={{
                            mode: {name: "text/x-csrc"},
                            theme: 'ambiance',
                            lineNumbers: true,
                            extraKeys: {"Ctrl": "autocomplete"},
                        }}
                        onChange={this.codeChange}
                        // onChange={(editor, data, value) => {
                        //     // console.log(editor.getValue());
                        // }}
            />
                <button onClick={this.clickhandler}>123</button>
            </div>
        )
    }

}
export {CodeInput};