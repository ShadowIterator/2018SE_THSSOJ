import React, { Component } from 'react';

import {Card} from "@blueprintjs/core";

import {ajax_post} from "../ajax-utils/ajax-method";
import {api_list} from "../ajax-utils/api-manager";

import {Info} from './lesson-component';
import {Container} from "react-bootstrap";
import {withRouter, Link} from "react-router-dom";
import moment from 'moment';
import { Layout, Form, Input, Select, Button, message, Icon, List, Row, Col, DatePicker } from 'antd';
const {Content} = Layout;
const FormItem = Form.Item;

class AddNewNotice extends Component {
    constructor(props) {
        super(props);

        this.state = {
            title: "",
            content: ""
        };
        this.submitHandler = this.submitHandler.bind(this);
        this.changeTitle = this.changeTitle.bind(this);
        this.changeContent = this.changeContent.bind(this);
        this.submitCallback = this.submitCallback.bind(this);
    }

    submitHandler(e){
        e.preventDefault();
        e.stopPropagation();
        console.log("submitHandler");
        this.props.form.validateFields((err, fieldsValue) => {
            if (err) {
                return;
            }
            const data = {
                title: this.state.title,
                content: this.state.content,
                course_id: this.props.course_id,
                user_id: this.props.stu_id
            };
            console.log(data);
            ajax_post(api_list['create_notice'], data, this, this.submitCallback);
        });
    }

    submitCallback(that, result){
        console.log("submitCallback");
        if (result.data.code !== 0) {
            // alert("Creating new notice failed!");
            message.error("创建通知失败");
            return;
        }

        const callback = that.props.newnotice_callback;
        callback();
    }

    changeTitle(e){
        this.setState({
            title: e.target.value
        });
    }

    changeContent(e){
        this.setState({
            content: e.target.value
        });
    }

    render(){
        const { getFieldDecorator } = this.props.form;

        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 4 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 20 },
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
            <Card interactive={false} className="text-center">
            <Form onSubmit={this.submitHandler}>
                <FormItem
                    {...formItemLayout}
                    label="通知名称"
                    hasFeedback
                >
                    {getFieldDecorator('title', {
                        initialValue: this.state.title,
                        rules: [{
                            required: true, message: '请输入通知名！',
                        }],
                    })(
                        <Input onChange={this.changeTitle}/>
                    )}
                </FormItem>

                <FormItem
                    {...formItemLayout}
                    label="通知内容"
                    hasFeedback
                >
                    {getFieldDecorator('description', {
                        initialValue: this.state.content,
                        rules: [{
                            required: true, message: '请输入通知内容！',
                        }],
                    })(
                        <Input.TextArea onChange={this.changeContent}/>
                    )}
                </FormItem>
                <Button type="primary" htmlType="submit" style={{marginLeft:"10px", marginRight:"10px"}}>发布</Button>
                <Button onClick={this.props.cancel_callback} style={{marginLeft:"10px", marginRight:"10px"}}>放弃</Button>
            </Form>
            </Card>
        )
    }
}

const WrappedAddNewNotice = Form.create()(AddNewNotice);

class TANoticeList extends Component {
    render() {
        return(
            <Card interactive={false}>
                <Button icon="add" onClick={this.props.newNotice}>新建通知</Button>
                <Info infoitems={this.props.infoitems} />
            </Card>
        );
    }
}

class mTAHomeworkCard extends Component {
    handleClickId(id) {
        return (event) => {
            event.preventDefault();
            const id_param = '/' + id.toString();
            const homework_id = '/' + this.props.homework_id.toString();
            const pathname = '/problemdetail';
            const course_id = '/' + this.props.course_id.toString();
            this.props.history.push({
                pathname: pathname + id_param + homework_id + course_id,
            });
        }
    }

    render() {
        console.log(this.props)
        const ddl_str = moment.unix(this.props.deadline).format('YYYY年MM月DD日');
        return (
            <div style={{margin: '20px'}}>
                <List
                    header={
                        <Row type="flex" justify="space-around" align="middle">
                            <Col span={18}>
                                <h4>{this.props.name}</h4>
                            </Col>
                            <Col span={6} style={{textAlign: 'right'}}>
                                <span>截止日期：{ddl_str}</span>
                                <Button htmlType={'button'}
                                        onClick={()=>{
                                            // event.preventDefault();
                                            // event.stopPropagation();
                                            this.props.clickEditCallback(this.props.homework_id);
                                        }}>
                                    编辑
                                </Button>
                            </Col>
                        </Row>
                    }
                    bordered
                    dataSource={this.props.problems}
                    renderItem={item => {
                        console.log("check homework item", item);
                        return (
                            <List.Item key={item.id}>
                                {/*<List.Item.Meta title={<a onClick={this.handleClickId(item.id)}>{item.title}</a>} />*/}
                                <List.Item.Meta title={item.title} />
                                {/*{item.status.flag === 0 && <div>未完成</div>}*/}
                                {/*{item.status.flag===1 && <div>已完成</div>}*/}
                                {/*{item.status.flag===2 && <div>已批改</div>}*/}
                            </List.Item>);
                    }}
                />
            </div>
        )
    }
}
const TAHomeworkCard = withRouter(mTAHomeworkCard);

