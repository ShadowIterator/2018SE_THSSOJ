#include "security.h"
#include <set>

using namespace std;

// FileMode
#define READ 1
#define WRITE 2
#define STAT 3
typedef unsigned long long int reg_val_t;
const unsigned PATHMAX = 512;

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
	{__NR_getrandom      , -1},

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
	if (path.length() > 0 && path[path.length() - 1] == '/')
		return path;
	return path+'/';
}

string getParent(const string& path) {
	size_t p = path.rfind('/');
	if (p == string::npos) {
		return "";
	}
	return path.substr(0, p);
}

string getcwdp(pid_t p){
	char s[32];
	char cwd[PATHMAX+1];
	if (p == 0){
		sprintf(s, "/proc/self/cwd");
	} else
	{
		sprintf(s, "/proc/%lld/cwd", (long long int)p);
	}
	size_t sz = readlink(s, cwd, PATHMAX);
	if (sz == -1)
		return "";
	cwd[sz] = '\0';
	return cwd;
}
// todo: modify it for improvement
string abspath(pid_t pid, const string &path) {
	if (path.size() > PATHMAX) {
		return "";
	}
	if (path.empty()) {
		return path;
	} 
	string s;
	string b;
	size_t st;
	if (path[0] == '/') {
		s = "/";
		st = 1;
	} else {
		s = getcwdp(pid) + "/";
		st = 0;
	}
	for (size_t i = st; i < path.size(); i++) {
		b += path[i];
		if (path[i] == '/') {
			if (b == "../" && !s.empty()) {
				if (s == "./") {
					s = "../";
				} else if (s != "/") {
					size_t p = s.size() - 1;
					while (p > 0 && s[p - 1] != '/') {
						p--;
					}
					if (s.size() - p == 3 && s[p] == '.' && s[p + 1] == '.' && s[p + 2] == '/') {
						s += b;
					} else {
						s.resize(p);
					}
				}
			} else if (b != "./" && b != "/") {
				s += b;
			}
			b.clear();
		}
	}
	if (b == ".." && !s.empty()) {
		if (s == "./") {
			s = "..";
		} else if (s != "/") {
			size_t p = s.size() - 1;
			while (p > 0 && s[p - 1] != '/') {
				p--;
			}
			if (s.size() - p == 3 && s[p] == '.' && s[p + 1] == '.' && s[p + 2] == '/') {
				s += b;
			} else {
				s.resize(p);
			}
		}
	} else if (b != ".") {
		s += b;
	}
	if (s.size() >= 2 && s[s.size() - 1] == '/') {
		s.resize(s.size() - 1);
	}
	return s;
}

string read_string_from_regs(reg_val_t addr, pid_t pid) {
	char res[PATHMAX + 1], *ptr = res;
	while (ptr != res + PATHMAX) {
		*(reg_val_t*)ptr = ptrace(PTRACE_PEEKDATA, pid, addr, NULL);
		for (int i = 0; i < sizeof(reg_val_t); i++, ptr++, addr++) {
			if (*ptr == 0) {
				return res;
			}
		}
	}
	res[PATHMAX] = 0;
	return res;
}

string read_abspath_from_regs(reg_val_t addr, pid_t pid) {
	return abspath(pid, read_string_from_regs(addr, pid));
	// return read_string_from_regs(addr, pid);
}

string realpath(const string &path) {
	char real[PATH_MAX + 1] = {};
	if (realpath(path.c_str(), real) == NULL) {
		return "";
	}
	return real;
}

bool endWith(const string &str, const string &tail) {
	if (str.size() < tail.size())
		return false;
	return str.compare(str.size() - tail.size(), tail.size(), tail) == 0;
}
 
bool startWith(const string &str, const string &head) {
	return str.compare(0, head.size(), head) == 0;
}

