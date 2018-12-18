from tornado import gen
from tornado.ioloop import IOLoop
from tornado.locks import Condition

condition = Condition()

async def waiter():
    print("I'll wait right here")
    await condition.wait()
    print("I'm done waiting")

async def notifier():
    print("About to notify")
    condition.notify()
    print("Done notifying")

async def runner():
    # Wait for waiter() and notifier() in parallel
    await gen.multi([waiter(), notifier()])

IOLoop.current().run_sync(runner)
# I'll wait right here