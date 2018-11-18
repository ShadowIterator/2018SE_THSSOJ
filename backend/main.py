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

from tornado.options import define, options

define("port", default=8000, help="run on the given port")
define("db_host", default="127.0.0.1", help="blog database host")
define("db_port", default=5432, help="blog database port")
define("db_database", default="tornado_dev", help="blog database name")
define("db_user", default="tornado", help="blog database user")
define("db_password", default="TtAsW1234", help="blog database password")



async def main():
    tornado.options.parse_command_line()
    print(options.db_host, options.db_port, options.db_user ,options.db_password, options.db_database)
    # Create the global connection pool.
    async with aiopg.create_pool(
            host=options.db_host,
            port=options.db_port,
            user=options.db_user,
            password=options.db_password,
            dbname=options.db_database) as db:
        await maybe_create_tables(db, 'sql/schema.sql')
        app = Application(db,
                          [
                              (r"/api/user/(.*)", APIUserHandler)
                          ],
                          **{
                          'debug': True,
                          'cookie_secret':'ahsdfhksadjfhksjahfkashdf',
                          # 'xsrf_cookies':True,
                          })
        app.listen(options.port)

        # In this demo the server will simply run until interrupted
        # with Ctrl-C, but if you want to shut down more gracefully,
        # call shutdown_event.set().
        shutdown_event = tornado.locks.Event()
        await shutdown_event.wait()


if __name__ == "__main__":
    tornado.ioloop.IOLoop.current().run_sync(main)
