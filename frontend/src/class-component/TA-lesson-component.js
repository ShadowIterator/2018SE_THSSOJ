import React, { Component } from 'react';

import {Card} from "@blueprintjs/core";

import {ajax_post} from "../ajax-utils/ajax-method";
import {api_list} from "../ajax-utils/api-manager";

import {Info} from './lesson-component';
import {Container} from "react-bootstrap";
import {withRouter, Link} from "react-router-dom";
import moment from 'moment';
import { Layout, Form, Input, Select, Button, message, Icon, List, Row, Col, DatePicker, Table } from 'antd';
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
        ////console.log("submitHandler");
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
            ////console.log(data);
            ajax_post(api_list['create_notice'], data, this, this.submitCallback);
        });
    }

    submitCallback(that, result){
        ////console.log("submitCallback");
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
        return (
            <div style={{textAlign: 'center'}}>
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
            </div>
        )
    }
}

const WrappedAddNewNotice = Form.create()(AddNewNotice);

class TANoticeList extends Component {
    render() {
        return(
            <div>
                <Button icon="add" onClick={this.props.newNotice} style={{marginBottom: '10px'}}>新建通知</Button>
                <Info infoitems={this.props.infoitems} />
            </div>
        );
    }
}

class mTAHomeworkCard extends Component {
    render() {
        ////console.log(this.props);
        const problems = this.props.problems.sort((a, b) => {
            return a.id - b.id;
        });
        const ddl_str = moment.unix(this.props.deadline).format('YYYY年MM月DD日 HH:mm:ss');
        let ret;
        if (this.props.deadline >= moment().format('X')) {
            ret = (
                <div style={{margin: '20px'}}>
                    <List
                        size="small"
                        header={
                            <Row type="flex" justify="space-around" align="middle">
                                <Col span={18}>
                                    <h4>{this.props.name}</h4>
                                </Col>
                                <Col span={6} style={{textAlign: 'right'}}>
                                    <span style={{color: 'red'}}> 截止日期：{ddl_str}</span>
                                </Col>
                            </Row>
                        }
                        footer={
                            <Button htmlType={'button'}
                                    onClick={()=>{
                                        this.props.clickEditCallback(this.props.homework_id);
                                    }}>
                                编辑
                            </Button>
                        }
                        bordered
                        dataSource={problems}
                        renderItem={item => {
                            // //console.log("check homework item", item);
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
            );
        } else
        {
            const score_openess_text = ['发布成绩', '隐藏成绩'];
            const submitable_text = ['打开补交', '关闭补交'];
            ret = (
                <div style={{margin: '20px'}}>
                    <List
                        size="small"
                        header={
                            <Row type="flex" justify="space-around" align="middle">
                                <Col span={18} style={{textAlign: 'left'}}>
                                    <h4>{this.props.name}</h4>
                                </Col>
                                <Col span={6} style={{textAlign: 'right'}}>
                                    <span style={{color: 'red'}}>截止日期：{ddl_str}</span>
                                </Col>
                            </Row>
                        }
                        footer={
                            <Row type="flex" justify="space-around" align="middle">
                                <Col span={2} style={{textAlign: 'left'}}>
                                    <Button onClick={()=>{
                                        const data = {
                                            homework_id: this.props.homework_id,
                                            score_openness: 1-this.props.score_openess
                                        };
                                        ajax_post(api_list['scoreOpenness_homework'], data, this, (that, res)=>{
                                            if (res.data.code !== 0) {
                                                if (this.props.score_openess === 0)
                                                    message.error('发布成绩失败！');
                                                else
                                                    message.error('隐藏成绩失败！');
                                                return;
                                            }
                                            if (this.props.score_openess === 0)
                                                message.success('已发布成绩！');
                                            else
                                                message.success('已隐藏成绩！');
                                            this.props.refreshCallback(this.props.course_id);
                                        });
                                    }}>
                                        {score_openess_text[this.props.score_openess]}
                                    </Button>
                                </Col>
                                <Col span={2}>
                                    <Button onClick={()=>{
                                        const data = {
                                            homework_id: this.props.homework_id,
                                            submitable: 1-this.props.submitable
                                        };
                                        ajax_post(api_list['submitable_homework'], data, this, (that, res)=>{
                                            if (res.data.code !== 0) {
                                                if (this.props.submitable === 0)
                                                    message.error('打开补交失败！');
                                                else
                                                    message.error('关闭补交失败！');
                                                return;
                                            }
                                            if (this.props.submitable === 0)
                                                message.success('已打开补交！');
                                            else
                                                message.success('已关闭补交！');
                                            this.props.refreshCallback(this.props.course_id);
                                        });
                                    }}>
                                        {submitable_text[this.props.submitable]}
                                    </Button>
                                </Col>
                                <Col span={20}/>

                            </Row>
                        }
                        bordered
                        dataSource={problems}
                        renderItem={item => {
                            let judger_button;
                            if (item.judge_method === 2) {  // html judger
                                judger_button = (
                                    <Button onClick={()=> {
                                        this.props.history.push("/judgehtml/" +
                                                                this.props.course_id.toString() + "/" +
                                                                this.props.homework_id.toString() + "/" +
                                                                item.id.toString()
                                        );
                                    }}>
                                        开始评测
                                    </Button>
                                );
                            } else
                            if (item['judger_status'] == 0) {
                                judger_button = (
                                    <Button onClick={()=>{
                                        let data = {
                                            homework_id: this.props.homework_id,
                                            problem_id: item.id,
                                            course_id: this.props.course_id,
                                        };
                                        // //console.log('judge_all data', data);
                                        ajax_post(api_list['judge_all'], data, this, (that, result)=>{
                                            if (result.data.code !== 0) {
                                                message.error("开始评测失败");
                                                return;
                                            }
                                            message.success("已开始评测");
                                            this.props.refreshCallback(this.props.course_id);
                                        });
                                    }}>
                                        开始评测
                                    </Button>
                                );
                            } else
                            if (item['judger_status'] == 1) {
                                judger_button = (<Button disabled={true}>正在评测...</Button>);
                            } else
                            if (item['judger_status'] == 2) {
                                judger_button = (
                                    <Button onClick={()=>{
                                        let data = {
                                            homework_id: this.props.homework_id,
                                            problem_id: item.id,
                                            course_id: this.props.course_id
                                        };
                                        // //console.log('judge_all data', data);
                                        ajax_post(api_list['judge_all'], data, this, (that, result)=>{
                                            if (result.data.code !== 0) {
                                                message.error("开始评测失败");
                                                return;
                                            }
                                            message.success("已开始评测");
                                            this.props.refreshCallback(this.props.course_id);
                                        });
                                    }}>
                                        重新评测
                                    </Button>
                                );
                            }
                            return (
                                <List.Item key={item.id} actions={[<Button onClick={() => {
                                    this.props.history.push("/tajudge/" +
                                                            this.props.course_id.toString() + "/" +
                                                            this.props.homework_id.toString() + "/" +
                                                            item.id.toString()
                                                            );
                                }}>查看详情</Button>, (judger_button)]}>
                                    {/*<List.Item.Meta title={<a onClick={this.handleClickId(item.id)}>{item.title}</a>} />*/}
                                    <List.Item.Meta title={item.title} />
                                    {/*{item.status.flag === 0 && <div>未完成</div>}*/}
                                    {/*{item.status.flag===1 && <div>已完成</div>}*/}
                                    {/*{item.status.flag===2 && <div>已批改</div>}*/}
                                </List.Item>);
                        }}
                    />
                </div>
            );
        }
        return ret;
    }
}
const TAHomeworkCard = withRouter(mTAHomeworkCard);

class TAHomeworkPanel extends Component {
    render() {
        const homeworkitems = this.props.homeworkitems.sort((a, b) => {
            return a.deadline - b.deadline;
        });
        return (
            <div>
                {homeworkitems.map((homework)=>(
                    <TAHomeworkCard name={homework.name}
                                    problems={this.props.problemitems.filter(item => homework.problems.indexOf(item.id) >= 0)}
                                    homework_id={homework.id}
                                    course_id={this.props.course_id}
                                    deadline={homework.deadline === undefined ? 0 : homework.deadline}
                                    score_openess={homework.score_openness}
                                    submitable={homework.submitable}
                                    refreshCallback={this.props.refreshCallback}
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
                isEditing: false,
                newProb: '',
                problems: this.props.problems
            };
        } else
        {
            this.state = {
                isEditing: true,
                newProb: '',
                problems: this.props.problems
            };
        }
    }

    handleSubmit = (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.props.form.validateFields((err, fieldsValue) => {
            if (err) return;
            if (this.state.problems.length === 0) {
                message.error("请至少添加一道题目！");
                return;
            }
            if (this.state.isEditing) {
                const data = {
                    id: this.props.homework_id,
                    name: fieldsValue.name,
                    description: fieldsValue.description,
                    deadline: fieldsValue.deadline.unix(),
                    problems: this.state.problems.map(item=>{return item.id}),
                    course_id: this.props.course_id
                };
                ajax_post(api_list['update_homework'], data, this, (that, result) => {
                    if (result.data.code !== 0){
                        message.error("修改作业失败");
                        return;
                    }
                    message.success("修改作业成功");
                    this.props.clickCallback();
                });
            } else
            {
                const data = {
                    name: fieldsValue.name,
                    description: fieldsValue.description,
                    deadline: fieldsValue.deadline.unix(),
                    problems: this.state.problems.map(item=>{return item.id}),
                    course_id: this.props.course_id
                };
                // //console.log("create data", data);
                ajax_post(api_list['create_homework'], data, this, (that, result) => {
                    if (result.data.code !== 0){
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

        const table_columns = [
            {title: 'ID', dataIndex: 'id',width: 150, key: 'id'},
            {title: '题目名称', dataIndex: 'title', key: 'title', width: 300, render: (data)=>{return (<strong>{data}</strong>)}},
            {title: '测试方法', dataIndex: 'language', key: 'language', width: 300, render: (data)=>{
                    return <span>{data.map(lang=>{
                        switch(lang) {
                            case 1: return 'C;';
                            case 2: return 'C++;';
                            case 3: return 'Javascript;';
                            case 4: return 'Python3;';
                            default: return '未知语言';
                        }
                    })}</span>;
                }},
            {title: 'Action', dataIndex: '', key: 'x', render: (text, record) => {
                return (
                    <Button type="danger" onClick={()=>{
                        let problist = this.state.problems;
                        this.setState({
                            problems: problist.filter(item => record.id!==item.id)
                        });
                    }}>
                        Delete
                    </Button>
                );
                }},
        ];

        // //console.log("current day", moment().endOf('day'));

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
                                disabledDate={(current)=>{
                                    return current && current <= moment().startOf('day');
                                }}
                            />
                        )}
                    </FormItem>

                    <FormItem
                        {...formItemLayout}
                        label="新增题目"
                        hasFeedback
                    >
                        <Input value={this.state.newProb}
                               placeholder="输入题目ID，回车添加"
                               onChange={(event)=>{
                                   event.preventDefault();
                                   event.stopPropagation();
                                   // //console.log(event.target.value);
                                   // const num = parseInt(event.target.value);
                                   // if (Number.isNaN(num) || num < 0) {
                                   //     return {
                                   //         validateStatus: 'error',
                                   //         errorMsg: '请输入大于等于0的整数',
                                   //     }
                                   // }
                                   this.setState({
                                       newProb: event.target.value
                                   });
                                   // return {
                                   //     validateStatus: 'success',
                                   //     errorMsg: null,
                                   // }
                               }}
                               onPressEnter={(event)=>{
                                   event.preventDefault();
                                   event.stopPropagation();
                                   let newPronid = parseInt(this.state.newProb);
                                   if (isNaN(newPronid) || newPronid < 0) {
                                       message.error("请输入大于等于0的整数");
                                       return;
                                   }
                                   if (this.state.problems.filter(item=>item.id===newPronid).length > 0){
                                       message.error("题目已在列表中，请不要重复加题");
                                       return;
                                   }
                                   ajax_post(api_list['query_problem'], {id: newPronid}, this, (that, res) => {
                                       if (res.data.length === 0) {
                                           message.error("未找到该题目");
                                           return;
                                       }
                                       message.success("成功添加题目");
                                       let problist = that.state.problems;
                                       problist.push(res.data[0]);
                                       problist.sort((a, b)=>{
                                           return a.id - b.id;
                                       });
                                       that.setState({
                                           problems: problist,
                                           newProb: ""
                                       });
                                   });
                               }}
                        />
                    </FormItem>

                    <FormItem
                        {...formItemLayout}
                        label="题目列表"
                        hasFeedback
                    >
                        <Table dataSource={this.state.problems}
                               columns={table_columns}
                        />
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
        //console.log(values);
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
            // problems: Form.createFormField({
            //     ...props.problems,
            //     value: props.problems.value,
            // })
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
                    // problems: {
                    //     value: this.props.problems
                    // },
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
                    // problems: {
                    //     value: []
                    // },
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
        let problems = []
        if (this.props.isEditing) {
            problems = this.props.problems;
        }
        return (
            <div style={{ background: '#fff', padding: 24, minHeight: 280, textAlign: 'center' }}>
                <CreateHomeworkForm isEditing={this.props.isEditing}
                                    homework_id={this.props.homework_id}
                                    course_id={this.props.course_id}
                                    onChange={this.handleFormChange}
                                    clickCallback={this.props.clickCallback}
                                    problems={problems}
                                    {...this.state.fields}
                />
            </div>
        );
    }
}

export {WrappedAddNewNotice, TANoticeList, TAHomeworkPanel, TACreateHomework};
