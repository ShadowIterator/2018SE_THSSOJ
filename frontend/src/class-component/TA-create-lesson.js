import React, {Component} from 'react';
import {Tag} from '@blueprintjs/core';
import {ajax_post} from "../ajax-utils/ajax-method";
import {api_list} from "../ajax-utils/api-manager";
import {withRouter, Link} from "react-router-dom"
import {Container} from "react-bootstrap"

import moment from "moment";

import { Layout, Breadcrumb, DatePicker, Table} from 'antd';
import { Form, Input, Select, Button, message } from 'antd';
const {Content} = Layout;
const {RangePicker} = DatePicker;
const FormItem = Form.Item;

// import "../mock/course-mock";
// import "../mock/auth-mock";
// import "../mock/notice-mock";
// import "../mock/homework-mock";
// import "../mock/problem-mock";

class mLessonList extends Component {
    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);

        if (this.props.course_id === undefined) {   // create
            this.state = {
                isCreating: true,
                tas: [],
                stus: []
            }
        } else  // edit
        {
            this.state = {
                isCreating: false,
                tas: [],
                stus: []
            };
        }
    }

    componentDidMount() {
        if (this.props.id === -1)
            return;
        if (this.props.course_id !== undefined)
            ajax_post(api_list['query_course'], {id:parseInt(this.props.course_id)}, this, mLessonList.editLesson_callback);
    }

    componentWillUpdate(nextProps) {
        if(nextProps.id===-1)
            return;
        if(nextProps.id !== this.props.id ||
            nextProps.course_id !== this.props.course_id ||
            nextProps.readOnly !== this.props.readOnly) {
            console.log('componentWillUpdate: ', nextProps)
            if (nextProps.course_id !== undefined) {
                this.state = {
                    isCreating: false,
                };
                ajax_post(api_list['query_course'], {id: parseInt(nextProps.course_id)}, this, mLessonList.editLesson_callback);
            }
        }
    }

    static editLesson_callback(that, result) {
        if (result.data.length === 0) {
            // alert("未找到课程");
            message.error("未找到课程");
            return;
        }
        console.log("editLesson_callback ", result);
        that.props.form.setFieldsValue({
            title: result.data[0].name,
            description: result.data[0].description,
            date: [moment.unix(result.data[0].start_time), moment.unix(result.data[0].end_time)],
        });
        for (let index in result.data[0].tas){
            ajax_post(api_list['query_user'], {id:result.data[0].tas[index]}, that, mLessonList.add_ta_callback);
        }
        for (let index in result.data[0].students){
            ajax_post(api_list['query_user'], {id:result.data[0].students[index]}, that, mLessonList.add_stu_callback)
        }
    }

    handleSubmit(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('handleSubmit');
        this.props.form.validateFields((err, fieldsValue) => {
            // console.log('error: ', err);
            // console.log('value: ', fieldsValue);
            if (err) {
                return;
            }
            if (this.props.readOnly) {
                this.props.clickModifyCallback();
            } else
            if (this.state.isCreating) {
                const data = {
                    name: fieldsValue.title,
                    description: fieldsValue.description,
                    tas: this.state.tas.map(ta => {
                        return ta.id;
                    }),
                    students: this.state.stus.map(stu => {
                        return stu.id;
                    }),
                    notices: [],
                    start_time: fieldsValue.date[0].unix(),
                    end_time: fieldsValue.date[1].unix(),
                };
                if (data.tas.indexOf(this.props.id) < 0) {
                    // console.log("this.props.id: ",this.props.id);
                    // console.log("data.tas: ",data.tas);
                    data.tas.push(this.props.id);
                }
                // console.log(data);
                ajax_post(api_list['create_course'], data, this, mLessonList.submit_callback);
            } else
            {
                const data = {
                    id: parseInt(this.props.course_id),
                    name: fieldsValue.title,
                    description: fieldsValue.description,
                    tas: this.state.tas.map(ta => {
                        return ta.id;
                    }),
                    students: this.state.stus.map(stu => {
                        return stu.id;
                    }),
                    start_time: fieldsValue.date[0].unix(),
                    end_time: fieldsValue.date[1].unix(),
                };
                // console.log(data);
                if (data.tas.indexOf(this.props.id) < 0) {
                    data.tas.push(this.props.id);
                }
                ajax_post(api_list['update_course'], data, this, mLessonList.submit_callback);
            }
        });

    }

    static submit_callback(that, result) {
        if (result.data.code !== 0) {
            message.error("暂存失败");
            return;
        }

        if (that.props.published !== true) {
            message.success("暂存成功");
            that.props.history.push('/ta');
        } else {
            message.success("保存成功");
            that.props.clickModifyCallback();
        }
    }

    static add_stu_callback(that, result) {
        if (result.data.length===0) {
            message.error("未找到该学生");
            return;
        }
        if (result.data[0].role !== 1) {
            message.error("未找到该学生");
            return;
        }
        let stus = that.state.stus;
        // let stu_tags = that.props.stu_tags.value;
        const tmp_name = result.data[0].username;
        if (stus.filter(item=>tmp_name===item.username).length > 0) {
            message.warning("你已经添加了学生 " + tmp_name);
            return;
        }
        // for (let stu of stus) {
        //     if(tmp_name === stu.username) {
        //         message.warning("你已经添加了学生 "+tmp_name);
        //         return;
        //     }
        // }
        stus.push(result.data[0]);
        that.setState({stus: stus});
        // that.props.form.setFieldsValue({
        //     stu_tags: stu_tags,
        //     newstu: ""
        // });
    }

    static add_ta_callback(that, result) {
        if (result.data.length===0) {
            message.error("未找到该助教");
            return;
        }
        if (result.data[0].role === 1) {
            message.error("未找到该助教");
            return;
        }
        let tas = that.state.tas;
        // let ta_tags = that.props.ta_tags.value;
        const tmp_name = result.data[0].username;
        if (tas.filter(item=>tmp_name===item.username).length > 0) {
            message.warning("你已经添加了助教 "+tmp_name);
            return;
        }
        // for(let ta of ta_tags) {
        //     if(tmp_name === ta.username) {
        //         message.warning("你已经添加了助教 "+tmp_name);
        //         return;
        //     }
        // }
        tas.push(result.data[0]);
        that.setState({tas: tas});
        // ta_tags.push({username: result.data[0].username, id: result.data[0].id});
        // that.props.form.setFieldsValue({
        //     ta_tags: ta_tags,
        //     newta: ""
        // });
    }
    render() {
        // const stutagElements = this.props.stu_tags.value.map(tag => {
        //     const onRemove = () => {
        //         this.props.form.setFieldsValue({
        //             stu_tags: this.props.stu_tags.value.filter(t => t.username !== tag.username)
        //         });
        //         // this.setState({stu_tags: this.state.stu_tags.filter(t => t.username !== tag.username)});
        //     };
        //     return (
        //         <Tag
        //             key={tag.username}
        //             large={true}
        //             onRemove={onRemove}
        //         >
        //             {tag.username}
        //         </Tag>
        //     );
        // });
        //
        // const tatagElements = this.props.ta_tags.value.map(tag => {
        //     const onRemove = () => {
        //         this.props.form.setFieldsValue({
        //             ta_tags: this.props.ta_tags.value.filter(t => t.username !== tag.username)
        //         });
        //         // this.setState({ta_tags: this.state.ta_tags.filter(t => t.username !== tag.username)});
        //     };
        //     return (
        //         <Tag
        //             key={tag.username}
        //             large={true}
        //             onRemove={onRemove}
        //         >
        //             {tag.username}
        //         </Tag>
        //     );
        // });

        const tas_table_columns = [
            {title: 'ID', dataIndex: 'id',width: 100, key: 'id'},
            {title: '用户名', dataIndex: 'username', key: 'username', width: 300},
            {title: '邮箱', dataIndex: 'email', key: 'email', width: 300},
            {title: 'Action', dataIndex: '', key: 'x', render: (text, record) => {
                    return (
                        <Button type="danger"
                                disabled={this.props.readOnly}
                                onClick={()=>{
                                            let tas = this.state.tas;
                                            this.setState({
                                                tas: tas.filter(item => record.id!==item.id)
                                            });
                                        }}
                        >
                            Delete
                        </Button>
                    );
                }},
        ];

        const stus_table_columns = [
            {title: 'ID', dataIndex: 'id',width: 100, key: 'id'},
            {title: '用户名', dataIndex: 'username', key: 'username', width: 200},
            {title: '姓名', dataIndex: 'realname', key: 'realname', width: 150},
            {title: '学号', dataIndex: 'student_id', key: 'student_id', width: 200},
            {title: '邮箱', dataIndex: 'email', key: 'email', width: 200},
            {title: 'Action', dataIndex: '', key: 'x', render: (text, record) => {
                    return (
                        <Button type="danger"
                                disabled={this.props.readOnly}
                                onClick={()=>{
                                            let stus = this.state.stus;
                                            this.setState({
                                                stus: stus.filter(item => record.id!==item.id)
                                            });
                                        }}
                        >
                            Delete
                        </Button>
                    );
                }},
        ];

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

        let submitButton;
        if (!this.props.readOnly) {
            if (this.props.published === true) {
                submitButton = (
                    <Container>
                        <Button style={{margin: '10px'}} type="primary" htmlType="submit">保存</Button>
                        <Button style={{margin: '10px'}} onClick={()=>{
                            this.props.clickModifyCallback();
                        }}> 放弃 </Button>
                    </Container>
                )
            } else {
                submitButton = (
                    <Container>
                        <Button style={{margin: '10px'}} type="primary" htmlType="submit">暂存</Button>
                        <Button style={{margin: '10px'}} onClick={() => {
                            this.props.history.push('/ta');
                        }}> 放弃 </Button>
                    </Container>
                )
            }
        } else
        {
            submitButton = (
                <Container>
                    <Button style={{margin: '10px'}} type="primary" htmlType="submit">修改</Button>
                </Container>
            )

        }

        return (
            <div>
            <Form onSubmit={this.handleSubmit}>
                <FormItem
                    {...formItemLayout}
                    label="课程名称"
                    hasFeedback
                >
                    {getFieldDecorator('title', {
                        rules: [{
                            required: true, message: '请输入课程名！',
                        }],
                    })(
                        <Input disabled={this.props.readOnly}/>
                    )}
                </FormItem>

                <FormItem
                    {...formItemLayout}
                    label="课程简介"
                    hasFeedback
                >
                    {getFieldDecorator('description', {
                        rules: [{
                            required: true, message: '请输入课程简介！',
                        }],
                    })(
                        <Input.TextArea disabled={this.props.readOnly}/>
                    )}
                </FormItem>

                <FormItem
                    {...formItemLayout}
                    label="起止时间"
                    hasFeedback
                >
                    {getFieldDecorator('date', {
                        rules: [{
                            required: true, message: '请选择课程有效时间段！',
                        }],
                    })(

                        <RangePicker size="large"
                                     style={{width: '100%', outline: 0}}
                                     placeholder={['开课时间','结课时间']}
                                     disabled={this.props.readOnly}
                                     disabledDate={(current)=>{
                                         return current && current < moment().startOf('day');
                                     }}
                        />
                    )}

                </FormItem>

                <FormItem
                    {...formItemLayout}
                    label="添加助教"
                    help="输入助教，回车添加"
                >
                    {getFieldDecorator('newta', {
                    })(
                        <Input disabled={this.props.readOnly}
                               onPressEnter={(event) => {
                                   event.preventDefault();
                                   event.stopPropagation();
                                   ajax_post(api_list['query_user'], {username: this.props.newta.value}, this, mLessonList.add_ta_callback);
                               }}/>
                    )}
                </FormItem>

                <FormItem
                    {...formItemLayout}
                    label="已添加助教"
                >
                    <Table dataSource={this.state.tas}
                           columns={tas_table_columns}
                           pagination={false}
                    />
                    {/*{getFieldDecorator('ta_tags', {*/}
                    {/*})(*/}
                        {/*<Container style={{paddingBottom: '10px'}}>*/}
                            {/*{tatagElements}*/}
                        {/*</Container>*/}
                    {/*)}*/}
                </FormItem>

                <FormItem
                    {...formItemLayout}
                    label="添加学生"
                    help="输入学生，回车添加"
                >
                    {getFieldDecorator('newstu', {
                        rules: [{
                            disabled: this.props.readOnly,
                        }]
                    })(
                        <Input disabled={this.props.readOnly}
                               onPressEnter={(event) => {
                                   event.preventDefault();
                                   event.stopPropagation();
                                   ajax_post(api_list['query_user'], {username: this.props.newstu.value}, this, mLessonList.add_stu_callback);
                               }}/>
                    )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="已添加学生"
                >
                    <Table dataSource={this.state.stus}
                           columns={stus_table_columns}
                           pagination={false}
                    />
                    {/*{getFieldDecorator('stu_tags', {*/}
                    {/*})(*/}
                        {/*<Container style={{paddingBottom: '10px'}}>*/}
                            {/*{stutagElements}*/}
                        {/*</Container>*/}
                    {/*)}*/}
                </FormItem>
                {submitButton}
            </Form>

            </div>
        )
    }
}