bool in_able_set(const string& file, const set<string>& able_set) {
	if (file.length() > PATHMAX )
		return false;
	if (able_set.count(file) || able_set.count(file+"/"))
		return true;

	if (file.find("/...") != string::npos ||
		startWith(file, "...") ||
		endWith(file, "/..") ||
		file == ".." )
		return false;

	string path;
	int level = 0;
	for (path = getParent(file);
		!path.empty();
		level++, path = getParent(path)) {
		if (level == 1 && able_set.count(path+"/*"))
			return true;
		if (able_set.count(path+"/"))
			return true;
	}
	if (level == 1 && able_set.count("/*"))
		return true;

	if (able_set.count("/"))
		return true;
	return false;
}

bool is_writable_file(const string& file) {
	if (file == "/")
		return writable.count("system_root");
	return in_able_set(file, writable) || in_able_set(realpath(file), writable);
}

bool is_readable_file(const string& file) {
	if (is_writable_file(file))
		return true;
	if (file == "/")
		return readable.count("system_root");
	return in_able_set(file, readable) || in_able_set(realpath(file), readable);
}

bool is_statable_file(const string& file) {
	if (is_readable_file(file))
		return true;
	if (file == "/")
		return statable.count("system_root");
	return in_able_set(file, statable) || in_able_set(realpath(file), statable);
}

