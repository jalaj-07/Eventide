class Solution {
  public:
    void print_divisors(int n) {
        bool first = true;
        std::vector<int> big;

        for (long long i = 1; i * i <= n; ++i) {
            if (n % i == 0) {
                if (!first) std::cout << ' ';
                std::cout << (int)i;
                first = false;

                int other = n / (int)i;
                if (other != i) big.push_back(other);
            }
        }

        for (int i = (int)big.size() - 1; i >= 0; --i) {
            if (!first) std::cout << ' ';
            std::cout << big[i];
            first = false;
        }

        // NOTE: intentionally no '\n' here
    }
};