const CreateLessonForm = Form.create({
    onFieldsChange(props, changedFields) {
        props.onChange(changedFields);
    },
    onValuesChange(_, values) {
        console.log(values);
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
            date: Form.createFormField({
                ...props.date,
                value: props.date.value,
            }),
            newta: Form.createFormField({
                ...props.newta,
                value: props.newta.value,
            }),
            newstu: Form.createFormField({
                ...props.newstu,
                value: props.newstu.value,
            }),
            // ta_tags: Form.createFormField({
            //     ...props.ta_tags,
            //     value: props.ta_tags.value,
            // }),
            // stu_tags: Form.createFormField({
            //     ...props.stu_tags,
            //     value: props.stu_tags.value,
            // })
        };
    }
})(withRouter(mLessonList));

class CreateLesson extends Component {
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
                date: {
                    value: []
                },
                newta: {
                    value: ''
                },
                newstu: {
                    value: ''
                },
                // ta_tags: {
                //     value: []
                // },
                // stu_tags: {
                //     value: []
                // }
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
            <Content style={{ padding: '0 50px' }}>
                <Breadcrumb style={{ margin: '16px 0' }}>
                    <Breadcrumb.Item><Link to="/ta">主页</Link></Breadcrumb.Item>
                    <Breadcrumb.Item>创建课程</Breadcrumb.Item>
                </Breadcrumb>
                <div style={{ background: '#fff', padding: 24, minHeight: 280, textAlign: 'center' }}>
                    <h3>创建课程</h3>
                    <Container>
                        <CreateLessonForm username={this.props.username}
                                            id={this.props.id}
                                            readOnly={false}
                                            published={false}
                                            onChange={this.handleFormChange}
                                            {...this.state.fields}
                        />
                    </Container>
                </div>
            </Content>
        )
    }
}

