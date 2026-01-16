#include <string>
#include <unordered_map>
#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    string frequencySort(string s) {
        unordered_map<char, int> freq;
        for (char c : s) {
            freq[c]++;
        }

        vector<pair<char, int>> chars(freq.begin(), freq.end());
        sort(chars.begin(), chars.end(), [](const pair<char,int> &a, const pair<char,int> &b){
            return a.second > b.second; // sort by frequency descending
        });

        string result;
        for (auto &p : chars) {
            result += string(p.second, p.first);
        }

        return result;
    }
};
