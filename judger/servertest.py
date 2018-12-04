import requests
import json
from urllib.parse import urlencode

# data = dict()
# data['TIME_LIMIT'] = 1
# data['MEMORY_LIMIT'] = 256
# data['OUTPUT_LIMIT'] = 64
# data['INPRE'] = 'test'
# data['INSUF'] = 'in'
# data['OUTPRE'] = 'test'
# data['OUTSUF'] = 'out'
# data['Language'] = 'Python'
# data['DATA_DIR'] = '/home/ycdfwzy/github/2018SE_THSSOJ/judger/test'
# data['CHECKER_DIR'] = '/home/ycdfwzy/github/2018SE_THSSOJ/judger/checkers'
# data['CHECKER'] = 'ncmp'
# data['NTESTS'] = 2
# data['SOURCE_FILE'] = 'test'
# data['SOURCE_DIR'] = '/home/ycdfwzy/github/2018SE_THSSOJ/judger/test'

# r = requests.post('http://localhost:12345/traditionaljudger', data = json.dumps(data))
# print(json.loads(r.text))

# data = dict()
# data['TIME_LIMIT'] = 1
# data['MEMORY_LIMIT'] = 256
# data['OUTPUT_LIMIT'] = 64
# data['WORK_PATH'] = '/home/ycdfwzy/github/2018SE_THSSOJ/judger/test/script/test-script'
# data['SOURCE_PATH'] = '/home/ycdfwzy/github/2018SE_THSSOJ/judger/test/script'
# data['SOURCE'] = 'index'
# data['OUTPUT_PATH'] = '/home/ycdfwzy/github/2018SE_THSSOJ/judger/test'
# data['OTHERS'] = '../fake-node/fake-node-linux test.js index.js'

# r = requests.post('http://localhost:12345/scriptjudger', data = json.dumps(data))
# print(json.loads(r.text))

data = dict()
data['SOURCE_PATH'] = '/home/ycdfwzy/'
data['SOURCE'] = '123'
data['SCRIPT_PATH'] = '/home/ycdfwzy/'
data['SCRIPT'] = '123'
r = requests.post('http://localhost:12345/htmljudger', data = json.dumps(data))
print(json.loads(r.text))
