class Solution {
public:
    int missingNumber(vector<int>& nums) {
        int xorAll = 0, xorNums = 0;
        int n = nums.size();
        
        for (int i = 0; i <= n; i++) xorAll ^= i;     // XOR of all numbers 0..n
        for (int num : nums) xorNums ^= num;         // XOR of all elements in array
        
        return xorAll ^ xorNums; // missing number
    }
};
