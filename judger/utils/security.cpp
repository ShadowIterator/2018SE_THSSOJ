#include "security.h"
#include <set>

using namespace std;

// FileMode
#define READ 1
#define WRITE 2
#define STAT 3

set<string> readable;
set<string> writable;
set<string> statable;
int syscall_limit[1024];

int syscall_limit_default[][2] = {
	{__NR_read          , -1},
	{__NR_write         , -1},
	{__NR_readv         , -1},
	{__NR_writev        , -1},
	{__NR_open          , -1},
	{__NR_unlink        , -1},
	{__NR_close         , -1},
	{__NR_readlink      , -1},
	{__NR_openat        , -1},
	{__NR_unlinkat      , -1},
	{__NR_readlinkat    , -1},
	{__NR_stat          , -1},
	{__NR_fstat         , -1},
	{__NR_lstat         , -1},
	{__NR_lseek         , -1},
	{__NR_access        , -1},
	{__NR_dup           , -1},
	{__NR_dup2          , -1},
	{__NR_dup3          , -1},
	{__NR_ioctl         , -1},
	{__NR_fcntl         , -1},

	{__NR_mmap          , -1},
	{__NR_mprotect      , -1},
	{__NR_munmap        , -1},
	{__NR_brk           , -1},
	{__NR_mremap        , -1},
	{__NR_msync         , -1},
	{__NR_mincore       , -1},
	{__NR_madvise       , -1},
	
	{__NR_rt_sigaction  , -1},
	{__NR_rt_sigprocmask, -1},
	{__NR_rt_sigreturn  , -1},
	{__NR_rt_sigpending , -1},
	{__NR_sigaltstack   , -1},

	{__NR_getcwd        , -1},

	{__NR_exit          , -1},
	{__NR_exit_group    , -1},

	{__NR_arch_prctl    , -1},

	{__NR_gettimeofday  , -1},
	{__NR_getrlimit     , -1},
	{__NR_getrusage     , -1},
	{__NR_times         , -1},
	{__NR_time          , -1},
	{__NR_clock_gettime , -1},

	{__NR_restart_syscall, -1},

	{-1                 , -1}
};

const char *readable_default[] = {
	"/etc/ld.so.nohwcap",
	"/etc/ld.so.preload",
	"/etc/ld.so.cache",
	"/lib/x86_64-linux-gnu/",
	"/usr/lib/x86_64-linux-gnu/",
	"/usr/lib/locale/locale-archive",
	"/proc/self/exe",
	"/etc/timezone",
	"/usr/share/zoneinfo/",
	"/dev/random",
	"/dev/urandom",
	"/proc/meminfo",
	"/etc/localtime",
	NULL
};

string toStdPath(const string& path) {	// make path endwith '/'
	if (path.back() == '/')
		return path;
	return path+'/';
}

bool check_safe_syscall(pid_t p){
	struct user_regs_struct reg;
	ptrace(PTRACE_GETREGS, p, NULL, &reg);

	// get current instruction
	// but why use rip-2?
	int cur_instruction = ptrace(PTRACE_PEEKTEXT, p, reg.rip - 2, NULL) & 0xffff;
	if (cur_instruction != 0x050f) {
		// cout << "not a syscall" << endl;
		printf("not a syscall\n");
		return false;
	}

	int syscall = (int)reg.orig_rax;
	if (syscall < 0 || syscall >= 1024) {
		// cout << "unknown syscall " << syscall << endl;
		printf("unknown syscall %d\n", syscall);
		return false;
	}

	if (syscall == __NR_socket ||
		syscall == __NR_connect ||
		syscall == __NR_geteuid ||
		syscall == __NR_getuid) {

		reg.orig_rax += 1024;
		ptrace(PTRACE_SETREGS, p, NULL, &reg);

	} else
	if (syscall_limit[syscall]-- == 0) {
		// cout << "syscall limit " << syscall << endl;
		printf("syscall limit %d\n", syscall);
		return false;
	}

	return true;
}

void on_syscall_exit(pid_t p){
	struct user_regs_struct reg;
	ptrace(PTRACE_GETREGS, p, NULL, &reg);

	if ((long long int)reg.orig_rax >= 1024) {
		reg.orig_rax -= 1024;
		reg.rax = -EACCES;
		ptrace(PTRACE_SETREGS, p, NULL, &reg);
	}
}

string getParent(const string& path) {
	size_t p = path.rfind('/');
	if (p == string::npos) {
		return "";
	}
	return path.substr(0, p);
}

void add_permission(const string& file, int mode) {
	if (mode & READ) {
		readable.insert(file);
	}
	if (mode & WRITE) {
		writable.insert(file);
	}
	if (mode & STAT) {
		statable.insert(file);
	}
	for (string dir = getParent(file); !dir.empty(); dir = getParent(dir))
		statable.insert(dir);
}

