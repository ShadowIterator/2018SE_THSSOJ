from apis.user import *
from apis.record import *
from apis.notice import *
from apis.course import *
from apis.problem import *
from apis.homework import *
from apis.upload import *

port = 8080
db_host = '127.0.0.1'
db_port = 5432
db_database = 'thssoj'
db_user = 'postgres'
db_password = 'zUY3Z2N2ul'

RoutineList = [
                  (r'/api/user/(.*)', APIUserHandler),
                  (r'/api/record/(.*)', APIRecordHandler),
                  (r'/api/notice/(.*)', APINoticeHandler),
                  (r'/api/course/(.*)', APICourseHandler),
                  (r'/api/problem/(.*)', APIProblemHandler),
                  (r'/api/homework/(.*)', APIHomeworkHandler),
                  (r'/api/upload/(.*)', APIUploadHandler),
              ]

AppConfig = {
              'debug': True,
              'cookie_secret':'ahsdfhksadjfhksjahfkashdf',
              # 'xsrf_cookies':True,
            }