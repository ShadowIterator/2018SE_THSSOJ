import React, { Component } from 'react';

import {Container, Col, Row} from 'react-bootstrap';

import {Info, StudentLessonList} from "./lesson-component";

import {ZeroPadding} from "./lesson-component";

class StudentHomepageMiddle extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <>
            <Container fluid>
                <Row>
                    <Col lg={3} style={ZeroPadding}>
                        <StudentLessonList />
                    </Col>
                    <Col style={ZeroPadding}>
                        <Info />
                    </Col>
                </Row>
            </Container>
            </>
        )
    }
}

class StudentHomepage extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <>
            <StudentHomepageMiddle />
            </>
        )
    }
}

export {StudentHomepage};