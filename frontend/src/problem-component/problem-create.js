import React, {Component} from 'react';

import {api_list, URL} from "../ajax-utils/api-manager";
import {ajax_post} from "../ajax-utils/ajax-method";

import { Link, withRouter } from 'react-router-dom';

import { Layout, Breadcrumb, Form, Input, Select, Row, Col, Checkbox, Button, Switch, Upload, Icon, Radio } from 'antd';
const {Content} = Layout;
const Option = Select.Option;
const {TextArea} = Input;
const FormItem = Form.Item;

class RegistrationForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            upload_code: {},
            upload_case: {},
            upload_script: {},
            language_radio: [],
            judge_method: 0,
        }
    }
    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
                console.log('this.state', this.state);
                const data = {
                    title: values.title,
                    description: values.description,
                    time_limit: parseInt(values.time_limit),
                    memory_limit: parseInt(values.memory_limit),
                    judge_method: parseInt(values.judge_method),
                    language: values.language.map((lang)=>parseInt(lang)),
                    openness: values.switch === '' ? 0 : (values.switch ? 1 : 0),
                    user_id: this.props.id,
                    code_uri: this.state.upload_code.uri,
                    case_uri: this.state.upload_case.uri,
                    script_uri: this.state.upload_script.uri,
                    test_language: parseInt(values.code_lang),
                };
                console.log("create_problem_data", data);
                ajax_post(api_list['create_problem'], data, this, (that, result) => {
                    if(result.data.code === 0) {
                        console.log("Successfully create problem.");
                        this.props.history.push('/ta');
                    } else {
                        alert("Create problem failed.");
                    }
                });
            }
        });
    };

    validateTimeLimit = (rule, value, callback) => {
        if (value && isNaN(parseInt(value))) {
            callback('请输入一个合法的整数');
        } else if(value && parseInt(value)<=0) {
            callback('请输入一个大于零的整数');
        } else {
            callback();
        }
    };

    validateMemoryLimit = (rule, value, callback) => {
        if (value && isNaN(parseInt(value))) {
            callback('请输入一个合法的整数');
        } else if(value && parseInt(value)<=0) {
            callback('请输入一个大于零的整数');
        } else {
            callback();
        }
    };

    normFile = (e) => {
        console.log('Upload event:', e);
        if (Array.isArray(e)) {
            return e;
        }
        return e && e.fileList;
    };

    render() {
        const { getFieldDecorator } = this.props.form;

        const formItemLayout = {
            labelCol: {
                xs: { span: 12 },
                sm: { span: 10 },
                md: { span: 10},
                lg: { span: 6},
            },
            wrapperCol: {
                xs: { span: 12 },
                sm: { span: 14 },
                md: { span: 14},
                lg: { span: 18},
            },
        };
        const tailFormItemLayout = {
            wrapperCol: {
                xs: {
                    span: 24,
                    offset: 0,
                },
                sm: {
                    span: 24,
                    offset: 0,
                },
            },
        };

        return (
            <Form onSubmit={this.handleSubmit}>
                <FormItem
                    {...formItemLayout}
                    label="标题"
                    hasFeedback
                >
                    {getFieldDecorator('title', {
                        rules: [{
                            required: true, message: '请输入一个标题！',
                        }],
                    })(
                        <Input />
                    )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="题目描述"
                    hasFeedback
                >
                    {getFieldDecorator('description', {
                        rules: [{
                            required: true, message: '请输入题目描述！',
                        }],
                    })(
                        <TextArea />
                    )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="时间限制(ms)"
                    hasFeedback
                >
                    {getFieldDecorator('time_limit', {
                        rules: [{
                            required: true, message: '请输入时间限制！',
                        }, {
                            validator: this.validateTimeLimit,
                        }],
                    })(
                        <Input />
                    )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="内存限制(kb)"
                    hasFeedback
                >
                    {getFieldDecorator('memory_limit', {
                        rules: [{
                            required: true, message: '请输入内存限制！',
                        }, {
                            validator: this.validateMemoryLimit,
                        }],
                    })(
                        <Input />
                    )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="评测方式"
                    hasFeedback
                >
                    {getFieldDecorator('judge_method', {
                        rules: [
                            { required: true, message: '请选择本题的评测方式' },
                        ],
                    })(
                        <Select placeholder="请选择本题的评测方式" onChange={(value) => {
                            console.log('Select change', value);
                            this.setState({
                                judge_method: parseInt(value),
                                language_radio: [],
                            });
                            this.props.form.setFieldsValue({
                                language: [],
                                code_lang: ''
                            })
                        }}>
                            <Option value="0">传统输入输出评测</Option>
                            <Option value="1">脚本评测</Option>
                        </Select>
                    )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="可使用语言"
                >
                    {getFieldDecorator('language', {
                        rules: [
                            { required: true, message: '请选择本题允许的语言' },
                        ],
                    })(
                        <Checkbox.Group onChange={(value) => {
                            console.log("radio change:", value);
                            const language_radio = value.map((id) => {
                                const mapper = {
                                    '1': 'C', '2': 'C++', '3': 'Javascript', '4': 'Python3',
                                };
                                return (<Radio value={id}>{mapper[id]}</Radio>);
                            });
                            this.setState({language_radio: language_radio});
                            this.props.form.setFieldsValue({
                                code_lang: '',
                            })
                        }} options={this.state.judge_method === 0 ?
                            [{label: 'C', value: '1'}, {label: 'C++', value: '2'}, {label: 'Python3', value: '4'}] :
                            [{label: 'Javascript', value: '3'}]
                        }/>
                    )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="是否公开"
                >
                    {getFieldDecorator('switch', {
                        valuePropName: 'checked',
                    })(
                        <Switch />
                    )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="标准程序使用语言"
                >
                    {getFieldDecorator('code_lang', {
                        rules: [
                            { required: true, message: '请选择您标准程序使用的语言'},
                        ],
                    })(
                        <Radio.Group>
                            {this.state.language_radio}
                        </Radio.Group>
                    )}
                </FormItem>
                {!this.props.isEditing &&
                <FormItem
                    {...formItemLayout}
                    label="上传标准程序"
                >
                    <div className="dropbox">
                        {getFieldDecorator('upload_code', {
                            // rules: [{required: true, message: '请上传标准程序'}],
                            valuePropName: 'code',
                            getValueFromEvent: this.normFile,
                        })(
                            <Upload.Dragger name="file" action={URL + api_list['upload_code']}
                                            multiple={false} onChange={(info) => {
                                let fileList = info.fileList;
                                console.log("upload_code:", fileList);
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

                                this.setState({upload_code: fileList[0]});
                            }}>
                                <p className="ant-upload-drag-icon">
                                    <Icon type="inbox"/>
                                </p>
                                <p className="ant-upload-text">点击这里或者将文件拖到这里</p>
                                <p className="ant-upload-hint">上传标准程序</p>
                            </Upload.Dragger>
                        )}
                    </div>
                </FormItem>
                }
                {!this.props.isEditing && this.state.judge_method === 0 &&
                <FormItem
                    {...formItemLayout}
                    label="上传测试数据"
                >
                    <div className="dropbox">
                        {getFieldDecorator('upload_case', {
                            // rules: [{required: true, message: '请上传测试数据'}],
                            valuePropName: 'cases',
                            getValueFromEvent: this.normFile,
                        })(
                            <Upload.Dragger name="file" action={URL + api_list['upload_case']}
                                            multiple={false} onChange={(info) => {
                                let fileList = info.fileList;
                                console.log("upload_case", fileList);
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

                                this.setState({upload_case: fileList[0]});
                            }}>
                                <p className="ant-upload-drag-icon">
                                    <Icon type="inbox"/>
                                </p>
                                <p className="ant-upload-text">点击这里或者将文件拖到这里</p>
                                <p className="ant-upload-hint">上传测试数据</p>
                            </Upload.Dragger>
                        )}
                    </div>
                </FormItem>
                }
                {!this.props.isEditing && this.state.judge_method === 1 &&
                <FormItem
                    {...formItemLayout}
                    label="上传测试脚本"
                >
                    <div className="dropbox">
                        {getFieldDecorator('upload_script', {
                            // rules: [{required: true, message: '请上传测试数据'}],
                            valuePropName: 'cases',
                            getValueFromEvent: this.normFile,
                        })(
                            <Upload.Dragger name="file" action={URL + api_list['upload_script']}
                                            multiple={false} onChange={(info) => {
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
                                this.setState({upload_script: fileList[0]});
                            }}>
                                <p className="ant-upload-drag-icon">
                                    <Icon type="inbox"/>
                                </p>
                                <p className="ant-upload-text">点击这里或者将文件拖到这里</p>
                                <p className="ant-upload-hint">上传测试数据</p>
                            </Upload.Dragger>
                        )}
                    </div>
                </FormItem>
                }
                <FormItem {...tailFormItemLayout} style={{textAlign: 'center'}}>
                    <Button type="primary" htmlType="submit">创建</Button>
                </FormItem>
            </Form>
        );
    }
}

// const WithRouteProblemCreateForm = withRouter(ProblemCreateForm);

const ProblemCreateForm = Form.create({
    onFieldsChange(props, changedFields) {
        props.onChange(changedFields);
    },
    mapPropsToFields(props) {
        return {
            title: Form.createFormField({
                ...props.title,
                value: props.title.value,
            }),
            description: Form.createFormField({
                ...props.description,
                value: props.description.value,
            }),
            time_limit: Form.createFormField({
                ...props.time_limit,
                value: props.time_limit.value,
            }),
            memory_limit: Form.createFormField({
                ...props.memory_limit,
                value: props.memory_limit.value,
            }),
            judge_method: Form.createFormField({
                ...props.judge_method,
                value: props.judge_method.value,
            }),
            language: Form.createFormField({
                ...props.language,
                value: props.language.value,
            }),
            switch: Form.createFormField({
                ...props.switch,
                value: props.switch.value,
            }),
            upload_code: Form.createFormField({
                ...props.upload_code,
                value: props.upload_code.value,
            }),
            upload_case: Form.createFormField({
                ...props.upload_case,
                value: props.upload_case.value,
            }),
            code_lang: Form.createFormField({
                ...props.code_lang,
                value: props.code_lang.value,
            }),
        };
    },
    onValuesChange(_, values) {
        console.log(values);
    },
})(withRouter(RegistrationForm));

class ProblemCreate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fields: {
                title: {
                    value: ''
                },
                description: {
                    value: ''
                },
                time_limit: {
                    value: ''
                },
                memory_limit: {
                    value: ''
                },
                judge_method: {
                    value: ''
                },
                language: {
                    value: ''
                },
                switch: {
                    value: ''
                },
                upload_code: {
                    value: ''
                },
                upload_case: {
                    value: ''
                },
                code_lang: {
                    value: ''
                }
            }
        }
    }
    handleFormChange = (changedFields) => {
        this.setState(({ fields }) => ({
            fields: { ...fields, ...changedFields },
        }));
    };
    render() {
        // console.log("handleFormChange", this.state);
        return (
            <Content style={{ padding: '0 50px' }}>
                <Breadcrumb style={{ margin: '16px 0' }}>
                    <Breadcrumb.Item><Link to="/ta">主页</Link></Breadcrumb.Item>
                    {!this.props.isEditing &&
                        <Breadcrumb.Item>创建题目</Breadcrumb.Item>
                    }
                    {this.props.isEditing &&
                        <Breadcrumb.Item>编辑题目</Breadcrumb.Item>
                    }
                </Breadcrumb>
                <div style={{ background: '#fff', padding: 24, minHeight: 280 }}>
                    <div style={{textAlign: 'center'}}>
                        {!this.props.isEditing &&
                            <h3>创建题目</h3>
                        }
                        {this.props.isEditing &&
                            <h3>编辑题目</h3>
                        }
                    </div>
                    <Row>
                        <Col span={12} offset={6}>
                            <ProblemCreateForm {...this.state.fields} onChange={this.handleFormChange}
                                               id={this.props.id} isEditing={this.props.isEditing} />
                        </Col>
                    </Row>
                </div>
            </Content>
        );
    }
}

export {ProblemCreate};