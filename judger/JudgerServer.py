import os, stat
import zipfile
import shutil
import subprocess
import time
import json
import requests
import tornado
import tornado.escape
import tornado.httpserver
import tornado.httpclient
import tornado.ioloop
import tornado.locks
import tornado.options
import tornado.web
import tornado.websocket
# from urllib.parse import urlencode, unquote
from tornado.options import define, options
from queue import Queue, Empty
from threading import Thread

define("port", default=12345, help="run on the given port", type=int)
define("domain", default="http://localhost:8000/", help="backend domain", type=str)
define("secret", default="no_secret", help="secret", type=str)

tradiQ = Queue()
scriptQ = Queue()

def handleTraditionalJudger():
	while (True):
		try:
			data = tradiQ.get(block = True, timeout = 1)
		except Empty:
			# print 'Thread' ,  self.Thread_id , 'end'
			continue
		params = ['./tradiJudger', \
					'--tl=%d' % data['TIME_LIMIT'],
					'--ml=%d' % data['MEMORY_LIMIT'],\
					'--ol=%d' % data['OUTPUT_LIMIT'],\
					'--in-pre=%s' % data['INPRE'],\
					'--in-suf=%s' % data['INSUF'],\
					'--out-pre=%s' % data['OUTPRE'],\
					'--out-suf=%s' % data['OUTSUF'],\
					'--Lang=%s' % data['Language'],\
					'--data-dir=%s' % data['DATA_DIR'],\
					'--checker=%s' % data['CHECKER'],\
					'--n-tests=%d' % data['NTESTS'],\
					'--source-name=%s' % data['SOURCE_FILE'],\
					'--source-dir=%s' % data['SOURCE_DIR']
					]
		if 'CHECKER_DIR' in data:
			params.append('--checker-dir=%s' % data['CHECKER_DIR'])
		record_id = data['id']

		tradiQ.task_done()
		
		judger = subprocess.Popen(params, stdout=subprocess.PIPE, close_fds=True)
		stdoutdata, stderrdata = judger.communicate()
		print('id: ', record_id, stdoutdata.decode())
		judger.wait()

		try:
			with open("result.json", "r", encoding='utf-8') as f:
				judgerResult = json.load(f)
				jr = { 'res': judgerResult,
						'id': record_id,
						'secret': options.secret
						}
				try:
					with open(jr['res']['Info'], "r", encoding='utf-8') as res:
						jr['res']['Info'] = res.read(500)
				except:
					pass
				judgerResult['id'] = record_id
				print(jr)
				requests.post(options.domain+'api/record/returnresult', data = json.dumps(jr))
				# print(r)
		except:
			judgerResult = {'res': {'Result': 'Judgement Failed',
							'time': 0,
							'memory': 0,
							'Info': "No comment",},
							'id': record_id,
							'secret': options.secret}
			requests.post(options.domain+'api/record/returnresult', data = json.dumps(judgerResult))
			print(judgerResult)
		# self.write({'Result': 'Judgement Failed',
		# 			'time': 0,
		# 			'memory': 0,
		# 			'Info': "No comment",
		# 			'id': record_id})

def chmodr(path, mode):
	for root, dirs, files in os.walk(path):
		for d in dirs:
			os.chmod(os.path.join(root, d), mode)
		for f in files:
			os.chmod(os.path.join(root, f), mode)

