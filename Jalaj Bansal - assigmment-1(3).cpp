class Solution {
public:
    bool armstrongNumber(int n) {
        int original = n;
        int sum = 0;
        int digits = (int)log10(n) + 1; // count digits

        while (n > 0) {
            int digit = n % 10;
            sum += pow(digit, digits);
            n /= 10;
        }

        return sum == original;
    }
};
