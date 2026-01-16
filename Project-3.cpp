#include <iostream>
using namespace std;

int main()
{
    int a, b;
    cout << "Enter two integers (a and b): ";
    cin >> a >> b;

    // 1. Arithmetic Operators
    cout << "\n--- Arithmetic Operators ---" << endl;
    cout << "a + b = " << (a + b) << endl;
    cout << "a - b = " << (a - b) << endl;
    cout << "a * b = " << (a * b) << endl;
    if (b != 0) {
        cout << "a / b = " << (a / b) << endl;
        cout << "a % b = " << (a % b) << endl;
    } else {
        cout << "a / b = Division by zero not allowed" << endl;
        cout << "a % b = Modulus by zero not allowed" << endl;
    }

    // 2. Relational Operators
    cout << "\n--- Relational Operators ---" << endl;
    cout << "a > b : " << (a > b) << endl;
    cout << "a < b : " << (a < b) << endl;
    cout << "a == b : " << (a == b) << endl;
    cout << "a != b : " << (a != b) << endl;

    // 3. Logical Operators
    cout << "\n--- Logical Operators ---" << endl;
    cout << "(a > 0 && b > 0) : " << (a > 0 && b > 0) << endl;
    cout << "(a > 0 || b > 0) : " << (a > 0 || b > 0) << endl;
    cout << "!(a > 0) : " << (!(a > 0)) << endl;

    // 4. Assignment Operators
    cout << "\n--- Assignment Operators ---" << endl;
    int c = a;
    cout << "c = a → c = " << c << endl;
    c += b; cout << "c += b → " << c << endl;
    c -= b; cout << "c -= b → " << c << endl;
    c *= b; cout << "c *= b → " << c << endl;
    if (b != 0) {
        c /= b; cout << "c /= b → " << c << endl;
    } else {
        cout << "c /= b → Division by zero not allowed" << endl;
    }

    // 5. Increment / Decrement
    cout << "\n--- Increment / Decrement ---" << endl;
    cout << "a++ = " << a++ << " (a becomes " << a << ")" << endl;
    cout << "++a = " << ++a << " (a becomes " << a << ")" << endl;
    cout << "b-- = " << b-- << " (b becomes " << b << ")" << endl;
    cout << "--b = " << --b << " (b becomes " << b << ")" << endl;

    // 6. Operator Precedence
    cout << "\n--- Operator Precedence ---" << endl;
    cout << "a + b * 2 = " << (a + b * 2) << endl;
    cout << "(a + b) * 2 = " << ((a + b) * 2) << endl;

    // 7. Operator Associativity
    cout << "\n--- Operator Associativity ---" << endl;
    cout << "a - b - 2 = " << (a - b - 2) << endl;
    if (b != 0) {
        cout << "a / b / 2 = " << (a / b / 2) << endl;
    } else {
        cout << "a / b / 2 → Division by zero not allowed" << endl;
    }

    return 0;
}
