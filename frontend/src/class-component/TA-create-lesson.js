import React, {Component} from 'react';
import {HTMLSelect, Button, Dialog, Classes, Intent, AnchorButton, Tooltip, Tag} from '@blueprintjs/core';
import {AuthContext} from "../basic-component/auth-context";
import {ajax_get, ajax_post} from "../ajax-utils/ajax-method";
import {api_list} from "../ajax-utils/api-manager";
import {withRouter, Link} from "react-router-dom"
import {Card, Form, Container, Row, Col} from "react-bootstrap"

import { Layout, Breadcrumb } from 'antd';
const {Content} = Layout;


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
                ta_tags: []
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
                ta_tags: []
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
                notices: []
            };
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
                })
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
        // if(!that.state.isCreating) {
        //     ajax_post(api_list['addStudent_course'], {stu_id: result.data[0].id, course_id: that.props.course_id},
        //         that, that.add_stu_callback_not_create(result.data[0].username, result.data[0].id));
        // } else {
            stu_tags.push({username: result.data[0].username, id: result.data[0].id});
            that.setState({stu_tags: stu_tags});
            that.setState({newstu: ""});
        // }
    }

    // add_stu_callback_not_create(username, id) {
    //     return function(that, result) {
    //         if (result.data.code === 0) {
    //             let stu_tags = that.state.stu_tags;
    //             stu_tags.push({username: username, id: id});
    //             that.setState({stu_tags: stu_tags});
    //             that.setState({newstu: ""});
    //         }
    //     }
    // }

    static add_ta_callback(that, result) {
        if (result.data.length===0) {
            alert("ta Not found");
            return;
        }
        if (result.data[0].role === 1){
            alert("ta Not found");
            return;
        }
        // console.log(result.data);
        let ta_tags = that.state.ta_tags;
        const tmp_name = result.data[0].username;
        for(let stu of ta_tags) {
            if(tmp_name === stu.username) {
                alert("You already added TA "+tmp_name+".");
                return;
            }
        }
        // if(!that.state.isCreating) {
        //     ajax_post(api_list['addTA_course'], {ta_id: result.data[0].id, course_id: that.props.course_id},
        //         that, that.add_ta_callback_not_create(result.data[0].username, result.data[0].id));
        // } else {
            ta_tags.push({username: result.data[0].username, id: result.data[0].id});
            that.setState({ta_tags: ta_tags});
            that.setState({newta: ""});
        // }
    }

    // add_ta_callback_not_create(username, id) {
    //     return function(that, result) {
    //         if(result.data.code === 0) {
    //             let ta_tags = that.state.ta_tags;
    //             ta_tags.push({username:username, id:id});
    //             that.setState({ta_tags: ta_tags});
    //             that.setState({newta: ""});
    //         }
    //     }
    // }


    // deleteStudent_callback_closure(tag) {
    //     return function(that, result)
    //     {
    //         if (result.data.code === 0) {
    //             that.setState({stu_tags: that.state.stu_tags.filter(t => t.username !== tag.username)});
    //         } else {
    //             alert("Something went wrong while deleting "+tag.username);
    //         }
    //     }
    // }

    // deleteTA_callback_closure(tag) {
    //     return function(that, result)
    //     {
    //         if (result.data.code === 0) {
    //             that.setState({ta_tags: that.state.ta_tags.filter(t => t.username !== tag.username)});
    //         } else {
    //             alert("Something went wrong while deleting "+tag.username);
    //         }
    //     }
    // }

    render() {
        const stutagElements = this.state.stu_tags.map(tag => {
            const onRemove = () => {
                // if(!this.props.isCreating) {
                //     ajax_post(api_list['deleteStudent_course'], {stu_id: tag.id, course_id: this.props.course_id},
                //         this, this.deleteStudent_callback_closure(tag));
                // } else {
                    this.setState({stu_tags: this.state.stu_tags.filter(t => t.username !== tag.username)});
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
                <div style={{ background: '#fff', padding: 24, minHeight: 280 }}>
                    <Card className="text-center">
                        <Card.Body>
                            <Card.Title>创建课程</Card.Title>
                            <Container>
                                <LessonList/>
                            </Container>
                        </Card.Body>
                    </Card>
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
                <div style={{ background: '#fff', padding: 24, minHeight: 280 }}>
                    <Card className="text-center">
                        <Card.Body>
                            <Card.Title>编辑课程信息</Card.Title>
                            <Container>
                                <LessonList course_id={this.props.lesson_id}/>
                            </Container>
                        </Card.Body>
                    </Card>
                </div>
            </Content>
        )
    }
}

export {CreateLesson, EditLesson};