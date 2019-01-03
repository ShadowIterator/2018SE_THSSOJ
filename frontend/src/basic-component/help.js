import React, {Component} from 'react';
import ReactMarkdown from '../../node_modules/react-markdown';
import { Layout, Menu, Breadcrumb } from 'antd';

const { Header, Content, Footer } = Layout;


class Help extends Component {
    description = "# 上传题目说明\n" +
        "\n" +
        "## 传统题目\n" +
        "\n" +
        "标程上传需要一个源文件，评测数据要求上传一个zip压缩包，目录如下：\n" +
        "\n" +
        "```\n" +
        "*.zip\n" +
        "|\n" +
        "|----config.json\n" +
        "|----<CHECKER>.cpp(如果<BUILTIN_CHECKER>为false)\n" +
        "|----<INPRE>0.<INSUF>\n" +
        "|----<OUTPRE>0.<OUTSUF>\n" +
        "|----<INPRE>1.<INSUF>\n" +
        "|----<OUTPRE>1.<OUTSUF>\n" +
        ".\n" +
        ".\n" +
        ".\n" +
        "|----<INPRE><NTESTS-1>.<INSUF>\n" +
        "|----<OUTPRE><NTESTS-1>.<OUTSUF>\n" +
        "```\n" +
        "\n" +
        "config.json中有以下几个字段：\n" +
        "\n" +
        "```json\n" +
        "{\n" +
        "    \"INPRE\": \"input_prefix\",    // 输入数据的文件名\n" +
        "    \"INSUF\": \"input_suffix\",    // 输入数据的文件后缀名\n" +
        "    \"OUTPRE\": \"output_prefix\",  // 输出数据的文件名\n" +
        "    \"OUTSUF\": \"output_suffix\",  // 输出数据的文件后缀名\n" +
        "    \"NTESTS\": 10,               // 测试数据的组数，注意：标号从0开始\n" +
        "    \"BUILTIN_CHECKER\": true,\t// 是否使用内置的checker\n" +
        "    \"CHECKER\": \"checker_name\",  // checker的名字\n" +
        "}\n" +
        "```\n" +
        "\n" +
        "其中，我们的checker使用了[这个](https://github.com/MikeMirzayanov/testlib/)开源项目的，其中内置了一些常用的checker，例如`ncmp`：比较两个有序32位有符号整数序列；`fcmp`：逐行比较两个文件；`dcmp`：比较两个double数据，紧缺到小数点后6位……如果`BUILTIN_CHECKER=true`，那么我们只要在`CHECKER`字段填上`ncmp`、`fcmp`或者其他内置测试就可以了；否则，助教需要自定义判分方式，那么他需要自己实现一个checker文件，将其命名为`<CHECKER>.cpp`，并放在config.json的同级目录下。checker的实现方法可以参考[这个](https://github.com/MikeMirzayanov/testlib/)开源项目中的说明。\n" +
        "\n" +
        "\n" +
        "\n" +
        "## 脚本评测\n" +
        "\n" +
        "标程需要上传一个JavaScript源码，评测脚本要求上传一个zip压缩包，目录如下：\n" +
        "\n" +
        "```\n" +
        "*.zip\n" +
        "|\n" +
        "|----judge.sh\n" +
        "|----test.js\n" +
        ".\n" +
        ".\n" +
        ".\n" +
        "```\n" +
        "\n" +
        "助教的评测脚本建议写在`test.js`中，评测的时候我们会把学生程序复制到当前目录下，并命名为`index.js`，所以不要在该目录下放名字为`index.js`的文件。\n" +
        "\n" +
        "评测的时候，会运行`/bin/bash ./judge.sh -r <ratio>`这个命令，所以助教需要在`judge.sh`中解析参数`<ratio>`，并且调用`test.js`来运行测试。\n" +
        "\n" +
        "**注意：**如果需要运行系统的node，在`sh`中请使用`/usr/bin/nodejs`命令，如果运行自行上传的`node`，可以使用相对路径。";
    render() {
        return (
            <Content style={{ padding: '0 50px' }}>
                <Breadcrumb style={{ margin: '16px 0' }}>
                    <Breadcrumb.Item>帮助</Breadcrumb.Item>
                </Breadcrumb>
                <div style={{ background: '#fff', padding: 24, minHeight: 280 }}>
                    <ReactMarkdown source={this.description} />
                </div>
            </Content>
        )
    }
}

export {Help};