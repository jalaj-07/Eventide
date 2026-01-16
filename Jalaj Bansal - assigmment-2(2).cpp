class Solution {
public:
    void rotate(vector<int>& nums, int k) {
        int n = nums.size();
        k = k % n;

        auto reverseArr = [&](int left, int right) {
            while (left < right) {
                swap(nums[left], nums[right]);
                left++;
                right--;
            }
        };

        reverseArr(0, n - 1);
        reverseArr(0, k - 1);
        reverseArr(k, n - 1);
    }
};
