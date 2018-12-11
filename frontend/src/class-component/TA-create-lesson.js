import React, {Component} from 'react';
import {Button, Tag} from '@blueprintjs/core';
import {ajax_post} from "../ajax-utils/ajax-method";
import {api_list} from "../ajax-utils/api-manager";
import {withRouter, Link} from "react-router-dom"
import {Form, Container, Row, Col} from "react-bootstrap"

import moment from "moment";

import { Layout, Breadcrumb, DatePicker } from 'antd';
const {Content} = Layout;
const {RangePicker} = DatePicker;


// import "../mock/course-mock";
// import "../mock/auth-mock";
// import "../mock/notice-mock";
// import "../mock/homework-mock";
// import "../mock/problem-mock";

class mLessonList extends Component {
    constructor(props) {
        super(props);
        this.changeTitle = this.changeTitle.bind(this);
        this.changeDescription = this.changeDescription.bind(this);
        this.changeNewstu = this.changeNewstu.bind(this);
        this.changeNewta = this.changeNewta.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

        if (this.props.course_id === undefined) {
            this.state = {
                isCreating: true,
                title: "",
                description: "",
                newstu: "",
                newta: "",
                stu_tags: [],
                ta_tags: [],
                date: [],
            }
        } else
        {
            console.log(this.props.course_id);
            this.state = {
                isCreating: false,
                title: "",
                description: "",
                newstu: "",
                newta: "",
                stu_tags: [],
                ta_tags: [],
                date: [],
            };
            ajax_post(api_list['query_course'], {id:parseInt(this.props.course_id)}, this, LessonList.editLesson_callback);
        }
    }

    static editLesson_callback(that, result) {
        if (result.data.length === 0) {
            alert("未找到课程");
            return;
        }
        that.setState({
            title: result.data[0].name,
            description: result.data[0].description,
            date: [moment.unix(result.data[0].start_time), moment.unix(result.data[0].end_time)],
        });
        for (let index in result.data[0].tas){
            ajax_post(api_list['query_user'], {id:result.data[0].tas[index]}, that, LessonList.add_ta_callback);
        }
        for (let index in result.data[0].students){
            ajax_post(api_list['query_user'], {id:result.data[0].students[index]}, that, LessonList.add_stu_callback)
        }
    }

    handleSubmit(e) {
        e.preventDefault();
        e.stopPropagation();
        if (this.state.isCreating) {
            const data = {
                name: this.state.title,
                description: this.state.description,
                tas: this.state.ta_tags.map(ta => {
                    return ta.id;
                }),
                students: this.state.stu_tags.map(stu => {
                    return stu.id;
                }),
                notices: [],
                start_time: this.state.date[0].unix(),
                end_time: this.state.date[1].unix(),
            };
            if(!(this.props.id in data.tas)) {
                data.tas.push(this.props.id);
            }
            console.log(data);
            ajax_post(api_list['create_course'], data, this, LessonList.submit_callback);
        } else
        {
            const data = {
                id: parseInt(this.props.course_id),
                name: this.state.title,
                description: this.state.description,
                tas: this.state.ta_tags.map(ta => {
                    return ta.id;
                }),
                students: this.state.stu_tags.map(stu => {
                    return stu.id;
                }),
                start_time: this.state.date[0].unix(),
                end_time: this.state.date[1].unix(),
            };
            console.log(data);
            ajax_post(api_list['update_course'], data, this, LessonList.submit_callback);
        }
    }

    static submit_callback(that, result) {
        if (result.data.code !== 0){
            alert('暂存失败');
            return;
        }
        that.props.history.push('/ta');
    }

    changeTitle(e) {
        e.preventDefault();
        e.stopPropagation();
        this.setState({title: e.target.value});
    }

    changeDescription(e) {
        e.preventDefault();
        e.stopPropagation();
        this.setState({description: e.target.value});
    }

    changeNewstu(e) {
        e.preventDefault();
        e.stopPropagation();
        this.setState({newstu: e.target.value});
    }

    changeNewta(e) {
        e.preventDefault();
        e.stopPropagation();
        this.setState({newta: e.target.value});
    }

    static add_stu_callback(that, result) {
        if (result.data.length===0) {
            alert("stu Not found");
            return;
        }
        if (result.data[0].role !== 1){
            alert("stu Not found");
            return;
        }
        // console.log(result.data);
        let stu_tags = that.state.stu_tags;
        const tmp_name = result.data[0].username;
        for(let stu of stu_tags) {
            if(tmp_name === stu.username) {
                alert("You already added student "+tmp_name+".");
                return;
            }
        }
        stu_tags.push({username: result.data[0].username, id: result.data[0].id});
        that.setState({stu_tags: stu_tags});
        that.setState({newstu: ""});
    }

