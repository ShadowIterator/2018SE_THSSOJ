#ifndef tinyjudger_scriptJudger_H
#define tinyjudger_scriptJudger_H
#include <string>
#include <cstring>
#include <algorithm>
#include <iostream>
#include <cstdlib>
#include <cstdarg>
#include <sstream>
#include <sys/types.h>
#include "configs.h"

using std::cout;
using std::endl;
using std::string;
using std::ostringstream;

int execute(const char* cmd){
	cout << "to Execute : \"" << string(cmd) << "\"" << endl;
	return system(cmd);
}

string Pathjoin(const string& path, const string& file){
	if (path.length() == 0 || (path.length() > 0 && path[path.length()-1] == '/')){
		return path+file;
	} else
	{
		return path+"/"+file;
	}
}

RunResult runExecutor(
	const RunConfig& rc){
	ostringstream oss;
	oss << "./executor" <<
		" --tl=" << rc.lim.time <<
		" --rtl=" << rc.lim.realTime <<
		" --ml=" << rc.lim.memory <<
		" --ol=" << rc.lim.output <<
		" --sl=" << rc.lim.stack <<
		" --in=" << rc.inputFileName <<
		" --out=" << rc.outputFileName <<
		" --err=" << rc.errorFileName <<
		" --res=" << rc.resultFileName <<
		" --work-path=" << rc.path <<
		" --type=" << rc.Lang;
	if (!rc.safe)
		oss << " --unsafe";
	for (int i = 0; i < rc.argArr.size(); ++i){
		oss << " " << rc.argArr[i];
	}
	if (execute(oss.str().c_str()) != 0){
		return RunResult::fail_execute();
	}

	// char curdir[2048];
	// getcwd(curdir, 2048);
	// chdir(rc.path.c_str());
	RunResult ret = RunResult::load(rc.resultFileName.c_str());
	// chdir(curdir);
	return ret;
}

ScriptJudgerResult runScript(const ScriptConfig& scriptConfig){
	RunConfig runConfig;
	runConfig.lim = scriptConfig.lim;
	runConfig.resultFileName = Pathjoin(scriptConfig.outputpath, scriptConfig.resultFileName);
	runConfig.outputFileName = Pathjoin(scriptConfig.outputpath, scriptConfig.outputFileName);
	runConfig.errorFileName = Pathjoin(scriptConfig.outputpath, scriptConfig.errorFileName);
	runConfig.inputFileName = "stdin";
	runConfig.Lang = "Script";
	runConfig.path = scriptConfig.workpath;
	runConfig.safe = true;
	runConfig.argArr.assign(scriptConfig.argArr.begin(), scriptConfig.argArr.end());

	RunResult res = runExecutor(runConfig);
	ScriptJudgerResult ret;
	ret.time = res.time;
	ret.memory = res.memory;
	if (res.jr == Accept && res.ec == NoError){
		ret.load_Score_Info(runConfig.outputFileName);
		ret.info = runConfig.outputFileName;
	} else
	{
		ret.load_Score_Info(runConfig.outputFileName);
		if (res.ec != NoError){
//			ret.load_Info(runConfig.errorFileName);
			ret.info = runConfig.errorFileName;
		}
	}
	return ret;
}

#endif