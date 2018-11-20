const URL = 'http://localhost:8080';

const api_list = {
    'login': '/api/user/login',
    'logout': '/api/user/logout',
    'signup': '/api/user/create',
    'delete_user': '/api/user/delete',
    'query_user': '/api/user/query',
    'activate_user': '/api/user/activate',
    'validate_user': '/api/user/validate',
    'update_user': '/api/user/update',
    'create_course': '/api/course/create',
    'delete_course': '/api/course/delete',
    'update_course': '/api/course/update',
    'query_course': '/api/course/query',
    'addStudent_course': '/api/course/addStudent',
    'addTA_course': '/api/course/addTA',
    'deleteStudent_course': '/api/course/deleteStudent',
    'deleteTA_course': '/api/course/deleteTA',
    'create_homework': '/api/homework/create',
    'delete_homework': '/api/homework/delete',
    'update_homework': '/api/homework/update',
    'query_homework': '/api/homework/query',
    'create_notice': '/api/notice/create',
    'delete_notice': '/api/notice/delete',
    'update_notice': '/api/notice/update',
    'query_notice': '/api/notice/query',
    'create_record': '/api/record/create',
    'delete_record': '/api/record/delete',
    'query_record': '/api/record/query',
    'srcCode_record': '/api/record/srcCode',
    'create_problem': '/api/problem/create',
    'delete_problem': '/api/problem/delete',
    'update_problem': '/api/problem/update',
    'query_problem': '/api/problem/query'
};

export {URL, api_list}