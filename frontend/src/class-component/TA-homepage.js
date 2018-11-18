import React, { Component } from 'react';
import {Row, Col, Container} from "react-bootstrap";
import {TALessonList, Info} from "./lesson-component";

const ZeroPadding = {
    "padding-left": 0,
    "padding-right": 0
};

class TAHomepageMiddle extends Component {
    render() {
        return (
            <Container fluid={true}>
                <Row>
                    <Col lg={3} style={ZeroPadding}>
                        <TALessonList/>
                    </Col>
                    <Col lg={9} style={ZeroPadding}>
                        <Info/>
                    </Col>
                </Row>
            </Container>
        )

    }
}

class TAHomepage extends Component {
    render() {
        return (
            <>
                <TAHomepageMiddle />
            </>
        )
    }
}

export {TAHomepage};