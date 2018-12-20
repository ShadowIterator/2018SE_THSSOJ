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
    'modifypwd_user': '/api/user/modifypwd',
    'create_ta': '/api/user/createTA',

    'list_course': '/api/course/list',
    'create_course': '/api/course/create',
    'delete_course': '/api/course/delete',
    'update_course': '/api/course/update',
    'query_course': '/api/course/query',
    'add_course': '/api/course/addCourse',
    'addStudent_course': '/api/course/addStudent',
    'addTA_course': '/api/course/addTA',
    'deleteStudent_course': '/api/course/deleteStudent',
    'deleteTA_course': '/api/course/deleteTA',

    'list_homework': '/api/homework/list',
    'create_homework': '/api/homework/create',
    'delete_homework': '/api/homework/delete',
    'update_homework': '/api/homework/update',
    'query_homework': '/api/homework/query',
    'submitable_homework': '/api/homework/submitable',
    'scoreOpenness_homework': '/api/homework/scoreOpenness',

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
    'judger_info': '/api/record/judgerInfo',

    'list_problem': '/api/problem/list',
    'create_problem': '/api/problem/create',
    'delete_problem': '/api/problem/delete',
    'update_problem': '/api/problem/update',
    'query_problem': '/api/problem/query',
    'submit_problem': '/api/problem/submit',
    'judge_all': '/api/problem/judgeAll',
    'judge_one': '/api/problem/judge',
    'judge_html': '/api/problem/judgeHTML',
    'create_html': '/api/problem/createHTML',
    'search_problem': '/api/problem/search',

    'upload_code': '/api/upload/files',
    'upload_case': '/api/upload/files',
    'upload_script': '/api/upload/files',
    'upload_html': '/api/upload/files',

    'download_code': '/api/download/code',
    'download_data': '/api/download/data',
    'download_script': '/api/download/script',
    'download_html': '/api/download/html',

    'query_ratio': '/api/ratio/query',
    'query_judgestates': '/api/judgestate/query',
};

export {URL, api_list}