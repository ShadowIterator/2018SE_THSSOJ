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
	
class judgeHandler(tornado.web.RequestHandler):
	def get(self, code):
		de_code = str(bs.b64decode(code))

		str_code = de_code#toString(de_code)
		print(str_code)
		#print(bs.decodestring(code))
		self.write('ac.<br>' + str_code)
		
if __name__ == "__main__":
	
    app2 = tornado.web.Application([
#		(r"/", IndexHandler),
        (r'/judge/(.*)/', judgeHandler),
    ],template_path='templates',debug = True)
    app2.listen(8001)
	
    tornado.ioloop.IOLoop.current().start()
