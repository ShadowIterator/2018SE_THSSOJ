from apis.user import *
from apis.record import *
from apis.notice import *
from apis.course import *
from apis.problem import *
from apis.homework import *
from apis.upload import *
from apis.download import *
from apis.judgestate import *
from apis.ratio import *

scriptJudgerAddr = 'http://localhost:12345/scriptjudger'
traditionalJudgerAddr = 'http://localhost:12345/traditionaljudger'
port = 8000
db_host = 'postgres'
db_port = 5432
create_superuser = False

RoutineList = [
                  (r'/api/user/(.*)', APIUserHandler),
                  (r'/api/record/(.*)', APIRecordHandler),
                  (r'/api/notice/(.*)', APINoticeHandler),
                  (r'/api/course/(.*)', APICourseHandler),
                  (r'/api/problem/(.*)', APIProblemHandler),
                  (r'/api/homework/(.*)', APIHomeworkHandler),
                  (r'/api/upload/(.*)', APIUploadHandler),
                  (r'/api/download/(.*)', APIDownloadHandler),
                  (r'/api/judgestate/(.*)', APIJudgestateHandler),
                  (r'/api/ratio/(.*)', APIRatioHandler),
              ]

AppConfig = {
              'debug': True,
              'cookie_secret':'ahsdfhksadjfhksjahfkashdf',
              # 'xsrf_cookies':True,
            }
