# coding:utf-8
 
import tornado.web
import tornado.ioloop
 
class IndexHandler(tornado.web.RequestHandler):
    """主路由处理类"""
    def get(self):
        """对应http的get请求方式"""
        self.write({ 'status': 'In-Queue' })

    def post(self):
        """对应http的get请求方式"""
        self.write({ 'status': 'In-Queue' })
 
if __name__ == "__main__":
    app = tornado.web.Application([
        (r"/", IndexHandler),
    ])
    app.listen(12345)
    tornado.ioloop.IOLoop.current().start()