def handleScriptJudger():
	while (True):
		try:
			data = scriptQ.get(block = True, timeout = 1)
		except Empty:
			# print 'Thread' ,  self.Thread_id , 'end'
			continue

		record_id = data['id']
		sourceFile = os.path.join(data['SOURCE_PATH'], data['SOURCE']+'.code')
		targetFile = os.path.join(data['WORK_PATH'], 'index.js')
		if not os.path.isfile(sourceFile):
			judgerResult = {
							'res': {
										'Score': 0,
										'time': 0,
										'memory': 0,
										'Info': "No comment",
									},
							'id': record_id,
							'secret': options.secret
							}
			print(judgerResult)
			requests.post(options.domain+'api/record/returnresult', data = json.dumps(judgerResult))
			# self.write({'Score': 0,
			# 			'time': 0,
			# 			'memory': 0,
			# 			'Info': "No comment"})
			scriptQ.task_done()
			continue
		open(targetFile, "wb").write(open(sourceFile, "rb").read())

		if not ('OUTPUT_PATH' in data):
			data['OUTPUT_PATH'] = os.getcwd()
		params = ['./scriptJudger', \
					'--tl=%d' % data['TIME_LIMIT'],
					'--ml=%d' % data['MEMORY_LIMIT'],\
					'--ol=%d' % data['OUTPUT_LIMIT'],\
					'--work-path=%s' % data['WORK_PATH'],\
					'--outputpath=%s' % data['OUTPUT_PATH'], \
					data['OTHERS']
					]

		scriptQ.task_done()

		chmodr(data['WORK_PATH'], 0o777)

		judger = subprocess.Popen(params, stdout=subprocess.PIPE, close_fds=True)
		stdoutdata, stderrdata = judger.communicate()
		print(stdoutdata.decode())
		judger.wait()

		os.remove(targetFile)

		try:
			with open("result.json", "r", encoding='utf-8') as f:
				# judgerResult = json.dumps(json.load(f))
				judgerResult = json.load(f)
				jr = {'res': judgerResult,
					  'id': record_id,
					  'secret': options.secret}
				try:
					with open(jr['res']['Info'], "r", encoding='utf-8') as res:
						js['res']['Info'] = res.read(500)
				except:
					pass
				# print(jr)
				requests.post(options.domain+'api/record/returnresult', data = json.dumps(jr))
				# self.write(judgerResult)
		except:
			judgerResult = {
						'res':  {
									'Score': 0,
									'time': 0,
									'memory': 0,
									'Info': "No comment",
								},
						'id': record_id,
						'secret': options.secret
						}
			print(judgerResult)
			requests.post(options.domain+'api/record/returnresult', data = json.dumps(judgerResult))
			# self.write({'Score': 0,
			# 			'time': 0,
			# 			'memory': 0,
			# 			'Info': "No comment"})


class traditionalJudger(tornado.web.RequestHandler):
	def get(self):
		self.write('Hello')

	def post(self):
		data = json.loads(self.request.body.decode())
		tradiQ.put(data)
		self.write({ 'status': 'In-Queue' })
		# params = ['./tradiJudger', \
		# 			'--tl=%d' % data['TIME_LIMIT'],
		# 			'--ml=%d' % data['MEMORY_LIMIT'],\
		# 			'--ol=%d' % data['OUTPUT_LIMIT'],\
		# 			'--in-pre=%s' % data['INPRE'],\
		# 			'--in-suf=%s' % data['INSUF'],\
		# 			'--out-pre=%s' % data['OUTPRE'],\
		# 			'--out-suf=%s' % data['OUTSUF'],\
		# 			'--Lang=%s' % data['Language'],\
		# 			'--data-dir=%s' % data['DATA_DIR'],\
		# 			'--checker=%s' % data['CHECKER'],\
		# 			'--n-tests=%d' % data['NTESTS'],\
		# 			'--source-name=%s' % data['SOURCE_FILE'],\
		# 			'--source-dir=%s' % data['SOURCE_DIR']
		# 			]
		# if 'CHECKER_DIR' in data:
		# 	params.append('--checker-dir=%s' % data['CHECKER_DIR'])
		
		# judger = subprocess.Popen(params, stdout=subprocess.PIPE, close_fds=True)
		# stdoutdata, stderrdata = judger.communicate()
		# print(stdoutdata.decode())
		# judger.wait()

		# with open("result.json", "r", encoding='utf-8') as f:
		# 	judgerResult = json.dumps(json.load(f))
		# 	# print(judgerResult)
		# 	self.write(judgerResult)
		# 	return
		# self.write({'Result': 'Judgement Failed',
		# 			'time': 0,
		# 			'memory': 0,
		# 			'Info': "No comment"})

