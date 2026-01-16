#include <iostream>
using namespace std;

int main()
{
//--------------Task-1-----------------
    {
        int n;
        cout << "Enter an integer: ";
        cin >> n;
        for (int i = 1; i <=100; i++)
        {
            if (i % n == 0)
            {
                cout << "First multiple of: " << n << " is " << i << endl;
                break;
            }
        }    
    }
//--------------Task-2-----------------
   {
    int m, k;
    cout << "Enter the value of m: ";
    cin >> m;
    cout << "Enter the value of k: ";
    cin >> k;

    for (int i = 1; i <= m; i++)
    {
        if (i % k == 0)
        {
            continue;
        }
        cout << i << " ";
    }
    cout << endl;

}
//--------------Task-3-----------------
    {
        int n;
        cout << "Enter number of rows: ";
        cin >> n;

        for (int i = n; i >= 1; i--)
        {
            for (int j = 1; j <= i; j++)
            {
                cout << "* ";
            }
            cout << endl;
        }
    }
//--------------Task-4----------------
    {
        int n;
        cout << "Enter number of rows: ";
        cin >> n;

        for (int i = 1; i <= n; i++)
        {
            for (int j = 1; j<= i; j++)
            {
                cout << j << " ";
            }
            cout << endl;
        }
    }
    return 0;
}