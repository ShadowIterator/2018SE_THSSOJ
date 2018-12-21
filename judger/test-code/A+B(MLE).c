#include <stdio.h>
int arr[100000000];

int main() {
	int a, b;
	scanf("%d%d", &a, &b);
	for (int i = 0; i < 100000000; ++i)
		arr[i] = a;
	printf("%d\n", arr[0]+b);
    return 0;
}
