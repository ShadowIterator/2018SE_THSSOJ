import unittest
from tornado import gen
import tornado.testing
from basetestcase.basetestcase import BaseTestCase, async_aquire_db

class LockTestCase(BaseTestCase):

    async def try_to_dosth_in_db1(self, db, id):
        print('try to do 1')
        async with db.get_lock_object('judgestates', 1):
            obj = await db.getObjectOne('judgestates', id=id)
            obj['judged'] += 1
            print('1: ', obj)
            await db.saveObject('judgestates', obj)

    async def try_to_dosth_in_db2(self, db, id):
        print('try to do 2')
        async with db.get_lock_object('judgestates', 1):
            obj = await db.getObjectOne('judgestates', id=id)
            obj['judged'] += 1
            print('2: ', obj)
            await db.saveObject('judgestates', obj)

    async def prepare(self):
        await self.db.createObject('users', username = 'hfzzz', password = 'hfz', email = 'hfz@hfz.com')
        await self.db.createObject('users', username = 'hfzzz1', password = 'pwd', email = 'hfz@hfz.com', role = 1)

    @async_aquire_db
    async def test_lock1(self):
        await gen.multi([self.try_to_dosth_in_db1(self.db, 1), self.try_to_dosth_in_db2(self.db, 1)])
        obj = await self.db.getObjectOne('judgestates', id = 1)
        print('after op: ', obj)
        self.assertEqual(obj['judged'], 2)

    @async_aquire_db
    async def test_lock2(self):
        await gen.multi([self.try_to_dosth_in_db1(self.db, 1), self.try_to_dosth_in_db2(self.db, 2)])
        obj = await self.db.getObjectOne('judgestates', id = 1)
        print('after op: ', obj)
        self.assertEqual(obj['judged'], 1)

if __name__ == '__main__':
    tornado.testing.main()
