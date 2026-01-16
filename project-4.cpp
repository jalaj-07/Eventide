#include <iostream>
using namespace std;

//-----------Task-1----------
int main()
{
    int n;
    cout << "Enter an integer: ";
    cin >> n;

    if (n > 10)
    cout << n << " is greater than 10" << endl;

//---------Task-2--------------
    cout << "Enter another integer :";
    cin >> n;

    if (n % 2 == 0)
    cout << n << " is even" << endl;
    else
    cout << n << " is odd" << endl;
//--------Task-3-----------
    int marks;
    cout << "Enter marks (0-100): ";
    cin >> marks;

    if (marks >= 90)
        cout << "Grade: A" << endl;
    else if (marks >= 75)
        cout << "Grade: B" << endl;
    else if (marks >= 50)
        cout << "Grade: C" << endl;
    else
        cout << "Grade: F" << endl;

//-----------task-4---------
    int a, b;
    cout << "Enter two integers (a and b): ";
    cin >> a >> b;

    if (a > 0) {
        if (b > 0) {
            cout << "Both positive" << endl;
        } else {
            cout << "a positive, b not positive" << endl;
        }
    } else {
        cout << "a is not positive" << endl;
    }

//------------task-5------------
    cout << "Enter a number (1-7): ";
    cin >> n;
    
    switch (n)
    {
        case 1:
            cout << "Monday" << endl;
            break;
        case 2:
            cout << "Tuesday" << endl;
            break;
        case 3:
            cout << "Wednesday" << endl;
            break;
        case 4:
            cout << "Thursday" << endl;
            break;
        case 5:
            cout << "Friday" << endl;
            break;
        case 6:
            cout << "Saturday" << endl;
            break;
        case 7:
            cout << "Sunday" << endl;
            break;
        default: 
            cout << "Error 404: That day does not exist, genius!" << endl; 
            break;

    }

    return 0;
}