# import tornado.web
# import tornado.httpclient

# @tornado.web.asynchronous
# def test_push_data2():
#     client = tornado.httpclient.AsyncHTTPClient()

# 	data = {"data_test":"1"}
#     data_send = urllib.urlencode(data)

# 	url = "http://127.0.0.1:12345"

# 	response = client.fetch(url, method='POST', body=data_send, callback = test_push_data2_resp)

# def test_push_data2_resp(resp):
# 	print(resp)

# test_push_data2()
import requests
import json
from urllib.parse import urlencode

data = dict()
data['TIME_LIMIT'] = 1
data['MEMORY_LIMIT'] = 256
data['OUTPUT_LIMIT'] = 64
data['INPRE'] = 'test'
data['INSUF'] = 'in'
data['OUTPRE'] = 'test'
data['OUTSUF'] = 'out'
data['Language'] = 'C++'
data['DATA_DIR'] = '/home/ycdfwzy/github/2018SE_THSSOJ/judger/test'
data['CHECKER_DIR'] = '/home/ycdfwzy/github/2018SE_THSSOJ/judger/checkers'
data['CHECKER'] = 'ncmp'
data['NTESTS'] = 2
data['SOURCE_FILE'] = 'test'
data['SOURCE_DIR'] = '/home/ycdfwzy/github/2018SE_THSSOJ/judger/test'

r = requests.post('http://localhost:12345/traditionaljudger', data = json.dumps(data))
print(json.loads(r.text))

data = dict()
data['TIME_LIMIT'] = 1
data['MEMORY_LIMIT'] = 256
data['OUTPUT_LIMIT'] = 64
data['WORK_PATH'] = '/home/ycdfwzy/github/2018SE_THSSOJ/judger/test/script/test-script'
data['OUTPUT_PATH'] = '/home/ycdfwzy/github/2018SE_THSSOJ/judger/test'
data['OTHERS'] = '../fake-node/fake-node-linux test.js ../index.js'
r = requests.post('http://localhost:12345/scriptjudger', data = json.dumps(data))
print(json.loads(r.text))

# with open('test.json', 'r') as f:
# 	p = json.load(f)
# 	print(p['a'])