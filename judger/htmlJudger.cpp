#include "utils/htmlJudger.h"
#include "utils/parseArgs.h"
#include <fstream>

int main(int argc, char** argv) {
	HTMLConfig htmlConfig;
	html_judger_parse_args(argc, argv, htmlConfig);

	cout << "workpath=" << htmlConfig.workpath << endl;
	cout << "outputpath=" << htmlConfig.outputpath << endl;
	cout << "resultFileName=" << htmlConfig.resultFileName << endl;
	cout << "outputFileName=" << htmlConfig.outputFileName << endl;
	cout << "errorFileName=" << htmlConfig.errorFileName << endl;
	cout << "time=" << htmlConfig.lim.time << endl;
	cout << "memory=" << htmlConfig.lim.memory << endl;
	cout << "output=" << htmlConfig.lim.output << endl;

	HTMLJudgerResult htmlJudgerResult = runHtml(htmlConfig);
	StringFormat(htmlJudgerResult.info);

	ofstream fout("result.json");
	fout << "{" << endl;
	fout << "    \"Score\" : " << htmlJudgerResult.score << "," << endl;
	fout << "    \"Info\" : \"" << htmlJudgerResult.info << "\"" << endl;
	fout << "}" << endl;
	fout.close();

	return 0;
}