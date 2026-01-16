#include <iostream>
using namespace std;

int main() {
    long long a, b;
    char op;

    cout << "Enter first number (a): ";
    cin >> a;

    cout << "Enter second number (b): ";
    cin >> b;

    cout << "Enter operator (+, -, *, /): ";
    cin >> op;

    switch(op) {
        case '+':
            cout << "Result = " << (a + b) << endl;
            break;
        case '-':
            cout << "Result = " << (a - b) << endl;
            break;
        case '*':
            cout << "Result = " << (a * b) << endl;
            break;
        case '/':
            if(b != 0)
                cout << "Result = " << (a / b) << endl;
            else
                cout << "Error! Division by zero is not allowed." << endl;
            break;
        default:
            cout << "Invalid operator!" << endl;
    }

    return 0;
}
