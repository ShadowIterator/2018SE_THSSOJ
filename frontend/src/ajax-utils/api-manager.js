const URL = 'http://127.0.0.1:8000';

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
};

export {URL, api_list}