import {URL, api_list} from "../ajax-utils/api-manager";
import Mock from 'mockjs'

let users = [{
    'id': 0,
    'username':'ta',
    'password':'1234',
    'email':'ta@123.com',
    'status':1,
    'gender':0,
    'realname':'teaching assistant',
    'student_id':2016011111,
    'student_courses':[],
    'TA_courses':[0, 1],
    'role':2,
},{
    'id': 1,
    'username':'student',
    'password':'1234',
    'email':'student@123.com',
    'status':0,
    'gender':-1,
    'student_id':-1,
    'realname':'',
    'validate_code':-1,
    'role':1,
    'student_courses':[0],
}];

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
let user_counter = 2;

Mock.mock(URL+api_list['login'],function(options) {
    const username = JSON.parse(options.body).username;
    const password = JSON.parse(options.body).password;
    for(let index in users) {
        const user = users[index];
        if(user['username']===username) {
            if(user['password']===password) {
                return {code:0, id:user['id'], role:user['role']};
            }
        }
    }
    return {code:1};
});

Mock.mock(URL+api_list['create'],function(options) {
    const data = JSON.parse(options.body);
    const username = data.username;
    for(let index in users) {
        const user = users[index];
        if(user['username']===username) {
            return {code:1};
        }
    }
    const password = data.password;
    const email = data.email;
    const user = {
        'id': user_counter,
        'username': username,
        'password': password,
        'email': email,
        'status':0,
        'gender':-1,
        'student_id':-1,
        'realname':'',
        'validate_code':-1,
        'role':1,
        'student_course':[],
    };
    user_counter += 1;
    users.push(user);
    return {code:0, id:user['id']};
});

Mock.mock(URL+api_list['logout'],{code:0});

Mock.mock(URL+api_list['query_user'],function(options) {
   const data = JSON.parse(options.body);
   const id = data.id;
   for(let index in users) {
       const user = users[index];
       if(user['id']===id) {
           return [user];
       }
   }
   return [];
});

Mock.mock(URL+api_list['activate_user'],function(options) {
   const data = JSON.parse(options.body);
   const id = data.id;
   const validate_code = data.validate_code;
   for(let index in users) {
       const user = users[index];
       if(user['id']===id) {
           if(user['validate_code']===validate_code) {
               user['status'] = 1;
               return {code:0};
           }
       }
   }
   return {code:1};
});

Mock.mock(URL+api_list['validate_user'],function(options) {
    const data = JSON.parse(options.body);
    const id = data.id;
    for(let index in users) {
        const user = users[index];
        if(user['id']===id) {
            user['validate_code'] = 123456;
            return {code:0};
        }
    }
    return {code:1};
});

Mock.mock(URL+api_list['update_user'],function(options) {
    const data = JSON.parse(options.body);
    const id = data.id;
    const auth_password = data.auth_password;
    for(let index in users) {
        const user = users[index];
        if(user['id'] === id && user['password'] === auth_password) {
            for(let key in data) {
                user[key] = data[key];
            }
            return {code:0};
        }
    }
    return {code:1};
});


Mock.mock(URL+api_list['create_notice'], function(options) {
    const data = JSON.parse(options.body);
    notice_counter += 1;
    const notice = {
      'id': notice_counter
      'title': data.title,
      'content': data.content,
      'user_id': data.user_id,
      'course_id': data.course_id
    };

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
    return {res}
    // return {code:1};
});