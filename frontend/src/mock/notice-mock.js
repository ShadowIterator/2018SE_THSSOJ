import {URL, api_list} from "../ajax-utils/api-manager";
import Mock from 'mockjs'

let notices = [{
    'id': 0,
    'title': 'title 0',
    'content': 'content 0',
    'user_id': 0,
    'course_id': 0
},{
    'id': 1,
    'title': 'title 1',
    'content': 'content 1',
    'user_id': 1,
    'course_id': 1
}];

let notice_counter = 2;

Mock.mock(URL+api_list['create_notice'], function(options) {
    const data = JSON.parse(options.body);
    const notice = {
      'id': notice_counter,
      'title': data.title,
      'content': data.content,
      'user_id': data.user_id,
      'course_id': data.course_id
    };
    notice_counter += 1;

    notices.push(notice);
    return {code:0};
});

Mock.mock(URL+api_list['delete_notice'], function(options) {
    const data = JSON.parse(options.body);
    const id = data.id;
    for (let index in notices) {
        const notice = notices[index];
        if (notice.id === id){
          notices.splice(index, 1);
          return {code:0};
        }
    }
    return {code:1};
});

Mock.mock(URL+api_list['update_notice'], function(options){
    const data = JSON.parse(options.body);
    const id = data.id;
    for (let index in notices) {
        let notice = notices[index];
        if (notice.id === id){
          notice['title'] = data.title;
          notice['content'] = data.content;
          notice['user_id'] = data.user_id;
          notice['course_id'] = data.course_id;
          return {code:0};
        }
    }
    return {code:1};
});

Mock.mock(URL+api_list['query_notice'], function(options){
    const data = JSON.parse(options.body);
    const id = data.id;
    let res = [];
    for (let index in notices) {
        let notice = notices[index];
        if (notice.id === id){
          res.push(notice);
          // return {code:0};
        }
    }
    return res;
    // return {code:1};
});