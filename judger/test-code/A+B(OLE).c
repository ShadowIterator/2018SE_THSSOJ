#include <stdio.h>
int arr[100000000];

int main() {
	int a, b;
	scanf("%d%d", &a, &b);
	printf("%d\n", arr[0]+b);
	for (int i = 0; i < 10000000; ++i)
		printf("%d\n", i);
    return 0;
}