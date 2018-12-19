#include <stdio.h>
#include <unistd.h>

int main() {
	pid_t fpid;
	int a, b;
	fpid = fork();
	if (fpid < 0) {
		printf("error in fork\n");
	} else
	if (fpid == 0) {
	} else
	{
		scanf("%d%d", &a, &b);
		printf("%d\n", a+b);
	}
    return 0;
}
