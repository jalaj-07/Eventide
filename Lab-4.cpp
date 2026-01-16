#include <iostream>
#include <vector>
#include <string>
#include <limits>
#include <algorithm>
using namespace std;

// ------------------------ Helper: print vector ------------------------
void printVec(const vector<int>& v) {
    cout << "{";
    for (size_t i = 0; i < v.size(); ++i) {
        cout << v[i];
        if (i + 1 < v.size()) cout << ", ";
    }
    cout << "}";
}

// ------------------------ Task 1: Recursive Max Element Finder ------------------------
int findMax(const vector<int>& nums, int index) {
    if (nums.empty()) {
        // Defensive: if vector empty, return very small number.
        return numeric_limits<int>::min();
    }
    // Base case: last element
    if (index == static_cast<int>(nums.size()) - 1) {
        return nums[index];
    }
    // Recursive step: max of rest
    int maxOfRest = findMax(nums, index + 1);
    return max(nums[index], maxOfRest);
}

// ------------------------ Task 2: Partition Array In-Place ------------------------
void partition(vector<int>& nums, int pivot) {
    int left = 0;
    int right = static_cast<int>(nums.size()) - 1;
    while (left <= right) {
        // Move left forward while element < pivot (correct side)
        while (left <= right && nums[left] < pivot) ++left;
        // Move right backward while element >= pivot (correct side)
        while (left <= right && nums[right] >= pivot) --right;
        if (left < right) {
            swap(nums[left], nums[right]);
            ++left; --right;
        }
    }
    // After loop: all < pivot are before index 'left'
}

// ------------------------ Task 3: Simplified stringToInt (simpleAtoi) ------------------------
int simpleAtoi(const string& str) {
    if (str.empty()) return 0;
    int i = 0;
    bool negative = false;
    if (str[0] == '-') {
        negative = true;
        i = 1;
    }
    long long result = 0; // use wider type to avoid intermediate overflow (though spec said no overflow handling needed)
    for (; i < static_cast<int>(str.size()); ++i) {
        char c = str[i];
        if (c < '0' || c > '9') break; // stop at first non-digit
        result = result * 10 + (c - '0');
    }
    return negative ? static_cast<int>(-result) : static_cast<int>(result);
}

// ------------------------ Task 4: Generate All Subsets (Powerset) ------------------------
void printSubset(const vector<int>& subset) {
    cout << "{";
    for (size_t i = 0; i < subset.size(); ++i) {
        cout << subset[i];
        if (i + 1 < subset.size()) cout << ", ";
    }
    cout << "}";
}

void generateSubsets(const vector<int>& nums, int index, vector<int>& current_subset) {
    if (index == static_cast<int>(nums.size())) {
        printSubset(current_subset);
        cout << "\n";
        return;
    }
    // Exclude nums[index]
    generateSubsets(nums, index + 1, current_subset);

    // Include nums[index]
    current_subset.push_back(nums[index]);
    generateSubsets(nums, index + 1, current_subset);

    // Backtrack
    current_subset.pop_back();
}

// ------------------------ Task 5: Combination Sum (each number used once) ------------------------
void findCombinations(const vector<int>& candidates, int target, vector<int>& current_combo, int start_index) {
    if (target == 0) {
        printSubset(current_combo);
        cout << "\n";
        return;
    }
    if (target < 0) return;
    for (int i = start_index; i < static_cast<int>(candidates.size()); ++i) {
        // Choose
        current_combo.push_back(candidates[i]);
        // Explore with next index (each number used at most once)
        findCombinations(candidates, target - candidates[i], current_combo, i + 1);
        // Backtrack
        current_combo.pop_back();
    }
}

// ------------------------ main(): tests for each task ------------------------
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    cout << "------ Task 1: Recursive Max Element Finder ------\n";
    vector<int> v1 = {3, 8, 2, 9, 5};
    cout << "Array: ";
    printVec(v1);
    cout << "\nMax (recursive): " << findMax(v1, 0) << "\n\n";

    cout << "------ Task 2: Partition Array In-Place ------\n";
    vector<int> v2 = {5, 2, 9, 1, 7, 3, 8};
    int pivot = 5;
    cout << "Before partition: ";
    printVec(v2);
    cout << "\nPivot = " << pivot << "\n";
    partition(v2, pivot);
    cout << "After partition (all < pivot come first): ";
    printVec(v2);
    cout << "\n\n";

    cout << "------ Task 3: simpleAtoi ------\n";
    vector<string> tests = {"54", "-102", "392ab1"};
    for (const auto& s : tests) {
        cout << "simpleAtoi(\"" << s << "\") => " << simpleAtoi(s) << "\n";
    }
    cout << "\n";

    cout << "------ Task 4: Generate All Subsets (Powerset) ------\n";
    vector<int> v4 = {1, 2, 3};
    cout << "All subsets of ";
    printVec(v4);
    cout << ":\n";
    vector<int> current_subset;
    generateSubsets(v4, 0, current_subset);
    cout << "\n";

    cout << "------ Task 5: Combination Sum (each candidate used once) ------\n";
    vector<int> candidates = {2, 3, 5, 7};
    int target = 8;
    cout << "Candidates: ";
    printVec(candidates);
    cout << ", Target = " << target << "\n";
    vector<int> current_combo;
    findCombinations(candidates, target, current_combo, 0);
    cout << "\n";

    return 0;
}
