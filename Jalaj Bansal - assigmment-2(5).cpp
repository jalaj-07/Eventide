#include <vector>
using namespace std;

class Solution {
  public:
    vector<int> findUnion(vector<int> &a, vector<int> &b) {
        vector<int> result;
        int i = 0, j = 0;
        int n = a.size(), m = b.size();

        while (i < n && j < m) {
            if (a[i] < b[j]) {
                if (result.empty() || result.back() != a[i]) 
                    result.push_back(a[i]);
                i++;
            } 
            else if (b[j] < a[i]) {
                if (result.empty() || result.back() != b[j]) 
                    result.push_back(b[j]);
                j++;
            } 
            else { 
                if (result.empty() || result.back() != a[i]) 
                    result.push_back(a[i]);
                i++;
                j++;
            }
        }
        
        while (i < n) {
            if (result.empty() || result.back() != a[i]) 
                result.push_back(a[i]);
            i++;
        }
        
        while (j < m) {
            if (result.empty() || result.back() != b[j]) 
                result.push_back(b[j]);
            j++;
        }

        return result;
    }
};
