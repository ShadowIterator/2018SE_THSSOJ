import unittest
import tornado.testing
import datetime
import time
from ..basetestcase.basetestcase import BaseTestCase, async_aquire_db
from ..apis.base import print_test, print_debug
from ..apis.base import Roles

class RecordTestCase(BaseTestCase):
    async def prepare(self):
        self.url = '/api/record'
        student1 = await self.db.createObject('users', username='hfz', password='4321', email='hfz@hfz.com', role=Roles.STUDENT)
        student2 = await self.db.createObject('users', username='nx', password='myq', role=Roles.STUDENT)
        ta1 = await self.db.createObject('users', username='zjl', password='ibtfy', email='sh@sina.com', role=Roles.TA, ta_courses=[1])
        ta2 = await self.db.createObject('users', username='wzy', password='9897', role=Roles.TA)
        # await self.db.createObject('users', username='admin', password='1234', email='hfz@hfz.com', role=Roles.ADMIN)

        await self.db.createObject('courses', name='泽学', tas=[ta1['id']], students=[student1['id']], status=1, homeworks=[1,2])
        await self.db.createObject('courses', name='母猪的产后护理', tas=[ta2['id']], students=[student2['id']], status=1, homeworks=[3])

        await self.db.createObject('problems', title='hfz111', openness=1, user_id=ta1['id'])
        await self.db.createObject('problems', title='hfzHTML', openness=0, user_id=ta1['id'])
        await self.db.createObject('problems', title='zsdjt', openness=1, user_id=ta2['id'])
        await self.db.createObject('problems', title='zsxjt', openness=0, user_id=ta2['id'])

        await self.db.createObject('homeworks',
                                   name='first',
                                   deadline=datetime.datetime.fromtimestamp(10000),
                                   problems=[1,2],
                                   course_id=1)
        await self.db.createObject('homeworks',
                                   name='second',
                                   deadline=datetime.datetime.fromtimestamp(10000),
                                   problems=[1, 2],
                                   course_id=1,
                                   score_openness=0
                                   )
        await self.db.createObject('homeworks',
                                   name='first',
                                   deadline=datetime.datetime.fromtimestamp(10000),
                                   problems=[1, 2],
                                   course_id=2,
                                   score_openness=0)

    @async_aquire_db
    async def test_create(self):
        uri = self.url+'/create'
        admin = await self.db.getObjectOne('users', username='admin')
        ta = await self.db.getObjectOne('users', username='zjl')
        # fail
        await self.login_object(ta)
        response = self.getbodyObject(await self.post_request(uri,
                                                              user_id=admin['id'],
                                                              problem_id=1))
        self.assertEqual(1, response['code'])
        await self.logout_object(ta)
        # pass
        await self.login_object(admin)
        response = self.getbodyObject(await self.post_request(uri,
                                                              user_id=admin['id'],
                                                              problem_id=1,
                                                              record_type=0))
        records = await self.db.getObject('records', user_id=admin['id'])
        self.assertEqual(0, response['code'])
        self.assertEqual(1, len(records))

    @async_aquire_db
    async def test_delete(self):
        uri = self.url + '/delete'
        admin = await self.db.getObjectOne('users', username='admin')
        ta = await self.db.getObjectOne('users', username='zjl')
        record = await self.db.createObject('records',
                                            record_type=0,
                                            user_id=ta['id'])
        # fail
        await self.login_object(ta)
        response = self.getbodyObject(await self.post_request(uri,
                                                              id=record['id']))
        left = await self.db.getObject('records',
                                       id=record['id'])
        self.assertEqual(1, len(left))
        self.assertEqual(1, response['code'])
        await self.logout_object(ta)
        # pass
        await self.login_object(admin)
        response = self.getbodyObject(await self.post_request(uri,
                                                              id=record['id']))
        left = await self.db.getObject('records',
                                       id=record['id'])
        self.assertEqual(0, response['code'])
        self.assertEqual(0, len(left))

    @async_aquire_db
    async def test_query(self):
        uri = self.url+'/query'
        admin = await self.db.getObjectOne('users', username='admin')
        ta = await self.db.getObjectOne('users', username='zjl')
        ta2 = await self.db.getObjectOne('users', username='wzy')
        problem1 = await self.db.getObjectOne('problems', title='hfz111')
        problem2 = await self.db.getObjectOne('problems', title='zsxjt')
        student = await self.db.getObjectOne('users', username='hfz')
        student2 = await self.db.getObjectOne('users', username='nx')

        record1 = await self.db.createObject('records',
                                             record_type=0,
                                             user_id=student['id'])

        record2 = await self.db.createObject('records',
                                             record_type=0,
                                             user_id=ta['id'])

        record3= await self.db.createObject('records',
                                             record_type=1,
                                             user_id=student['id'])

        record4 = await self.db.createObject('records',
                                             record_type=2,
                                             user_id=student['id'],
                                             problem_id=1,
                                             homework_id=1,
                                             score=100)

        record5 = await self.db.createObject('records',
                                             record_type=2,
                                             user_id=student['id'],
                                             problem_id=1,
                                             homework_id=2,
                                             time_consume=500,
                                             score=100,
                                             result=0)

        record6 = await self.db.createObject('records',
                                             record_type=3,
                                             user_id=ta['id'],
                                             problem_id=problem1['id'])

        record7 = await self.db.createObject('records',
                                             record_type=3,
                                             user_id=ta2['id'],
                                             problem_id=problem2['id'])

        record8 = await self.db.createObject('records',
                                             record_type=4,
                                             user_id=student2['id'],
                                             problem_id=2,
                                             homework_id=3,
                                             score=90)