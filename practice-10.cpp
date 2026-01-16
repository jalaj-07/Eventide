#include <iostream>
using namespace std;

unsigned long long factorial(int n) 
{
    if (n < 0) {
        cerr << "Error: Factorial is not defined for negative numbers." << endl;
        return 0; 
    }
    unsigned long long fact = 1;
    for (int i = 1; i <= n; ++i) {
        fact *= i;
    }
    return fact;
}

int main() {
    int number;
    std::cout << "Enter a non-negative integer: ";
    std::cin >> number;

    if (number < 0) {
        std::cerr << "Error: Factorial is not defined for negative numbers." << std::endl;
    } else {
        unsigned long long result = factorial(number);
        std::cout << "Factorial of " << number << " is " << result << std::endl;
    }

    return 0;
}