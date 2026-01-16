#include <iostream>
#include <vector>
using namespace std;

int findMax(const vector<int>& nums, int index) {
    if (index == nums.size() - 1)
        return nums[index];

    int maxOfRest = findMax(nums, index + 1);

    return max(nums[index], maxOfRest);
}

int main() {
    vector<int> myVector = {3, 8, 2, 9, 5};

    int maximum = findMax(myVector, 0);

    cout << "The maximum element is: " << maximum << endl;

    return 0;
}
