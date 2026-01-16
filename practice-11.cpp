#include <iostream>
using namespace std;

int main() {
    int n, rn = 0, digit;

    cout << "Enter a number: ";
    cin >> n;

    while (n > 0) {
        digit = n % 10;
        rn = rn * 10 + digit;
        n = n / 10;             
    }

    cout << "Reversed number: " << rn;
    return 0;
}