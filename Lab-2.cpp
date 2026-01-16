#include <iostream>
#include <vector>
#include <cstdlib>
#include <ctime>
#include <iomanip>
using namespace std;

int main()
{
//--------------Taks-1(Diamond Pattern)----------
    int n;
    cout << "Enter number of rows: ";
    cin >> n;

    for (int i = 1; i <= n; i++)
    {
        for (int j = 1; j <= i; j++)
        {
            cout << "* ";
        }
        cout << endl;
    }

    for (int i = n - 1; i >= 1; i--)
    {
        for (int j = 1; j <= i; j++)
        {
            cout << "* ";
        }
        cout << endl;
    }

//--------------Task-2(Pascal's Triangle)--------
    cout << "Enter number of rows: ";
    cin >> n;

    vector<vector<int>> pascal(n);

    for (int i = 0; i < n; i++) 
    {
        pascal[i].resize(i + 1);
        pascal[i][0] = pascal[i][i] = 1;

        for (int j = 1; j < i; j++) {
            pascal[i][j] = pascal[i - 1][j - 1] + pascal[i - 1][j];
        }
    }

    for (int i = 0; i < n; i++) 
    {
        for (int j = 0; j <= i; j++) 
        {
            cout << pascal[i][j] << " ";
        }
        cout << endl;
    }
//--------------Task-3(Prime Numbers in Range)---

    int start, end;
    cout << "Enter start and end: ";
    cin >> start >> end;

    cout << "Prime numbers between " << start << " and " << end << " are: ";

    for (int num = start; num <= end; num++)
    {
        if (num < 2) continue;

        bool isPrime = true;

        for (int i = 2; i * i <= num; i++)
        {
            if (num % i == 0)
            {
                isPrime = false;
                break;
            }
        }

        if (isPrime)
            cout << num << " ";
    }

    cout << endl;
//--------------Task-4(Number Guessing Game)-----
    int number = rand() % 100 + 1;
    int guess;

    cout << "Guess the number between 1 and 100!" << endl;

    while (true)
    {
        cout << "Enter your guess: ";
        cin >> guess;

        if (guess > number)
        {
            cout << "Too High!" << endl;
        }
        else if (guess < number)
        {
            cout << "Too Low!" << endl;
        }
        else
        {
            cout << "Correct! The number was " << number << "." << endl;
            break;
        }
    }
//--------------Task-5(Student Report System)----
    cout << "Enter number of students: ";
    cin >> n;

    string name[100];
    int roll[100];
    int marks[100][3];
    int total[100];
    int average[100];

    for (int i = 0; i < n; i++)
    {
        cout << "Enter name, roll, 3 marks for student " << i + 1 << ": ";
        cin >> name[i] >> roll[i] >> marks[i][0] >> marks[i][1] >> marks[i][2];

        total[i] = marks[i][0] + marks[i][1] + marks[i][2];
        average[i] = total[i] / 3;
    }

    cout << endl;
    cout << left << setw(10) << "Name"
         << setw(10) << "Roll"
         << setw(10) << "Total"
         << setw(10) << "Average" << endl;

    for (int i = 0; i < n; i++)
    {
        cout << left << setw(10) << name[i]
             << setw(10) << roll[i]
             << setw(10) << total[i]
             << setw(10) << average[i] << endl;
    }

    return 0;
}