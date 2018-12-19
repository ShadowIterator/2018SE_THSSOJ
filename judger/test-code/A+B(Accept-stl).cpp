#include <iostream>
#include <set>

using std::cin;
using std::cout;
using std::endl;
using std::set;
set<int> s;
int main() {
	int a, b;
	b = 0;
	while (cin >> a) {
		s.insert(a);
		b += a;
	}
	cout << b << endl;
    return 0;
}
