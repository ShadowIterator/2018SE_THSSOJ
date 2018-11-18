# coding:utf-8
 
import tornado.web
import tornado.ioloop
import tornado.httpclient
import requests
import base64 as bs
 

def toString(data):
	rtn = ''
	for x in data:
		rtn = rtn + chr(x)
	return rtn
	
class IndexHandler(tornado.web.RequestHandler):
    """主路由处理类"""
    def get(self):
        """对应http的get请求方式"""
        #self.write("Hello Itcast!")
        self.render('temp.html', test_info = 'hello, template')
		
    def post(self):
        #self.render('temp.html', test_info = self.get_body_argument('code'))
        code_content = self.get_body_argument('code')
        #client = tornado.httpclient.HTTPClient()
        #resp = client.fetch('http://127.0.0.1:8001/judge/helloxx/')
        b64code = bs.b64encode(code_content.encode('utf-8'))
        #b64code = bs.encodestring(code_content)
        print("request res")
        res = requests.get('http://127.0.0.1:8001/judge/' + toString(b64code) + '/')
        recv_code = res.text.replace('\r\n', '<br>')
        recv_code = recv_code.replace('\t', '&nbsp;&nbsp;&nbsp;&nbsp;')
        print(res.text)
        self.write(recv_code)
		
if __name__ == "__main__":
    app = tornado.web.Application([
        (r"/", IndexHandler),
    ],template_path='templates',debug = True)
    #app.listen(8000)
    http_server = tornado.httpserver.HTTPServer(app) 
    #http_server.listen(8000)
    http_server.bind(8000)
    http_server.start(1)
	
    tornado.ioloop.IOLoop.current().start()
