import {URL, api_list} from "../ajax-utils/api-manager";
import Mock from 'mockjs'

let problems = [{
    'id': 0,
    'title': 'title 0',
    'description': 'description 0',
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
}];

let problem_counter = 2;

Mock.mock(URL+api_list['create_problem'], function(options) {
    const data = JSON.parse(options.body);
    const problem = {
      'id': notice_counter,
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
          res.push(problem);
        }
    }
    return res;
});