class EditLesson extends Component {
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
                date: {
                    value: []
                },
                newta: {
                    value: ''
                },
                newstu: {
                    value: ''
                },
                // ta_tags: {
                //     value: []
                // },
                // stu_tags: {
                //     value: []
                // }
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
            <Content style={{ padding: '0 50px' }}>
                <Breadcrumb style={{ margin: '16px 0' }}>
                    <Breadcrumb.Item><Link to="/ta">主页</Link></Breadcrumb.Item>
                    <Breadcrumb.Item>编辑课程信息</Breadcrumb.Item>
                </Breadcrumb>
                <div style={{ background: '#fff', padding: 24, minHeight: 280, textAlign: 'center' }}>
                    <h3>编辑课程信息</h3>
                    <Container>
                        <CreateLessonForm course_id={this.props.lesson_id}
                                          username={this.props.username}
                                          id={this.props.id}
                                          readOnly={false}
                                          published={false}
                                          onChange={this.handleFormChange}
                                          {...this.state.fields}
                        />
                    </Container>
                </div>
            </Content>
        )
    }
}

class ShowLesson extends Component {
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
                date: {
                    value: []
                },
                newta: {
                    value: ''
                },
                newstu: {
                    value: ''
                },
                // ta_tags: {
                //     value: []
                // },
                // stu_tags: {
                //     value: []
                // }
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
                <Container>
                    <CreateLessonForm course_id={this.props.lesson_id}
                                      username={this.props.username}
                                      id={this.props.id}
                                      readOnly={true}
                                      published={true}
                                      onChange={this.handleFormChange}
                                      clickModifyCallback={this.props.clickModifyCallback}
                                      {...this.state.fields}
                    />
                </Container>
            </div>
        )
    }
}

class ModifyLesson extends Component {
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
                date: {
                    value: []
                },
                newta: {
                    value: ''
                },
                newstu: {
                    value: ''
                },
                // ta_tags: {
                //     value: []
                // },
                // stu_tags: {
                //     value: []
                // }
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
                <Container>
                    <CreateLessonForm course_id={this.props.lesson_id}
                                      username={this.props.username}
                                      id={this.props.id}
                                      readOnly={false}
                                      published={true}
                                      onChange={this.handleFormChange}
                                      clickModifyCallback={this.props.clickModifyCallback}
                                      {...this.state.fields}
                    />
                </Container>
            </div>
        )
    }
}

export {CreateLesson, EditLesson, ShowLesson, ModifyLesson};