#include <iostream>
using namespace std;

int main()
{
//-----------Task-1----------------
    for (int i = 1; i <= 20; i++)
    {
        cout << i << " ";
    }
    cout << endl;

//-----------Task-2---------------------
    {
        int i = 20;
        while (i >= 1)
        {
            cout << i << " ";
            i--;
        }
    }
    cout << endl;

//------------Task-3--------------------
    int n;
    cout << "Enter an integer: ";
    cin >> n;

    cout << "Multiplication Table of: " << n << endl;
    for (int i = 1; i <= 10; i++) 
    {
        cout << n << " x " << i << " = " << n * i << endl;
    }

//------------Task-4--------------------
    cout << "Enter an integer: ";
    cin >> n;

    cout << "Reverse Multiplication Table of: " << n << endl;

    int i = 10;
    while (i >= 1) 
    {
        cout << n << " x " << i << " = " << n * i << endl;
        i--;
    }

//------------Task-5--------------------
    bool isPrime = true;   

    cout << "Enter an integer: ";
    cin >> n;
    
    if (n <= 1)
    {
        isPrime = false;
    }
    else
    {
        for (int i = 2; i <= n / 2; i++)
        {
            if (n % i == 0)
            {
                isPrime = false;
                break;
            }
        }
    }
    if (isPrime)
        cout << n << " is a prime number." << endl;
    else
        cout << n << " is not a prime number." << endl;

//--------------Task-6------------------
cout << "Enter an integer: ";
cin >> n;
{
    int i = 1;
    while (i <= n)
    {
        if (i % 2 == 0)
        {
            cout << i << " ";
        }
        i++;
    }
    cout << endl;
}
//------------Task-7--------------------
{
    int n;
    cout << "Enter an integer(>=0): ";
    cin >> n;

    int i = 1;
    long long int fact = 1;
    do
    {
        fact = fact * i;
        i++;
    }
    while (i <= n);

    cout << "Factorial of " << n << " = " << fact << endl;
}
//--------------Task-8------------------
{
    int n;

    do
    {
        cout << "Enter a number (0 to stop): ";
        cin >> n;

        if (n != 0)
            cout << "You entered: " << n << endl;

    } 
    while (n != 0);

    cout << "Program ended." << endl;
}
//--------------Task-9------------------
{
    int i = 1;
    cout << "For loop without initialization:" << endl;
    for (; i <=7; i++) 
    {
        cout << i << " ";
    }
    cout << endl;

    cout << "For loop without condition:" << endl;
    for (int j = 1;; j++) 
    {
        if (j > 7)
            break;
        cout << j << " ";
    }
    cout << endl;

    cout << "For loop without increment:" << endl;
    for (int k = 1; k <= 7;) 
    {
        cout << k << " ";
        k++;
    }
    cout << endl;
}
    return 0;
}