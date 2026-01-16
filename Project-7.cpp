#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n, target, sum = 0;
    cout << "Enter size of array: ";
    cin >> n;

    int arr[n];
    cout << "Enter " << n << " elements: ";
    for (int i = 0; i < n; i++) {
        cin >> arr[i];
        sum += arr[i];
    }

    cout << "Sum of all elements = " << sum << endl;

    cout << "Enter target element to find: ";
    cin >> target;

    bool found = false;
    for (int i = 0; i < n; i++) {
        if (arr[i] == target) {
            cout << "Target element " << target << " found at index " << i << endl;
            found = true;
            break;
        }
    }

    if (!found)
        cout << "Target element not found in array." << endl;

    return 0;
}