bool check_safe_syscall(pid_t p) {
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

	// if (syscall == __NR_socket ||
	// 	syscall == __NR_connect ||
	// 	syscall == __NR_geteuid ||
	// 	syscall == __NR_getuid) {

	// 	reg.orig_rax += 1024;
	// 	ptrace(PTRACE_SETREGS, p, NULL, &reg);

	// } else
	if (syscall_limit[syscall]-- == 0) {
		// cout << "syscall limit " << syscall << endl;
		printf("syscall limit %d\n", syscall);
		return false;
	}

	string fn;
	reg_val_t fn_addr;
	reg_val_t flags;
	bool is_read_only;
	switch (syscall) {
		case __NR_open:
		case __NR_openat:
			if (syscall == __NR_open) {
				fn_addr = reg.rdi;
				flags = reg.rsi;
			} else {	// __NR_openat
				fn_addr = reg.rsi;
				flags = reg.rdx;
			}
			fn = read_abspath_from_regs(fn_addr, p);
			// printf("filepath: %s\n", fn.c_str());
			is_read_only = (flags & O_ACCMODE) == O_RDONLY &&
							(flags & O_CREAT) == 0 &&
							(flags & O_EXCL) == 0 &&
							(flags & O_TRUNC) == 0;
			if (is_read_only) {
				if (realpath(fn) != "" && !is_readable_file(fn)) {
					printf("open readable filepath: %s\n", fn.c_str());
					// printf("/usr/ count: %u\n", readable.count("/usr/"));
					// return on_dgs_file_detect(pid, reg, fn);
					return false;
				}
			} else {
				if (!is_writable_file(fn)) {
					printf("open writable filepath: %s\n", fn.c_str());
					// return on_dgs_file_detect(pid, reg, fn);
					return false;
				}
			}
			break;
		case __NR_readlink:
		case __NR_readlinkat:
			if (syscall == __NR_readlink) {
				fn_addr = reg.rdi;
			} else {	// __NR_readlinkat
				fn_addr = reg.rsi;
			}
			fn = read_abspath_from_regs(fn_addr, p);
			if (!is_readable_file(fn)) {
				printf("readlink filepath: %s\n", fn.c_str());
				return false;
			}
			break;
		case __NR_unlink:
		case __NR_unlinkat:
			if (syscall == __NR_unlink) {
				fn_addr = reg.rdi;
			} else {	// __NR_unlinkat
				fn_addr = reg.rsi;
			}
			fn = read_abspath_from_regs(fn_addr, p);
			if (!is_writable_file(fn)) {
				printf("unlink filepath: %s\n", fn.c_str());
				return false;
			}
			break;
		case __NR_access:
			fn_addr = reg.rdi;
			fn = read_abspath_from_regs(fn_addr, p);
			if (!is_statable_file(fn)) {
				printf("access filepath %s\n", fn.c_str());
				return false;
			}
			break;
		case __NR_stat:
		case __NR_lstat:
			fn_addr = reg.rdi;
			fn = read_abspath_from_regs(fn_addr, p);
			if (!is_statable_file(fn)) {
				printf("stat filepath %s\n", fn.c_str());
				return false;
			}
			break;
		case __NR_execve:
			fn_addr = reg.rdi;
			fn = read_abspath_from_regs(fn_addr, p);
			if (!is_readable_file(fn)) {
				printf("execve filepath: %s\n", fn.c_str());
				return false;
			}
			break;
		case __NR_chmod:
		case __NR_rename:
			fn_addr = reg.rdi;
			fn = read_abspath_from_regs(fn_addr, p);
			if (!is_writable_file(fn)) {
				printf("chmod rename filepath: %s\n", fn.c_str());
				return false;
			}
			break;
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

	for (int i = 0; i < runConfig.argArr.size(); ++i)
		add_permission(runConfig.argArr[i], STAT);

	statable.insert("/tmp");
	statable.insert("/usr");
	statable.insert("/lib");

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

		syscall_limit[__NR_prlimit64      ] = -1;
		syscall_limit[__NR_sysinfo        ] = -1;

		syscall_limit[__NR_getpid         ] = -1;
		syscall_limit[__NR_getuid         ] = -1;
		syscall_limit[__NR_geteuid        ] = -1;
		syscall_limit[__NR_getgid         ] = -1;
		syscall_limit[__NR_getegid        ] = -1;

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

		statable.insert("/usr/");
		statable.insert("/usr/bin/");
		statable.insert("/usr/lib/");
	}

	if (runConfig.Lang == "Script") {
		syscall_limit[__NR_set_tid_address] = 1;
		syscall_limit[__NR_set_robust_list] = -1;
		syscall_limit[__NR_futex          ] = -1;

		syscall_limit[__NR_prlimit64      ] = -1;
		syscall_limit[__NR_sysinfo        ] = -1;

		syscall_limit[__NR_pipe           ] = -1;
		syscall_limit[__NR_pipe2          ] = -1;
		syscall_limit[__NR_epoll_create1  ] = -1;
		syscall_limit[__NR_epoll_ctl      ] = -1;
		syscall_limit[__NR_epoll_wait     ] = -1;
		syscall_limit[__NR_eventfd2       ] = -1;

		syscall_limit[__NR_clock_gettime  ] = -1;
		syscall_limit[__NR_clock_getres   ] = -1;

		syscall_limit[__NR_getpid         ] = -1;
		syscall_limit[__NR_getuid         ] = -1;
		syscall_limit[__NR_geteuid        ] = -1;
		syscall_limit[__NR_getgid         ] = -1;
		syscall_limit[__NR_getegid        ] = -1;

		syscall_limit[__NR_prctl          ] = -1;
		syscall_limit[__NR_poll           ] = -1;

		readable.insert(runConfig.path);
		writable.insert(runConfig.path + "/");

		readable.insert("/usr/bin/nodejs");
		readable.insert("/usr/lib/nodejs/");

		statable.insert("/usr");
		statable.insert("/usr/bin");
		statable.insert("/usr/lib");

		statable.insert("/usr/");
		statable.insert("/usr/bin/");
		statable.insert("/usr/lib/");
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

		syscall_limit[__NR_chdir          ] = -1;
		syscall_limit[__NR_fchdir         ] = -1;

		syscall_limit[__NR_getrandom      ] = -1;

		syscall_limit[__NR_getuid         ] = -1;
		syscall_limit[__NR_geteuid        ] = -1;
		syscall_limit[__NR_getgid         ] = -1;
		syscall_limit[__NR_getegid        ] = -1;


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