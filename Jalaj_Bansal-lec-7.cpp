#include <iostream>
#include <string>
#include <cstring>
using namespace std;

// ---------- Structs & Union ----------
struct Student {
    string name;
    int roll;
    float marks;
};

struct Success {
    int code;
    char message[50];
};

struct Error {
    int errorCode;
    char errorMessage[50];
};

union ApiResponse {
    Success success;
    Error error;
};

struct ApiResult {
    bool ok;
    ApiResponse resp;
};

ApiResult callApi(int x) {
    ApiResult r;
    if (x % 2 == 0) {
        r.ok = true;
        r.resp.success.code = 200;
        strcpy(r.resp.success.message, "OK");
    } else {
        r.ok = false;
        r.resp.error.errorCode = 400;
        strcpy(r.resp.error.errorMessage, "Failed");
    }
    return r;
}

int main() {
    // ---------- Part 1 ----------
    int a, b;
    cout << "Enter two integers: ";
    cin >> a >> b;
    cout << "Before swap: a=" << a << ", b=" << b << endl;

    int *p1 = &a, *p2 = &b;
    *p1 = *p1 + *p2;
    *p2 = *p1 - *p2;
    *p1 = *p1 - *p2;

    cout << "After swap: a=" << a << ", b=" << b << endl << endl;

    // ---------- Part 2 ----------
    int num;
    cout << "Enter a number: ";
    cin >> num;
    int *p = &num;
    int **pp = &p;
    int ***ppp = &pp;

    cout << "Before triple pointer change: " << num << endl;
    ***ppp = 100;
    cout << "After triple pointer change: " << num << endl << endl;

    // ---------- Part 3 ----------
    int n;
    cout << "Enter number of integers: ";
    cin >> n;

    int *arr = new int[n];
    cout << "Enter " << n << " numbers: ";
    for (int i = 0; i < n; i++) {
        cin >> arr[i];
    }
    cout << "You entered: ";
    for (int i = 0; i < n; i++) {
        cout << arr[i] << " ";
    }
    cout << endl << endl;
    delete[] arr;

    // ---------- Part 4 ----------
    Student s;
    cout << "Enter student (name roll_no marks): ";
    cin >> s.name >> s.roll >> s.marks;

    cout << "Student details:\n";
    cout << "Name: " << s.name << "\nRoll_no: " << s.roll << "\nMarks: " << s.marks << endl << endl;

    // ---------- Part 5 ----------
    int x;
    cout << "Enter a number for API call: ";
    cin >> x;
    ApiResult result = callApi(x);

    if (result.ok) {
        cout << "Success: " << result.resp.success.code
             << " - " << result.resp.success.message << endl;
    } else {
        cout << "Error: " << result.resp.error.errorCode
             << " - " << result.resp.error.errorMessage << endl;
    }

    return 0;
}
