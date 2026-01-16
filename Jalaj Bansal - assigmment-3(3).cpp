#include <string>
#include <vector>
using namespace std;

class Solution {
public:
    bool isIsomorphic(string s, string t) {
        if (s.size() != t.size()) return false;

        vector<int> mapST(256, -1); // mapping from s -> t
        vector<int> mapTS(256, -1); // mapping from t -> s

        for (int i = 0; i < s.size(); i++) {
            char c1 = s[i], c2 = t[i];

            if (mapST[c1] == -1 && mapTS[c2] == -1) {
                mapST[c1] = c2;
                mapTS[c2] = c1;
            } else {
                if (mapST[c1] != c2 || mapTS[c2] != c1) {
                    return false;
                }
            }
        }
        return true;
    }
};
