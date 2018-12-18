import React, { Component } from 'react';
import {Card, Icon} from "@blueprintjs/core";
import {Modal} from "antd";

const ZeroPadding = {
    "padding-left": 0,
    "padding-right": 0
};

const Spacing = {
    // "margin-top": "20px",
    "margin-bottom": "40px"
};

const InfoItemStyle = {
    "margin-top": "6px",
    "margin-bottom": "6px"
};

class InfoItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visibile : false,
        }
    }
    render() {
        return (
            <div>
                <Card interactive={true} style={InfoItemStyle} onClick={() => {
                    this.setState({visible: true})
                }}>
                    {/*<h5>{this.props.title} <Tag key={this.props.type}>{this.props.type}</Tag></h5>*/}
                    <h5><Icon icon="notifications" /> {this.props.title}</h5>
                    <p>{this.props.content}</p>
                </Card>
                <Modal
                    title={this.props.title}
                    visible={this.state.visible}
                    onOk={() => {this.setState({visible: false})}}
                    onCancel={() => {this.setState({visible: false})}}
                >
                    <p>{this.props.content}</p>
                </Modal>
            </div>
        )
    }
}

class Info extends Component {
    render() {
        return (
            <div>
                {this.props.infoitems.map((item)=>(
                    <InfoItem title={item.title} content={item.content} type="通知" />
                ))}
            {this.props.infoitems.length === 0 && <h3>您当前没有通知</h3>}
            </div>
        )
    }
}


export {Info};
export {ZeroPadding, Spacing};