class scriptJudger(tornado.web.RequestHandler):
	def post(self):
		data = json.loads(self.request.body.decode())
		scriptQ.put(data)
		self.write({ 'status': 'In-Queue' })
		# sourceFile = os.path.join(data['SOURCE_PATH'], data['SOURCE']+'.code')
		# targetFile = os.path.join(data['WORK_PATH'], 'index.js')
		# if not os.path.isfile(sourceFile):
		# 	self.write({'Score': 0,
		# 				'time': 0,
		# 				'memory': 0,
		# 				'Info': "No comment"})
		# 	return
		# open(targetFile, "wb").write(open(sourceFile, "rb").read())

		# params = ['./scriptJudger', \
		# 			'--tl=%d' % data['TIME_LIMIT'],
		# 			'--ml=%d' % data['MEMORY_LIMIT'],\
		# 			'--ol=%d' % data['OUTPUT_LIMIT'],\
		# 			'--work-path=%s' % data['WORK_PATH'],\
		# 			'--outputpath=%s' % data['OUTPUT_PATH'], \
		# 			data['OTHERS']
		# 			]
		# judger = subprocess.Popen(params, stdout=subprocess.PIPE, close_fds=True)
		# stdoutdata, stderrdata = judger.communicate()
		# print(stdoutdata.decode())
		# judger.wait()

		# os.remove(targetFile)
		# with open("result.json", "r", encoding='utf-8') as f:
		# 	judgerResult = json.dumps(json.load(f))
		# 	# print(judgerResult)
		# 	self.write(judgerResult)
		# 	return
		# self.write({'Score': 0,
		# 			'time': 0,
		# 			'memory': 0,
		# 			'Info': "No comment"})

class htmlJudger(tornado.web.RequestHandler):
	def post(self):
		data = json.loads(self.request.body.decode())
		sourceFile = os.path.join(data['SOURCE_PATH'], data['SOURCE']+'.zip')
		if not os.path.isfile(sourceFile):
			self.write({'Score': 0,
						'Info': 'sourec file not found!'})
			return

		targetPath = os.path.join('/tmp', 'htmltest')
		zipf = zipfile.ZipFile(sourceFile, 'r')
		if os.path.exists(targetPath):
			if os.path.isfile(targetPath):
				os.remove(targetPath)
			else:
				shutil.rmtree(targetPath)
		os.mkdir(targetPath)
		for fname in zipf.namelist():
			zipf.extract(fname, targetPath)
		zipf.close()
		

		shutil.rmtree(targetPath)
		self.write({'Score': 0,
					'Info': 'No comment'})


class Application(tornado.web.Application):
	def __init__(self):
		handlers = [
			(r"/traditionaljudger", traditionalJudger),
			(r"/scriptjudger", scriptJudger),
			(r"/htmljudger", htmlJudger),
		]
		settings = dict(
			ui_modules = {},
			debug = True,
		)
		super(Application, self).__init__(handlers, **settings)

if __name__ == "__main__":
	# judger = subprocess.Popen( ['./tradiJudger', \
	# 							'--tl=1', '--ml=256', '--ol=64',\
	# 							'--in-pre=test', '--in-suf=in',\
	# 							'--out-pre=test', '--out-suf=out',\
	# 							'--Lang=C++',\
	# 							'--data-dir=/home/ycdfwzy/myworkspace/tinyjudger/test/',\
	# 							'--checker=ncmp',  '--n-tests=2', '--source-name=test',\
	# 							'--source-dir=/home/ycdfwzy/myworkspace/tinyjudger/test/'
	# 							], stdout=subprocess.PIPE)
	# time.sleep(1)
	# judger.kill()
	tornado.options.parse_command_line()
	options.parse_config_file('configs.py')
	# print(options.domain)

	traditioanlJudgerThread = Thread(target=handleTraditionalJudger)
	scriptJudgerJudgerThread = Thread(target=handleScriptJudger)
	traditioanlJudgerThread.start()
	scriptJudgerJudgerThread.start()
	app = Application()
	app.listen(options.port)
	tornado.ioloop.IOLoop.current().start()
