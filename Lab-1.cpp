#include <iostream>
using namespace std;

int main() {
    // -------------------- Task 1 --------------------
    cout << "=== Task 1: Basic Types & I/O ===" << endl;
    int myInt;
    float myFloat;
    double myDouble;
    char myChar;
    bool myBool;

    cout << "Enter an integer: ";
    cin >> myInt;
    cout << "Enter a float: ";
    cin >> myFloat;
    cout << "Enter a double: ";
    cin >> myDouble;
    cout << "Enter a character: ";
    cin >> myChar;
    cout << "Enter a boolean (0 or 1): ";
    cin >> myBool;

    cout << "\nYou entered: " << endl;
    cout << "Integer: " << myInt << endl;
    cout << "Float: " << myFloat << endl;
    cout << "Double: " << myDouble << endl;
    cout << "Character: " << myChar << endl;
    cout << "Boolean: " << myBool << endl;

    // -------------------- Task 2 --------------------
    cout << "\n=== Task 2: Arithmetic Operators ===" << endl;
    int a, b;
    cout << "Enter two integers: ";
    cin >> a >> b;

    cout << a << " + " << b << " = " << a + b << endl;
    cout << a << " - " << b << " = " << a - b << endl;
    cout << a << " * " << b << " = " << a * b << endl;
    cout << a << " / " << b << " = " << a / b << endl;
    cout << a << " % " << b << " = " << a % b << endl;

    // -------------------- Task 3 --------------------
    cout << "\n=== Task 3: Relational Operators ===" << endl;
    int x, y;
    cout << "Enter two numbers: ";
    cin >> x >> y;

    cout << x << " > " << y << " : " << (x > y) << endl;
    cout << x << " < " << y << " : " << (x < y) << endl;
    cout << x << " >= " << y << " : " << (x >= y) << endl;
    cout << x << " <= " << y << " : " << (x <= y) << endl;
    cout << x << " == " << y << " : " << (x == y) << endl;
    cout << x << " != " << y << " : " << (x != y) << endl;

    // -------------------- Task 4 --------------------
    cout << "\n=== Task 4: Logical Operators ===" << endl;
    bool p, q;
    cout << "Enter two boolean values (0 or 1): ";
    cin >> p >> q;

    cout << "p && q = " << (p && q) << endl;
    cout << "p || q = " << (p || q) << endl;
    cout << "!p = " << (!p) << endl;
    cout << "!q = " << (!q) << endl;

    // -------------------- Task 5 --------------------
    cout << "\n=== Task 5: Mini Calculator ===" << endl;
    int num1, num2;
    char op;
    cout << "Enter first number: ";
    cin >> num1;
    cout << "Enter second number: ";
    cin >> num2;
    cout << "Enter operator (+, -, *, /, %): ";
    cin >> op;

    switch (op) {
        case '+': cout << "Result: " << num1 + num2 << endl; break;
        case '-': cout << "Result: " << num1 - num2 << endl; break;
        case '*': cout << "Result: " << num1 * num2 << endl; break;
        case '/':
            if (num2 != 0)
                cout << "Result: " << num1 / num2 << endl;
            else
                cout << "Error: Division by zero!" << endl;
            break;
        case '%':
            if (num2 != 0)
                cout << "Result: " << num1 % num2 << endl;
            else
                cout << "Error: Modulus by zero!" << endl;
            break;
        default: cout << "Invalid operator!" << endl;
    }

    return 0;
}
