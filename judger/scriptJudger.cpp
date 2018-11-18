#include "utils/parseArgs.h"
#include "utils/scriptJudger.h"
#include <fstream>

using namespace std;

int main(int argc, char** argv){
	ScriptConfig scriptConfig;
	script_judger_parse_args(argc, argv, scriptConfig);
	
	cout << "workpath=" << scriptConfig.workpath << endl;
	cout << "outputpath=" << scriptConfig.outputpath << endl;
	cout << "resultFileName=" << scriptConfig.resultFileName << endl;
	cout << "outputFileName=" << scriptConfig.outputFileName << endl;
	cout << "errorFileName=" << scriptConfig.errorFileName << endl;
	cout << "time=" << scriptConfig.lim.time << endl;
	cout << "memory=" << scriptConfig.lim.memory << endl;
	cout << "output=" << scriptConfig.lim.output << endl;

	ScriptJudgerResult scriptJudgerResult = runScript(scriptConfig);
	StringFormat(scriptJudgerResult.info);
	ofstream fout("result.json");
	fout << "{" << endl;
	fout << "    \"Score\" : " << scriptJudgerResult.score << "," << endl;
	fout << "    \"time\" : " << scriptJudgerResult.time << "," << endl;
	fout << "    \"memory\" : " << scriptJudgerResult.memory << "," << endl;
	fout << "    \"Info\" : \"" << scriptJudgerResult.info << "\"" << endl;
	fout << "}" << endl;
	fout.close();
	return 0;
}