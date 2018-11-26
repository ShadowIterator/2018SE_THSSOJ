import {URL, api_list} from "../ajax-utils/api-manager";
import Mock from 'mockjs'

let records = [{
    'id': 0,
    'user_id': 0,
    'submit_time': 1502550218,
    'problem_id': 0,
    'homework_id': 0,
    'result': 100,
    'consume_time': 10,
    'consume_memory': 200,
    'src_size': 3
},{
    'id': 1,
    'user_id': 1,
    'submit_time': 1512550218,
    'problem_id': 2,
    'homework_id': 1,
    'result': 20,
    'consume_time': 30,
    'consume_memory': 100,
    'src_size': 1
}];

let record_counter = 2;

Mock.mock(URL+api_list['create_record'], function(options) {
    const data = JSON.parse(options.body);
    const record = {
        'id': record_counter,
        'user_id': data.user_id,
        'submit_time': data.submit_time,
        'problem_id': data.problem_id,
        'homework_id': data.homework_id,
        'result': data.result,
        'consume_time': data.consume_time,
        'consume_memory': data.consume_memory,
        'src_size': data.src_size
    };
    record_counter += 1;

    records.push(record);
    return {code:0};
});

Mock.mock(URL+api_list['delete_record'], function(options) {
    const data = JSON.parse(options.body);
    const id = data.id;
    for (let index in records) {
        const record = records[index];
        if (record.id === id){
          records.splice(index, 1);
          return {code:0};
        }
    }
    return {code:1};
});

Mock.mock(URL+api_list['query_record'], function(options){
    const data = JSON.parse(options.body);
    const id = data.id;
    let res = [];
    for (let index in records) {
        let record = records[index];
        if (record.id === id){
          res.push(record);
        }
    }
    return res
});

Mock.mock(URL+api_list['srcCode_record'], function(options){
    const data = JSON.parse(options.body);
    const id = data.id;
    for (let index in records) {
        let record = records[index];
        if (record.id === id){
          // alert('Source code size = '+record.src_size+'bytes');
          return {src_code:"This is source code of record #"+id};
        }
    }
    // alert('Source code not found!');
    return {src_code:"Can't source code of record #"+id};
});