    static add_ta_callback(that, result) {
        if (result.data.length===0) {
            alert("ta Not found");
            return;
        }
        if (result.data[0].role === 1){
            alert("ta Not found");
            return;
        }
        let ta_tags = that.state.ta_tags;
        const tmp_name = result.data[0].username;
        for(let stu of ta_tags) {
            if(tmp_name === stu.username) {
                alert("You already added TA "+tmp_name+".");
                return;
            }
        }
        ta_tags.push({username: result.data[0].username, id: result.data[0].id});
        that.setState({ta_tags: ta_tags});
        that.setState({newta: ""});
    }
    render() {
        const stutagElements = this.state.stu_tags.map(tag => {
            const onRemove = () => {
                this.setState({stu_tags: this.state.stu_tags.filter(t => t.username !== tag.username)});
            };
            return (
                <Tag
                    key={tag.username}
                    large={true}
                    onRemove={onRemove}
                >
                    {tag.username}
                </Tag>
            );
        });

        const tatagElements = this.state.ta_tags.map(tag => {
            const onRemove = () => {
                // if(!this.state.isCreating) {
                //     ajax_post(api_list['deleteTA_course'], {ta_id: tag.id, course_id: this.props.course_id},
                //         this, this.deleteTA_callback_closure(tag));
                // } else {
                    this.setState({ta_tags: this.state.ta_tags.filter(t => t.username !== tag.username)});
                // }
            };
            return (
                <Tag
                    key={tag.username}
                    large={true}
                    onRemove={onRemove}
                >
                    {tag.username}
                </Tag>
            );
        });

        return (
            <div>
            <Form onSubmit={this.handleSubmit}>
                <Form.Group as={Row} controlId="title">
                    <Form.Label column lg="2">课程名称</Form.Label>
                    <Col lg="10">
                        <Form.Control value={this.state.title} onChange={this.changeTitle} />
                    </Col>
                </Form.Group>
                <Form.Group as={Row} controlId="description">
                    <Form.Label column lg="2">课程简介</Form.Label>
                    <Col lg="10">
                        <Form.Control as="textarea" value={this.state.description} onChange={this.changeDescription} />
                    </Col>
                </Form.Group>
                <Form.Group as={Row} controlId="data">
                    <Form.Label column lg="2">起止时间</Form.Label>
                    <Col lg="10">
                        <RangePicker value={this.state.date}
                                     size="large"
                                     style={{width: '100%', outline: 0}}
                                     placeholder={['开课时间','结课时间']}
                                     onChange={(date) => {
                                        console.log(date);
                                        this.setState({date: date});
                        }}/>
                    </Col>
                </Form.Group>
                <Form.Group as={Row} controlId="tas">
                    <Form.Label column lg="2">添加助教</Form.Label>
                    <Col lg="8">
                        <Form.Control value={this.state.newta} onChange={this.changeNewta} />
                    </Col>
                    <Col lg="2">
                        <Button onClick={()=>{
                            ajax_post(api_list['query_user'], {username: this.state.newta}, this, LessonList.add_ta_callback);
                        }}>提交</Button>
                    </Col>
                </Form.Group>
                <Container style={{paddingBottom: '10px'}}>
                    {tatagElements}
                </Container>
                <Form.Group as={Row} controlId="students">
                    <Form.Label column lg="2">添加学生</Form.Label>
                    <Col lg="8">
                        <Form.Control value={this.state.newstu} onChange={this.changeNewstu} />
                    </Col>
                    <Col lg="2">
                        <Button onClick={()=>{
                            ajax_post(api_list['query_user'], {username: this.state.newstu}, this, LessonList.add_stu_callback);
                        }}>提交</Button>
                    </Col>
                </Form.Group>
                <Container style={{paddingBottom: '10px'}}>
                    {stutagElements}
                </Container>
                <Container>
                    <Button style={{margin: '10px'}} variant="primary" type="submit">暂存</Button>
                    <Button style={{margin: '10px'}} onClick={()=>{
                        this.props.history.push('/ta');
                    }}> 放弃 </Button>
                </Container>
            </Form>

            </div>
        )
    }
}

const LessonList = withRouter(mLessonList);

class CreateLesson extends Component {
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
                        <LessonList username={this.props.username} id={this.props.id}/>
                    </Container>
                </div>
            </Content>
        )
    }
}

class EditLesson extends Component {
    constructor(props) {
        super(props);
    }

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
                        <LessonList course_id={this.props.lesson_id}/>
                    </Container>
                </div>
            </Content>
        )
    }
}

export {CreateLesson, EditLesson};