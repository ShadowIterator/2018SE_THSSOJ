import {URL, api_list} from "../ajax-utils/api-manager";
import Mock from 'mockjs'
// import {Base64} from "../basic-component/base64";
import { Base64 } from 'js-base64';

let problems = [{
    'id': 0,
    'title': 'A+B',
    'description': '# A+B\n\n## 这是一个简单的a+b问题',
    'time_limit': 1000,
    'memery_limit': 128*1024,
    'judge_method': 0,
    'records': [],
    'openness': 0
},{
    'id': 1,
    'title': 'title 1',
    'description': 'description 1',
    'time_limit': 2000,
    'memery_limit': 64*1024,
    'judge_method': 1,
    'records': [],
    'openness': 0
},{
    'id': 2,
    'title': 'title 2',
    'description': 'description 2',
    'time_limit': 1000,
    'memery_limit': 128*1024,
    'judge_method': 0,
    'records': [],
    'openness': 0
},{
    'id': 3,
    'title': 'title 3',
    'description': 'description 3',
    'time_limit': 2000,
    'memery_limit': 64*1024,
    'judge_method': 1,
    'records': [],
    'openness': 0
}];

let problem_counter = 4;

Mock.mock(URL+api_list['create_problem'], function(options) {
    const data = JSON.parse(options.body);
    const problem = {
      'id': problem_counter,
      'title': data.title,
      'description': data.description,
      'time_limit': data.time_limit,
      'memery_limit': data.memery_limit,
      'judge_method': data.judge_method,
      'records': data.records,
      'openness': data.openness
    };
    problem_counter += 1;

    problems.push(problem);
    return {code:0};
});

Mock.mock(URL+api_list['delete_problem'], function(options) {
    const data = JSON.parse(options.body);
    const id = data.id;
    for (let index in problems) {
        const problem = problems[index];
        if (problem.id === id){
          problems.splice(index, 1);
          return {code:0};
        }
    }
    return {code:1};
});

Mock.mock(URL+api_list['update_problem'], function(options){
    const data = JSON.parse(options.body);
    const id = data.id;
    for (let index in problems) {
        let problem = problems[index];
        if (problem.id === id){
            for(let key in data) {
                problem[key] = data[key];
            }
            return {code:0};
        }
    }
    return {code:1};
});

Mock.mock(URL+api_list['query_problem'], function(options){
    const data = JSON.parse(options.body);
    const id = data.id;
    let res = [];
    for (let index in problems) {
        let problem = problems[index];
        if (problem.id === id){
            // problem.description = Base64.encode(problem.description);
            res.push(problem);
        }
    }
    return res;
});