void init_config(const RunConfig& runConfig) {
	printf("language = %s\n", runConfig.Lang.c_str());
	// printf("__NR_renameat = %d\n", __NR_renameat);
	// printf("__NR_renameat2 = %d\n", __NR_renameat2);
	// printf("__NR_prlimit64 = %d\n", __NR_prlimit64);

	// memset(syscall_limit, 0, sizeof(syscall_limit));
	for (int i = 0; syscall_limit_default[i][0] != -1; ++i) {
		syscall_limit[ syscall_limit_default[i][0] ] = syscall_limit_default[i][1];
	}

	for (int i = 0; readable_default[i] != NULL; ++i) {
		readable.insert(string(readable_default[i]));
	}

	add_permission(toStdPath(runConfig.path), READ|STAT);
	// statable.insert( toStdPath(runConfig.path) );
	// readable.insert( toStdPath(runConfig.path) );

	// std::string resultFileName;
	// std::string inputFileName;
	// std::string outputFileName;
	// std::string errorFileName;
	add_permission(runConfig.resultFileName, WRITE);
	add_permission(runConfig.inputFileName, READ);
	add_permission(runConfig.outputFileName, WRITE);
	add_permission(runConfig.errorFileName, WRITE);

	// traditional test forbids fork new process
	if (runConfig.Lang != "Python" &&
		runConfig.Lang != "C" &&
		runConfig.Lang != "C++") {
		syscall_limit[__NR_clone          ] = -1;
		syscall_limit[__NR_fork           ] = -1;
		syscall_limit[__NR_vfork          ] = -1;
		syscall_limit[__NR_nanosleep      ] = -1;
		syscall_limit[__NR_execve         ] = -1;
	}

	if (runConfig.Lang == "Python") {
		syscall_limit[__NR_set_tid_address] = 1;
		syscall_limit[__NR_set_robust_list] = 1;
		syscall_limit[__NR_futex          ] = -1;

		syscall_limit[__NR_getdents       ] = -1;
		syscall_limit[__NR_getdents64     ] = -1;

		readable.insert("/usr/bin/python3.6");
		readable.insert("/usr/lib/python3.6/");
		readable.insert("/usr/lib/python3/");
		readable.insert("/usr/bin/lib/python3.6/");
		readable.insert("/usr/local/lib/python3.6/");
		readable.insert("/usr/bin/pyvenv.cfg");
		readable.insert("/usr/pyvenv.cfg");
		readable.insert("/usr/bin/Modules/");
		readable.insert("/usr/bin/pybuilddir.txt");
		readable.insert("/usr/lib/dist-python");

		statable.insert("/usr");
		statable.insert("/usr/bin");
		statable.insert("/usr/lib");
	}

	if (runConfig.Lang == "compiler") {
		syscall_limit[__NR_gettid         ] = -1;
		syscall_limit[__NR_set_tid_address] = -1;
		syscall_limit[__NR_set_robust_list] = -1;
		syscall_limit[__NR_futex          ] = -1;

		syscall_limit[__NR_getpid         ] = -1;
		syscall_limit[__NR_vfork          ] = -1;
		syscall_limit[__NR_fork           ] = -1;
		syscall_limit[__NR_clone          ] = -1;
		syscall_limit[__NR_execve         ] = -1;
		syscall_limit[__NR_wait4          ] = -1;

		syscall_limit[__NR_clock_gettime  ] = -1;
		syscall_limit[__NR_clock_getres   ] = -1;

		syscall_limit[__NR_setrlimit      ] = -1;
		syscall_limit[__NR_pipe           ] = -1;

		syscall_limit[__NR_getdents64     ] = -1;
		syscall_limit[__NR_getdents       ] = -1;

		syscall_limit[__NR_umask          ] = -1;
		syscall_limit[__NR_rename         ] = -1;
		syscall_limit[__NR_chmod          ] = -1;
		syscall_limit[__NR_mkdir          ] = -1;
		syscall_limit[__NR_prlimit64      ] = -1;
		syscall_limit[__NR_sysinfo        ] = -1;
		// syscall_limit[__NR_renameat       ] = -1;
		// syscall_limit[__NR_renameat2      ] = -1;

		syscall_limit[__NR_chdir          ] = -1;
		syscall_limit[__NR_fchdir         ] = -1;

		// syscall_limit[__NR_ftruncate      ] = -1; // for javac = =

		// syscall_limit[__NR_sched_getaffinity] = -1; // for javac = =
		// syscall_limit[__NR_sched_yield      ] = -1; // for javac = =

		// syscall_limit[__NR_uname          ] = -1; // for javac = =
		// syscall_limit[__NR_sysinfo        ] = -1; // for javac = =

		writable.insert("/tmp/");

		readable.insert(runConfig.path);
		writable.insert(runConfig.path + "/");

		// readable.insert(abspath(0, string(self_path) + "/../runtime") + "/");

		readable.insert("system_root");
		readable.insert("/usr/");
		readable.insert("/lib/");
		readable.insert("/lib64/");
		readable.insert("/bin/");
		readable.insert("/sbin/");

		readable.insert("/sys/devices/system/cpu/");
		readable.insert("/proc/");

		readable.insert("/etc/timezone");
		// readable.insert("/etc/fpc-2.6.2.cfg.d/");
		// readable.insert("/etc/fpc.cfg");

		statable.insert("/*");
	}
}