class TAHomeworkPanel extends Component {
    render() {
        return (
            <div>
                {this.props.homeworkitems.map((homework)=>(
                    <TAHomeworkCard name={homework.name}
                                    problems={this.props.problemitems.filter(item => homework.problems.indexOf(item.id) >= 0)}
                                    homework_id={homework.id}
                                    course_id={this.props.course_id}
                                    deadline={homework.deadline === undefined ? 0 : homework.deadline}
                                    clickEditCallback={this.props.clickEditCallback}
                    />
                ))}
            </div>
        )
    }
}

class mHomeworkForm extends Component {
    constructor(props) {
        super(props);
        if (this.props.homework_id === undefined) {
            this.state = {
                isEditing: false
            };
        } else
        {
            this.state = {
                isEditing: true
            };
        }
    }

    handleSubmit = (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.props.form.validateFields((err, fieldsValue) => {
            if (err) return;
            if (this.state.isEditing) {

                this.props.clickCallback();
            } else
            {
                const data = {
                    name: fieldsValue.name,
                    description: fieldsValue.description,
                    deadline: fieldsValue.deadline.unix(),
                    problems: [1],
                    course_id: this.props.course_id
                };
                console.log("create data", data);
                ajax_post(api_list['create_homework'], data, this, (err, result) => {
                    if (err){
                        message.error("新建作业失败");
                        return;
                    }
                    message.success("新建作业成功");
                    this.props.clickCallback();
                });

            }
        });
    };

    render() {
        const { getFieldDecorator } = this.props.form;

        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 4 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 20 },
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
        
        let button = this.state.isEditing ?
            (
                <Container>
                    <Button htmlType="submit"
                            style={{marginLeft: 5, marginRight: 5}}>
                        保存
                    </Button>
                    <Button style={{marginLeft: 5, marginRight: 5}} onClick={this.props.clickCallback}>
                        放弃
                    </Button>
                </Container>
            ) :
            (
                <Container>
                    <Button htmlType="submit"
                            style={{marginLeft: 5, marginRight: 5}}>
                        发布
                    </Button>
                    <Button style={{marginLeft: 5, marginRight: 5}} onClick={this.props.clickCallback}>
                        放弃
                    </Button>
                </Container>
            );

        return (
            <div>
                <Form onSubmit={this.handleSubmit}>
                    <FormItem
                        {...formItemLayout}
                        label="作业名称"
                        hasFeedback
                    >
                        {getFieldDecorator('name', {
                            rules: [{
                                required: true, message: '请输入作业名！',
                            }],
                        })(
                            <Input/>
                        )}
                    </FormItem>

                    <FormItem
                        {...formItemLayout}
                        label="作业描述"
                        hasFeedback
                    >
                        {getFieldDecorator('description', {
                            rules: [{
                                required: true, message: '请输入作业描述！',
                            }],
                        })(
                            <Input.TextArea/>
                        )}
                    </FormItem>

                    <FormItem
                        {...formItemLayout}
                        label="作业截止时间"
                        hasFeedback
                    >
                        {getFieldDecorator('deadline', {
                            rules: [{
                                required: true, message: '请选择作业截止时间！',
                            }],
                        })(
                            <DatePicker
                                showTime
                                format="YYYY-MM-DD HH:mm:ss"
                                placeholder="截止时间"
                                size="large"
                                style={{width: '100%', outline: 0}}
                                // onChange={(value) => {
                                //     this.props.form.setFieldsValue({
                                //         deadline:
                                //     );
                                // }}
                                // onOk={onOk}
                            />
                        )}
                    </FormItem>
                    {button}
                </Form>
            </div>
        );
    }
}

const CreateHomeworkForm = Form.create({
    onFieldsChange(props, changedFields) {
        props.onChange(changedFields);
    },
    onValuesChange(_, values) {
        console.log(values);
    },
    mapPropsToFields(props) {
        return {
            name: Form.createFormField({
                ...props.name,
                value: props.name.value,
            }),
            description: Form.createFormField({
                ...props.description,
                value: props.description.value,
            }),
            deadline: Form.createFormField({
                ...props.deadline,
                value: props.deadline.value,
            }),
            problems: Form.createFormField({
                ...props.problems,
                value: props.problems.value,
            })
        };
    }
})(withRouter(mHomeworkForm));


class TACreateHomework extends Component {
    constructor(props) {
        super(props);
        if (this.props.isEditing) {
            this.state = {
                fields: {
                    name: {
                        value: this.props.name
                    },
                    description: {
                        value: this.props.description
                    },
                    deadline: {
                        value: moment.unix(this.props.deadline)
                    },
                    problems: {
                        value: this.props.problems
                    },
                }
            }
        } else
        {
            this.state = {
                fields: {
                    name: {
                        value: ""
                    },
                    description: {
                        value: ""
                    },
                    deadline: {
                        value: ""
                    },
                    problems: {
                        value: []
                    },
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
        return (
            <div style={{ background: '#fff', padding: 24, minHeight: 280, textAlign: 'center' }}>
                <CreateHomeworkForm isEditing={this.props.isEditing}
                                    homework_id={this.props.homework_id}
                                    course_id={this.props.course_id}
                                    onChange={this.handleFormChange}
                                    clickCallback={this.props.clickCallback}
                                    {...this.state.fields}
                />
            </div>
        );
    }
}

export {WrappedAddNewNotice, TANoticeList, TAHomeworkPanel, TACreateHomework};
