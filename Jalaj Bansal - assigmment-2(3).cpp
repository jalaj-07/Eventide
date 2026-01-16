#include <vector>
using namespace std;

class Solution {
public:
    void moveZeroes(vector<int>& nums) {
        int n = nums.size();
        int lastNonZero = 0;

        for (int i = 0; i < n; i++) {
            if (nums[i] != 0) {
                nums[lastNonZero] = nums[i];
                lastNonZero++;
            }
        }

        for (int i = lastNonZero; i < n; i++) {
            nums[i] = 0;
        }
    }
};
