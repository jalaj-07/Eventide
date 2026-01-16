#include <iostream>
using namespace std;

int main()
{
    int arr[5] = {3,1,2,4,5};
    int smallest = arr[0];
    int size = sizeof(arr)/sizeof(arr[0]);
    for(int i = 1; i < size; i++)
    {
        if(arr[i] < smallest)
        {
            smallest = arr[i];
        }
    }
    cout << "Smallest element: " << smallest << endl;
    return 0;
}