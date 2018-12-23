#ifndef tinyjudger_configs_H
#define tinyjudger_configs_H
#include <cstring>
#include <string>
#include <iostream>
#include <vector>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <unistd.h>
#include <cstdio>
#include <cstdlib>

using namespace std;

enum ErrorCode{
	NoError = 0,
	getrlimitError,
	setrlimitError,
	openinputfileError,
	openoutputfileError,
	openerrorfileError,
	dup2Error,
	tracemeError,
	execvError,
};

enum JudgeResult{
	Accept = 0,
	WrongAnswer,
	RuntimeError,
	TimeLimitExceed,
	MemoryLimitExceed,
	OutputLimitExceed,
	DangerSystemCall,
	JudgementFailed,
	CompileError
};

std::string JudgeResult2string(JudgeResult jr);
void StringFormat(std::string&);

// const std::string default_checker_dir = "/home/ycdfwzy/github/2018SE_THSSOJ/judger/checkers";
const std::string default_checker_dir = "checkers/";

class runLimit{
public:
	int time;		// time in second
	int realTime;	// real time in second
	int memory;		// memory limit in MB
	int output;		// output limit in MB
	int stack;		// stack limit in MB

	runLimit(){
		time = 1;
		realTime = -1;
		memory = 128;
		output = 64;
		stack = 1024;
	}
	
	runLimit(int _time, int _memory, int _output, int _stack, int _realTime=-1)
			: time(_time), realTime(_realTime), memory(_memory), output(_output), stack(_stack)
			{}
};

class RunConfig{
public:
	std::string resultFileName;
	std::string inputFileName;
	std::string outputFileName;
	std::string errorFileName;
	std::string Lang;
	std::string path;
	runLimit lim;
	bool safe;

	std::vector<std::string> argArr;
};

class JudgerConfig{
public:
	std::string inputPre;
	std::string inputSuf;
	std::string outputPre;
	std::string outputSuf;
	std::string checker;
	std::string checkerDir;
	std::string Lang;
	std::string dataDir;
	std::string sourceDir;
	std::string source;
	bool builtinChecker;
	int time;
	int memory;
	int output;
	int ntests;
};

class ScriptConfig{
public:
	std::string outputpath;		//result output error files' full path
	std::string resultFileName;
	std::string outputFileName;
	std::string errorFileName;
	std::string workpath;
	runLimit lim;

	std::vector<std::string> argArr;
};

// HTMLConfig is the same as ScriptConfig temporarily
// I differ them to add more features for HTML in future
class HTMLConfig {
public:
	std::string outputpath;		//result output error files' full path
	std::string resultFileName;
	std::string outputFileName;
	std::string errorFileName;
	std::string workpath;
	runLimit lim;

	std::vector<std::string> argArr;
};

const runLimit defaultLimit(1, 128, 64, 1024);
const runLimit compileLimit(15, 512, 64, 1024);
const runLimit runningLimit(1, 256, 64, 1024);
const runLimit checkerLimit(2, 256, 64, 1024);
const runLimit htmlLimit(30, 1024, 1024, 1024);

class RunResult{
public:
	JudgeResult jr;
	int time;	// ms
	int memory;	// kb
	ErrorCode ec;

	RunResult(JudgeResult _jr, int _time = -1, int _memory = -1, int _ec = NoError)
				: jr(_jr), time(_time), memory(_memory){
					ec = (ErrorCode)_ec;
				}

	static RunResult fail_execute(){
		return RunResult(JudgementFailed);
	}

	static RunResult load(const char* file) {
		RunResult ret(JudgementFailed);
		FILE* fd = fopen(file, "r");
		int judgeresult, errorcode;

		if ( fd == NULL || fscanf(fd, "%d %d %d %d",
				&judgeresult, &ret.time, &ret.memory, &errorcode) < 4){
			if (fd != NULL)
				fclose(fd);
			return RunResult(JudgementFailed);
		}
		ret.jr = (JudgeResult)judgeresult;
		ret.ec = (ErrorCode)errorcode;
		fclose(fd);
		return ret;
	}

	bool dump(const char* file){
		FILE* fd = NULL;
		if (strcmp(file, "stdout") == 0){
			fd = stdout;
		} else
		if (strcmp(file, "stderr") == 0){
			fd = stderr;
		} else
		{
			fd = fopen(file, "w");
		}
		if (fd == NULL){
			return false;
		}

		fprintf(fd, "%d %d %d %d\n", this->jr, this->time, this->memory, this->ec);
		if (strcmp(file, "stdout") != 0 &&
			strcmp(file, "stderr") != 0){
			fclose(fd);
		}
		
		return true;
	}
};

class CompileResult{
public:
	JudgeResult jr;
	int time;	// ms
	int memory;	// kb
	bool success;
	std::string info;
	
	CompileResult(JudgeResult _jr, int _time = -1, int _memory = -1, bool _success=false)
					: jr(_jr), time(_time), memory(_memory), success(_success){
						this->info = "No Comment";
					}
	void getInfo(const char* file){
		char buf[512];
		int fd = open(file, O_RDONLY);
		if (fd < 0){
			std::cout << "open file failed when getInfo" << std::endl;
			return;
		}
		this->info = "";
		ssize_t len = read(fd, buf, 512);
		for (int i = 0 ; i < 500 && i < len; ++i)
			this->info += buf[i];
		if (len > 500){
			this->info += std::string("...");
		}
		close(fd);
	}
};

