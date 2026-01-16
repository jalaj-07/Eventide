#include <iostream>
#include <vector>

using namespace std;

int main()
{
    int size;
    cout << "Enter size: " << endl;
    cin >> size;

    vector<int> arr(size); 

    cout << "Enter " << size << " numbers:" << endl;
    for (int i = 0; i < size; i++)
    {
        cin >> arr[i];
    }

    for (int ele : arr)
    {
        cout << ele << " ";
    }
    
    cout << endl;
    return 0;
}