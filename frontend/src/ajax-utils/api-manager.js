const URL = 'http://localhost:8080';

const api_list = {
    'login': '/api/user/login',
    'logout': '/api/user/logout',
    'signup': '/api/user/create',

    'list_user': '/api/user/list',
    'delete_user': '/api/user/delete',
    'query_user': '/api/user/query',
    'activate_user': '/api/user/activate',
    'validate_user': '/api/user/validate',
    'update_user': '/api/user/update',

    'list_course': '/api/course/list',
    'create_course': '/api/course/create',
    'delete_course': '/api/course/delete',
    'update_course': '/api/course/update',
    'query_course': '/api/course/query',
    'addStudent_course': '/api/course/addStudent',
    'addTA_course': '/api/course/addTA',
    'deleteStudent_course': '/api/course/deleteStudent',
    'deleteTA_course': '/api/course/deleteTA',

    'list_homework': '/api/homework/list',
    'create_homework': '/api/homework/create',
    'delete_homework': '/api/homework/delete',
    'update_homework': '/api/homework/update',
    'query_homework': '/api/homework/query',

    'list_notice': '/api/notice/list',
    'create_notice': '/api/notice/create',
    'delete_notice': '/api/notice/delete',
    'update_notice': '/api/notice/update',
    'query_notice': '/api/notice/query',

    'list_record': '/api/record/list',
    'create_record': '/api/record/create',
    'delete_record': '/api/record/delete',
    'query_record': '/api/record/query',
    'srcCode_record': '/api/record/srcCode',

    'list_problem': '/api/problem/list',
    'create_problem': '/api/problem/create',
    'delete_problem': '/api/problem/delete',
    'update_problem': '/api/problem/update',
    'query_problem': '/api/problem/query',
    'submit_problem': '/api/problem/submit',

    'upload_code': '/api/upload/files',
    'upload_case': '/api/upload/files',
    'upload_script': '/api/upload/files',
};

export {URL, api_list}