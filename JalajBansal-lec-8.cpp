#include <iostream>
#include <vector>
#include <cstring>
#include <string>
using namespace std;

int main()
{
    // ---------------- Task 1 ----------------
    int arr[10] = {10, 5, 8, 20, 15, 20, 8, 12, 3, 7};
    int n = 10;

    int largest = arr[0];
    int secondLargest = -1e9;

    for (int i = 1; i < n; i++)
    {
        if (arr[i] > largest)
        {
            secondLargest = largest;
            largest = arr[i];
        }
        else if (arr[i] > secondLargest && arr[i] < largest)
        {
            secondLargest = arr[i];
        }
    }

    cout << "Second largest unique element: " << secondLargest << endl;

    // ---------------- Task 2 ----------------
    vector<int> numbers;
    int input;

    cout << "\nEnter numbers (-1 to stop): ";
    while (true)
    {
        cin >> input;
        if (input == -1)
            break;
        numbers.push_back(input);
    }

    for (int i = 0; i < numbers.size();)
    {
        if (numbers[i] % 2 != 0)
        {
            numbers.erase(numbers.begin() + i);
        }
        else
        {
            i++;
        }
    }

    cout << "Even numbers in vector: ";
    for (int num : numbers)
    {
        cout << num << " ";
    }
    cout << endl;

    // ---------------- Task 3 ----------------
    int matrix[3][3] = {
        {1, 2, 3},
        {4, 5, 6},
        {7, 8, 9}};

    int sumDiagonal = 0;
    for (int i = 0; i < 3; i++)
    {
        sumDiagonal += matrix[i][i];
    }

    cout << "\nSum of main diagonal: " << sumDiagonal << endl;

    // ---------------- Task 4 ----------------
    char my_string[] = "turtle";
    int len = strlen(my_string);

    for (int i = 0; i < len / 2; i++)
    {
        char temp = my_string[i];
        my_string[i] = my_string[len - i - 1];
        my_string[len - i - 1] = temp;
    }

    cout << "Reversed string: " << my_string << endl;

    // ---------------- Task 5 ----------------
    cin.ignore();
    string sentence;
    cout << "\nEnter a sentence: ";
    getline(cin, sentence);

    int wordCount = 0;
    bool inWord = false;

    for (char c : sentence)
    {
        if (c != ' ' && !inWord)
        {
            inWord = true;
            wordCount++;
        }
        else if (c == ' ')
        {
            inWord = false;
        }
    }

    cout << "Word count: " << wordCount << endl;

    return 0;
}
