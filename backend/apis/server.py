
from .base import *
from .user import *
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
        await maybe_create_tables(db)
        app = Application(db,
                          [
                              (r"/api/user/(.*)/", APIUserHandler)
                          ],
                          debug = True)
        app.listen(options.port)

        # In this demo the server will simply run until interrupted
        # with Ctrl-C, but if you want to shut down more gracefully,
        # call shutdown_event.set().
        shutdown_event = tornado.locks.Event()
        await shutdown_event.wait()


if __name__ == "__main__":
    tornado.ioloop.IOLoop.current().run_sync(main)
