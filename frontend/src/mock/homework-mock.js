import {URL, api_list} from "../ajax-utils/api-manager";
import Mock from 'mockjs'

let homeworks = [{
    'id': 0,
    'name': 'homework 0',
    'description': 'description 0',
    'deadline': 1543550218,
    'problems': [0,1]
},{
    'id': 1,
    'name': 'homework 0',
    'description': 'description 0',
    'deadline': 1545550218,
    'problems': [2,3]
}];

let homework_counter = 2;

Mock.mock(URL+api_list['create_homework'], function(options) {
    const data = JSON.parse(options.body);
    const homework = {
      'id': homework_counter,
      'name': data.name,
      'description': data.description,
      'deadline': data.deadline,
      'problems': data.problems
    };
    homework_counter += 1;

    homeworks.push(homework);
    return {code:0};
});

Mock.mock(URL+api_list['delete_homework'], function(options) {
    const data = JSON.parse(options.body);
    const id = data.id;
    for (let index in homeworks) {
        const homework = homeworks[index];
        if (homework.id === id){
          homeworks.splice(index, 1);
          return {code:0};
        }
    }
    return {code:1};
});

Mock.mock(URL+api_list['update_homework'], function(options){
    const data = JSON.parse(options.body);
    const id = data.id;
    for (let index in homeworks) {
        let homework = homeworks[index];
        if (homework.id === id){
          homework['name'] = data.name;
          homework['description'] = data.description;
          homework['deadline'] = data.deadline;
          homework['problems'] = data.problems;
          return {code:0};
        }
    }
    return {code:1};
});

Mock.mock(URL+api_list['query_homework'], function(options){
    const data = JSON.parse(options.body);
    const id = data.id;
    let res = [];
    for (let index in homeworks) {
        let homework = homeworks[index];
        if (homework.id === id){
          res.push(homework);
          // return {code:0};
        }
    }
    return res
    // return {code:1};
});