#ifndef tinyjudger_security_H
#define tinyjudger_security_H
#include <iostream>
#include <cstdio>
#include <cstdlib>
#include <string>
#include <algorithm>
#include <cstring>
#include <sys/reg.h>
#include <sys/ptrace.h>
#include <asm/unistd.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <unistd.h>
#include <sys/resource.h>
#include <sys/user.h>
#include <string>
#include <iostream>
#include <errno.h>
#include <limits.h>
#include "configs.h"

bool check_safe_syscall(pid_t);
void on_syscall_exit(pid_t);
void init_config(const RunConfig&);

#endif