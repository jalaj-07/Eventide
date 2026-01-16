#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
using namespace std;

// ---------------- Task 1 ----------------
void findMinMax(int* arr, int size, int* outMin, int* outMax)
{
    *outMin = arr[0];
    *outMax = arr[0];
    for (int i = 1; i < size; i++)
    {
        if (arr[i] < *outMin)
            *outMin = arr[i];
        if (arr[i] > *outMax)
            *outMax = arr[i];
    }
}

// ---------------- Task 4 ----------------
struct Student {
    string name;
    double gpa;
};

// ---------------- Task 5 ----------------
struct Product {
    int id;
    string name;
    double price;
};

Product* findProductById(Product* inventory, int size, int searchId)
{
    for (int i = 0; i < size; i++)
    {
        if (inventory[i].id == searchId)
            return &inventory[i]; // return pointer to found product
    }
    return nullptr;
}

int main()
{
    // ---------- Task 1 ----------
    cout << "=== Task 1: Min/Max Finder ===" << endl;
    int arr[] = {5, 8, 3, 9, 4, 2, 7};
    int size = sizeof(arr) / sizeof(arr[0]);
    int minResult, maxResult;

    findMinMax(arr, size, &minResult, &maxResult);

    cout << "Array: ";
    for (int x : arr) cout << x << " ";
    cout << "\nMinimum: " << minResult << "\nMaximum: " << maxResult << endl;

    // ---------- Task 2 ----------
    cout << "\n=== Task 2: Vector Reverse ===" << endl;
    vector<int> vec = {1, 2, 3, 4, 5, 6};
    cout << "Before: ";
    for (int v : vec) cout << v << " ";
    cout << endl;

    int left = 0, right = vec.size() - 1;
    while (left < right)
    {
        swap(vec[left], vec[right]);
        left++;
        right--;
    }

    cout << "After:  ";
    for (int v : vec) cout << v << " ";
    cout << endl;

    // ---------- Task 3 ----------
    cout << "\n=== Task 3: Matrix Transpose ===" << endl;
    int original[2][3] = {{1, 2, 3}, {4, 5, 6}};
    int transposed[3][2];

    for (int i = 0; i < 2; i++)
    {
        for (int j = 0; j < 3; j++)
        {
            transposed[j][i] = original[i][j];
        }
    }

    cout << "Original Matrix (2x3):\n";
    for (int i = 0; i < 2; i++)
    {
        for (int j = 0; j < 3; j++)
            cout << original[i][j] << " ";
        cout << endl;
    }

    cout << "Transposed Matrix (3x2):\n";
    for (int i = 0; i < 3; i++)
    {
        for (int j = 0; j < 2; j++)
            cout << transposed[i][j] << " ";
        cout << endl;
    }

    // ---------- Task 4 ----------
    cout << "\n=== Task 4: Student Database ===" << endl;
    int numStudents;
    cout << "How many students? ";
    cin >> numStudents;

    Student* students = new Student[numStudents];
    for (int i = 0; i < numStudents; i++)
    {
        cout << "Enter details for student " << (i + 1) << ":\n";
        cout << "Name: ";
        cin >> students[i].name;
        cout << "GPA: ";
        cin >> students[i].gpa;
    }

    cout << "\nStudent Roster:\n";
    for (int i = 0; i < numStudents; i++)
    {
        cout << "- " << students[i].name << " (GPA: " << students[i].gpa << ")\n";
    }

    delete[] students;

    // ---------- Task 5 ----------
    cout << "\n=== Task 5: Inventory Search ===" << endl;
    int inventorySize = 5;
    Product* inventory = new Product[inventorySize]{
        {101, "Laptop", 55000},
        {102, "Keyboard", 75.5},
        {103, "Mouse", 25.0},
        {104, "Monitor", 150.0},
        {105, "Headphones", 60.0}
    };

    int searchId1 = 102, searchId2 = 109;

    cout << "Searching for ID " << searchId1 << "...\n";
    Product* found = findProductById(inventory, inventorySize, searchId1);
    if (found != nullptr)
        cout << "Found Product: ID=" << found->id
             << ", Name=" << found->name
             << ", Price=$" << found->price << endl;
    else
        cout << "Product not found.\n";

    cout << "Searching for ID " << searchId2 << "...\n";
    found = findProductById(inventory, inventorySize, searchId2);
    if (found != nullptr)
        cout << "Found Product: ID=" << found->id
             << ", Name=" << found->name
             << ", Price=$" << found->price << endl;
    else
        cout << "Product not found.\n";

    delete[] inventory;

    return 0;
}
