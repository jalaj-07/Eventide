#include <iostream>
#include <string>
using namespace std;

int globalVar = 100;
void print()
{
    cout << "Hello World" << endl;
    cout << "Global variable inside function: " << globalVar << endl;
}

int main()
{
    print();
    bool isTrue = true;
    int x = 23;
    char ch = 'A';
    float y = 45.67;
    double z = 89.123456;

    cout << "\n--- variable values ---\n";
    cout << "Boolean value: " << isTrue << endl;
    cout << "Integer value: " << x << endl;
    cout << "Character value : " << ch << endl;
    cout << "Float value: " << y << endl;
    cout << "Double value: " << z << endl;

    cout << "\n--- variable sizes ---\n";
    cout << "Size of bool: " << sizeof(isTrue) << " bytes" << endl;
    cout << "Size of int: " << sizeof(x) << " bytes" << endl;
    cout << "Size of char: " << sizeof(ch) << " bytes" << endl;
    cout << "Size of float: " << sizeof(y) << " bytes" << endl;
    cout << "Size of double: " << sizeof(z) << " bytes" << endl;

    cout << "\n--- type casting (5/2) ---\n";
    cout << "As int: " << (5 / 2) << endl;
    cout << "As double (C-style cast): " << ((double)5 / 2) << endl;
    cout << "As double (static_cast): " << static_cast<double>(5) / 2 << endl;

    return 0;    
}