class CheckerResult{
public:
	JudgeResult jr;
	int time;	// ms
	int memory;	// kb
	bool success;
	std::string info;

	CheckerResult(JudgeResult _jr, int _time = -1, int _memory = -1, bool _success=false)
				: jr(_jr), time(_time), memory(_memory), success(_success){
		this->info = "No Comment";
	}

	void getInfo(const char* file){
		char buf[512];
		int fd = open(file, O_RDONLY);
		if (fd < 0){
			std::cout << "open file failed when getInfo" << std::endl;
			return;
		}
		this->info = "";
		ssize_t len = read(fd, buf, 512);
		for (int i = 0 ; i < 500 && i < len; ++i)
			this->info += buf[i];
		if (len > 500){
			this->info += std::string("...");
		}
		close(fd);
	}
};

class JudgerResult {
public:
	std::string result;
	int time;	// ms
	int memory;	// kb
	std::string info;

	JudgerResult(const std::string &res = "Accept", int _time = -1, int _memory = -1, const std::string& _info = "No Comment")
				: result(res), time(_time), memory(_memory), info(_info){}
};

class ScriptJudgerResult {
public:
	int score;
	int time;	// ms
	int memory;	// kb
	std::string info;

	ScriptJudgerResult(int _score = 0, int _time = -1, int _memory = -1, const std::string& _info = "No Comment")
						: score(_score), time(_time), memory(_memory), info(_info){}

	void load_Score_Info(const std::string& filename){
		char buf[512];
		int fd = open(filename.c_str(), O_RDONLY);
		if (fd < 0){
			std::cout << "open file failed when getInfo" << std::endl;
			return;
		}
		info = "";
		ssize_t len;
		do{
			len = read(fd, buf, 512);
			for (int i = 0 ; i < len; ++i)
				info += buf[i];
		} while(len > 0);

		if (info.length() > 0 && info[info.length() - 1] == '\n')
			info = info.substr(0, info.length()-1);

		int t = info.rfind('\n'), l = 0;
		// std::cout << "t=" << t << std::endl;
		// std::cout << "npos=" << std::string::npos << std::endl;
		// std::cout << "length=" << info.length() << std::endl;
		if (t++ == std::string::npos)
			return;
		bool flag = true;
		while (t+l < info.length()){
			if (info[t+l] < '0' || info[t+l] > '9') {
				flag = false;
				break;
			}
			l++;
		}
		if (flag){
			score = atoi(info.substr(t, l).c_str());
			info = info.substr(0, t);
		}
		if (info.length() > 500){
			info = info.substr(0, 500);
			info += std::string("...");
		}
	}

	void load_Info(const std::string& filename){
		char buf[512];
		int fd = open(filename.c_str(), O_RDONLY);
		if (fd < 0){
			std::cout << "open file failed when getInfo" << std::endl;
			return;
		}
		info = "";
		ssize_t len = read(fd, buf, 512);
		for (int i = 0 ; i < len; ++i)
			info += buf[i];
		if (info.length() > 500){
			info = info.substr(0, 500);
			info += std::string("...");
		}
	}
};

class HTMLJudgerResult {
public:
	int score;
	std::string info;

	HTMLJudgerResult(int _score = 0, const std::string& _info = "No Comment")
					: score(_score), info(_info){}

	void load_Score_Info(const std::string& filename){
		char buf[512];
		int fd = open(filename.c_str(), O_RDONLY);
		if (fd < 0){
			std::cout << "open file failed when getInfo" << std::endl;
			return;
		}
		info = "";
		ssize_t len;
		do{
			len = read(fd, buf, 512);
			for (int i = 0 ; i < len; ++i)
				info += buf[i];
		} while(len > 0);

		if (info.length() > 0 && info[info.length() - 1] == '\n')
			info = info.substr(0, info.length()-1);

		int t = info.rfind('\n'), l = 0;
		// std::cout << "t=" << t << std::endl;
		// std::cout << "npos=" << std::string::npos << std::endl;
		// std::cout << "length=" << info.length() << std::endl;
		if (t++ == std::string::npos)
			return;
		bool flag = true;
		while (t+l < info.length()){
			if (info[t+l] < '0' || info[t+l] > '9') {
				flag = false;
				break;
			}
			l++;
		}
		if (flag){
			score = atoi(info.substr(t, l).c_str());
			info = info.substr(0, t);
		}
		if (info.length() > 500){
			info = info.substr(0, 500);
			info += std::string("...");
		}
	}

	void load_Info(const std::string& filename){
		char buf[512];
		int fd = open(filename.c_str(), O_RDONLY);
		if (fd < 0){
			std::cout << "open file failed when getInfo" << std::endl;
			return;
		}
		info = "";
		ssize_t len = read(fd, buf, 512);
		for (int i = 0 ; i < len; ++i)
			info += buf[i];
		if (info.length() > 500){
			info = info.substr(0, 500);
			info += std::string("...");
		}
	}
};

#endif
