class Solution {
  public:
    // Function to count the number of digits in n that evenly divide n
    int evenlyDivides(int n) {
        int original = n;
        int count = 0;
        
        while (n > 0) {
            int digit = n % 10;  // extract last digit
            if (digit != 0 && original % digit == 0) {
                count++;        // digit divides original number evenly
            }
            n /= 10;            // move to next digit
        }
        
        return count;
    }
};
