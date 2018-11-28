import json
import aiopg
import bcrypt
# import markdown
import os.path
import psycopg2
import re
import tornado.escape
import tornado.httpserver
import tornado.ioloop
import tornado.locks
import tornado.options
import tornado.web
import unicodedata
from apis.base import maybe_create_tables, Application
from apis.user import *
from apis.record import *
from apis.notice import *
from apis.course import *
from apis.problem import *
from apis.homework import *

from tornado.options import define, options
from tornado.testing import AsyncHTTPTestCase
class siTest(AsyncHTTPTestCase):
    def get_app(self):
        return Application(None,
                          [
                              (r'/api/user/(.*)', APIUserHandler),
                              (r'/api/record/(.*)', APIRecordHandler),
                              (r'/api/notice/(.*)', APINoticeHandler),
                              (r'/api/course/(.*)', APICourseHandler),
                              (r'/api/problem/(.*)', APIProblemHandler),
                              (r'/api/homework/(.*)', APIHomeworkHandler),
                          ],
                          **{
                          'debug': True,
                          'cookie_secret':'ahsdfhksadjfhksjahfkashdf',
                          # 'xsrf_cookies':True,
                          })

    def test_hello(self):
        response = self.fetch('/api/notice/testhello', method = 'POST', body = '{"msg": "world"}')
        print(response.body)
        self.assertEqual(response.body, b'hello: APINoticeHandler world')
        response = self.fetch('/api/user/testhello', method = 'POST', body = '{"msg": "world"}')
        print(response.body)
        self.assertEqual(response.body, b'hello: APIUserHandler world')