#include <string>
#include <sstream>
#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    string reverseWords(string s) {
        vector<string> words;
        string word;
        stringstream ss(s);

        while (ss >> word) {
            words.push_back(word);
        }

        reverse(words.begin(), words.end());

        string result;
        for (int i = 0; i < words.size(); i++) {
            if (i > 0) result += " ";
            result += words[i];
        }

        return result;
    }
};
