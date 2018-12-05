#include "security.h"

bool check_safe_syscall(pid_t){
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

void init_config(const RunConfig&){
	
}