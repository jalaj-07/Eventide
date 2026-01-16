#include <iostream>
using namespace std;

int main() {
    int n;
    long long factorial = 1;

    cout << "Enter a non-negative integer: ";
    cin >> n;

    if (n < 0) {
        cout << "Error! Factorial of a negative number doesn't exist." << endl;
    } else {
        int i = n;
        if (n > 0) {
            do {
                factorial *= i;
                i--;
            } while (i > 0);
        }

        cout << "Factorial of " << n << " = " << factorial << endl;
    }

    return 0;
}