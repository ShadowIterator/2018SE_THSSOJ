# coding:utf-8

import tornado.web
import tornado.ioloop
import tornado.httpclient
import requests
import base64 as bs
import json
from db import BaseHandler


def toString(data):
    rtn = ''
    for x in data:
        rtn = rtn + chr(x)
    return rtn


class IndexHandler(tornado.web.RequestHandler):
    """主路由处理类"""

    def get(self):
        """对应http的get请求方式"""
        # self.write("Hello Itcast!")
        self.render('temp.html', test_info='hello, template')

    def post(self):
        # self.render('temp.html', test_info = self.get_body_argument('code'))
        code_content = self.get_body_argument('code')
        # client = tornado.httpclient.HTTPClient()
        # resp = client.fetch('http://127.0.0.1:8001/judge/helloxx/')
        b64code = bs.b64encode(code_content.encode('utf-8'))
        # b64code = bs.encodestring(code_content)
        print("request res")
        res = requests.get('http://127.0.0.1:8001/judge/' + toString(b64code) + '/')
        recv_code = res.text.replace('\r\n', '<br>')
        recv_code = recv_code.replace('\t', '&nbsp;&nbsp;&nbsp;&nbsp;')
        print(res.text)
        self.write(recv_code)

class APIUserHandler(BaseHandler):
    def __init__(self):
        self.getargs()
        self.super().__init__()

    def getargs(self):
        self.args = json.loads(self.request.body.decode() or '{}')

    def get(self, type): #detail

        if(type == 'query'):
            print('get query')
            s_ids = '(' + ','.join(map(str, self.args['idList'])) + ')'
            # for id in self.args['idList']:
            #     s_ids += str(id)
            res = self.query('SELECT * FROM users WHERE id IN %s', s_ids)
            self.write(json.dumps(res).encode())
        elif(type == 'create'):
            print('get create')
        elif(type == 'delete'):
            print('get delete')
        elif(type == 'modify'):
            print('get modify')



    def post(self, type):

        if(type == 'create'):
            print('post create')
            self.execute("INSERT INTO users (username, encodepass, name, studentid) VALUES (%s, %s, %s, %s)",
                         self.args['username'], self.args['encodepass'], self.args['name'], self.args['studentid'])
        elif(type == 'delete'):
            print('post delete')
            self.execute('DELETE FROM users where id = %d', self.args['id'])
        elif(type == 'modify'):
            print('post modify')
            # get attrs
            s_attrs = ''
            for key, value in self.args:
                s_attrs += key + ' = ' + str(value)
            self.execute('UPDATE users SET % WHERE id = %d', s_attrs, self.args['id'])



if __name__ == "__main__":
    app = tornado.web.Application([
        (r"/", IndexHandler),
        (r"/api/user/(.*)/", APIUserHandler)
    ], template_path='templates', debug=True)
    # app.listen(8000)
    http_server = tornado.httpserver.HTTPServer(app)
    # http_server.listen(8000)
    http_server.bind(8000)
    http_server.start(1)

    tornado.ioloop.IOLoop.current().start()
