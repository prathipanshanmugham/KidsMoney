#!/usr/bin/env python3

import requests
import json
import sys
from datetime import datetime
import uuid

class KidsMoneyAPITester:
    def __init__(self, base_url="https://money-legend-1.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.test_user_email = f"test_{int(datetime.now().timestamp())}@example.com"
        self.test_user_password = "TestPass123!@#"
        self.test_user_name = "Test Parent"
        self.test_kid_id = None
        self.test_task_id = None
        self.test_goal_id = None
        self.test_sip_id = None
        self.test_loan_id = None
        
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, message="", endpoint=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            status = "✅ PASS"
        else:
            status = "❌ FAIL"
        
        print(f"{status} - {name}: {message}")
        self.test_results.append({
            "name": name,
            "success": success,
            "message": message,
            "endpoint": endpoint
        })

    def make_request(self, method, endpoint, data=None, expected_status=200):
        """Make HTTP request with auth headers"""
        url = f"{self.base_url}{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)
            else:
                raise ValueError(f"Unsupported method: {method}")

            success = response.status_code == expected_status
            
            try:
                response_data = response.json()
            except:
                response_data = {}

            return success, response.status_code, response_data
        except requests.exceptions.RequestException as e:
            return False, 0, {"error": str(e)}

    def test_auth_signup(self):
        """Test user signup"""
        success, status, data = self.make_request(
            'POST', 
            '/auth/signup',
            {
                "full_name": self.test_user_name,
                "email": self.test_user_email,
                "password": self.test_user_password
            },
            200
        )
        
        if success and 'token' in data:
            self.token = data['token']
            self.log_test("Auth Signup", True, f"User created with ID: {data.get('user', {}).get('id', 'N/A')}", "/auth/signup")
            return True
        else:
            self.log_test("Auth Signup", False, f"Status: {status}, Response: {data}", "/auth/signup")
            return False

    def test_auth_login(self):
        """Test user login"""
        success, status, data = self.make_request(
            'POST',
            '/auth/login',
            {
                "email": self.test_user_email,
                "password": self.test_user_password
            },
            200
        )
        
        if success and 'token' in data:
            self.token = data['token']
            self.log_test("Auth Login", True, f"Login successful for user: {data.get('user', {}).get('full_name', 'N/A')}", "/auth/login")
            return True
        else:
            self.log_test("Auth Login", False, f"Status: {status}, Response: {data}", "/auth/login")
            return False

    def test_auth_me(self):
        """Test get current user"""
        success, status, data = self.make_request('GET', '/auth/me', None, 200)
        
        if success and 'id' in data:
            self.log_test("Auth Me", True, f"Retrieved user: {data.get('full_name', 'N/A')}", "/auth/me")
            return True
        else:
            self.log_test("Auth Me", False, f"Status: {status}, Response: {data}", "/auth/me")
            return False

    def test_create_kid(self):
        """Test creating a kid"""
        success, status, data = self.make_request(
            'POST',
            '/kids',
            {
                "name": "Test Kid",
                "age": 8,
                "avatar": "panda",
                "grade": "3rd",
                "starting_balance": 100
            },
            200
        )
        
        if success and 'id' in data:
            self.test_kid_id = data['id']
            self.log_test("Create Kid", True, f"Kid created: {data.get('name', 'N/A')} with ID: {data['id']}", "/kids")
            return True
        else:
            self.log_test("Create Kid", False, f"Status: {status}, Response: {data}", "/kids")
            return False

    def test_list_kids(self):
        """Test listing kids"""
        success, status, data = self.make_request('GET', '/kids', None, 200)
        
        if success and isinstance(data, list):
            self.log_test("List Kids", True, f"Retrieved {len(data)} kids", "/kids")
            return True
        else:
            self.log_test("List Kids", False, f"Status: {status}, Response: {data}", "/kids")
            return False

    def test_create_task(self):
        """Test creating a task"""
        if not self.test_kid_id:
            self.log_test("Create Task", False, "No kid ID available", "/tasks")
            return False
            
        success, status, data = self.make_request(
            'POST',
            '/tasks',
            {
                "kid_id": self.test_kid_id,
                "title": "Clean your room",
                "description": "Organize and clean bedroom",
                "reward_amount": 50,
                "penalty_amount": 10,
                "frequency": "one-time",
                "approval_required": True
            },
            200
        )
        
        if success and 'id' in data:
            self.test_task_id = data['id']
            self.log_test("Create Task", True, f"Task created: {data.get('title', 'N/A')}", "/tasks")
            return True
        else:
            self.log_test("Create Task", False, f"Status: {status}, Response: {data}", "/tasks")
            return False

    def test_list_tasks(self):
        """Test listing tasks"""
        if not self.test_kid_id:
            self.log_test("List Tasks", False, "No kid ID available", f"/tasks/{self.test_kid_id}")
            return False
            
        success, status, data = self.make_request('GET', f'/tasks/{self.test_kid_id}', None, 200)
        
        if success and isinstance(data, list):
            self.log_test("List Tasks", True, f"Retrieved {len(data)} tasks", f"/tasks/{self.test_kid_id}")
            return True
        else:
            self.log_test("List Tasks", False, f"Status: {status}, Response: {data}", f"/tasks/{self.test_kid_id}")
            return False

    def test_complete_task(self):
        """Test completing a task"""
        if not self.test_task_id:
            self.log_test("Complete Task", False, "No task ID available", f"/tasks/{self.test_task_id}/complete")
            return False
            
        success, status, data = self.make_request('PUT', f'/tasks/{self.test_task_id}/complete', {}, 200)
        
        if success and data.get('status') == 'completed':
            self.log_test("Complete Task", True, f"Task status: {data.get('status')}", f"/tasks/{self.test_task_id}/complete")
            return True
        else:
            self.log_test("Complete Task", False, f"Status: {status}, Response: {data}", f"/tasks/{self.test_task_id}/complete")
            return False

    def test_approve_task(self):
        """Test approving a task"""
        if not self.test_task_id:
            self.log_test("Approve Task", False, "No task ID available", f"/tasks/{self.test_task_id}/approve")
            return False
            
        success, status, data = self.make_request('PUT', f'/tasks/{self.test_task_id}/approve', {}, 200)
        
        if success and data.get('status') == 'approved':
            self.log_test("Approve Task", True, f"Task approved: {data.get('status')}", f"/tasks/{self.test_task_id}/approve")
            return True
        else:
            self.log_test("Approve Task", False, f"Status: {status}, Response: {data}", f"/tasks/{self.test_task_id}/approve")
            return False

    def test_get_wallet(self):
        """Test getting wallet"""
        if not self.test_kid_id:
            self.log_test("Get Wallet", False, "No kid ID available", f"/wallet/{self.test_kid_id}")
            return False
            
        success, status, data = self.make_request('GET', f'/wallet/{self.test_kid_id}', None, 200)
        
        if success and 'balance' in data:
            self.log_test("Get Wallet", True, f"Balance: {data.get('balance', 0)} coins", f"/wallet/{self.test_kid_id}")
            return True
        else:
            self.log_test("Get Wallet", False, f"Status: {status}, Response: {data}", f"/wallet/{self.test_kid_id}")
            return False

    def test_get_transactions(self):
        """Test getting transactions"""
        if not self.test_kid_id:
            self.log_test("Get Transactions", False, "No kid ID available", f"/wallet/{self.test_kid_id}/transactions")
            return False
            
        success, status, data = self.make_request('GET', f'/wallet/{self.test_kid_id}/transactions', None, 200)
        
        if success and isinstance(data, list):
            self.log_test("Get Transactions", True, f"Retrieved {len(data)} transactions", f"/wallet/{self.test_kid_id}/transactions")
            return True
        else:
            self.log_test("Get Transactions", False, f"Status: {status}, Response: {data}", f"/wallet/{self.test_kid_id}/transactions")
            return False

    def test_create_goal(self):
        """Test creating a goal"""
        if not self.test_kid_id:
            self.log_test("Create Goal", False, "No kid ID available", "/goals")
            return False
            
        success, status, data = self.make_request(
            'POST',
            '/goals',
            {
                "kid_id": self.test_kid_id,
                "title": "New Bicycle",
                "target_amount": 200,
                "deadline": "2024-12-31"
            },
            200
        )
        
        if success and 'id' in data:
            self.test_goal_id = data['id']
            self.log_test("Create Goal", True, f"Goal created: {data.get('title', 'N/A')}", "/goals")
            return True
        else:
            self.log_test("Create Goal", False, f"Status: {status}, Response: {data}", "/goals")
            return False

    def test_list_goals(self):
        """Test listing goals"""
        if not self.test_kid_id:
            self.log_test("List Goals", False, "No kid ID available", f"/goals/{self.test_kid_id}")
            return False
            
        success, status, data = self.make_request('GET', f'/goals/{self.test_kid_id}', None, 200)
        
        if success and isinstance(data, list):
            self.log_test("List Goals", True, f"Retrieved {len(data)} goals", f"/goals/{self.test_kid_id}")
            return True
        else:
            self.log_test("List Goals", False, f"Status: {status}, Response: {data}", f"/goals/{self.test_kid_id}")
            return False

    def test_contribute_goal(self):
        """Test contributing to a goal"""
        if not self.test_goal_id:
            self.log_test("Contribute Goal", False, "No goal ID available", f"/goals/{self.test_goal_id}/contribute")
            return False
            
        success, status, data = self.make_request(
            'PUT',
            f'/goals/{self.test_goal_id}/contribute',
            {"amount": 50},
            200
        )
        
        if success and 'saved_amount' in data:
            self.log_test("Contribute Goal", True, f"Saved amount: {data.get('saved_amount', 0)}", f"/goals/{self.test_goal_id}/contribute")
            return True
        else:
            self.log_test("Contribute Goal", False, f"Status: {status}, Response: {data}", f"/goals/{self.test_goal_id}/contribute")
            return False

    def test_create_sip(self):
        """Test creating SIP"""
        if not self.test_kid_id:
            self.log_test("Create SIP", False, "No kid ID available", "/sip")
            return False
            
        success, status, data = self.make_request(
            'POST',
            '/sip',
            {
                "kid_id": self.test_kid_id,
                "amount": 25,
                "interest_rate": 8.0,
                "frequency": "monthly"
            },
            200
        )
        
        if success and 'id' in data:
            self.test_sip_id = data['id']
            self.log_test("Create SIP", True, f"SIP created: {data.get('amount', 0)}/month", "/sip")
            return True
        else:
            self.log_test("Create SIP", False, f"Status: {status}, Response: {data}", "/sip")
            return False

    def test_pay_sip(self):
        """Test paying SIP"""
        if not self.test_sip_id:
            self.log_test("Pay SIP", False, "No SIP ID available", f"/sip/{self.test_sip_id}/pay")
            return False
            
        success, status, data = self.make_request('POST', f'/sip/{self.test_sip_id}/pay', {}, 200)
        
        if success and 'payments_made' in data:
            self.log_test("Pay SIP", True, f"Payments made: {data.get('payments_made', 0)}", f"/sip/{self.test_sip_id}/pay")
            return True
        else:
            self.log_test("Pay SIP", False, f"Status: {status}, Response: {data}", f"/sip/{self.test_sip_id}/pay")
            return False

    def test_request_loan(self):
        """Test requesting a loan"""
        if not self.test_kid_id:
            self.log_test("Request Loan", False, "No kid ID available", "/loans/request")
            return False
            
        success, status, data = self.make_request(
            'POST',
            '/loans/request',
            {
                "kid_id": self.test_kid_id,
                "amount": 100,
                "purpose": "Emergency fund",
                "duration_months": 6,
                "interest_rate": 5.0
            },
            200
        )
        
        if success and 'id' in data:
            self.test_loan_id = data['id']
            self.log_test("Request Loan", True, f"Loan requested: {data.get('principal', 0)} coins", "/loans/request")
            return True
        else:
            self.log_test("Request Loan", False, f"Status: {status}, Response: {data}", "/loans/request")
            return False

    def test_approve_loan(self):
        """Test approving a loan"""
        if not self.test_loan_id:
            self.log_test("Approve Loan", False, "No loan ID available", f"/loans/{self.test_loan_id}/approve")
            return False
            
        success, status, data = self.make_request('POST', f'/loans/{self.test_loan_id}/approve', {}, 200)
        
        if success and data.get('status') == 'active':
            self.log_test("Approve Loan", True, f"Loan status: {data.get('status')}", f"/loans/{self.test_loan_id}/approve")
            return True
        else:
            self.log_test("Approve Loan", False, f"Status: {status}, Response: {data}", f"/loans/{self.test_loan_id}/approve")
            return False

    def test_pay_loan(self):
        """Test paying loan EMI"""
        if not self.test_loan_id:
            self.log_test("Pay Loan EMI", False, "No loan ID available", f"/loans/{self.test_loan_id}/pay")
            return False
            
        success, status, data = self.make_request('POST', f'/loans/{self.test_loan_id}/pay', {}, 200)
        
        if success and 'payments_made' in data:
            self.log_test("Pay Loan EMI", True, f"Payments made: {data.get('payments_made', 0)}", f"/loans/{self.test_loan_id}/pay")
            return True
        else:
            self.log_test("Pay Loan EMI", False, f"Status: {status}, Response: {data}", f"/loans/{self.test_loan_id}/pay")
            return False

    def test_get_stories(self):
        """Test getting learning stories"""
        success, status, data = self.make_request('GET', '/learning/stories', None, 200)
        
        if success and isinstance(data, list) and len(data) > 0:
            self.log_test("Get Stories", True, f"Retrieved {len(data)} stories", "/learning/stories")
            return True
        else:
            self.log_test("Get Stories", False, f"Status: {status}, Response: {data}", "/learning/stories")
            return False

    def test_complete_story(self):
        """Test completing a story"""
        if not self.test_kid_id:
            self.log_test("Complete Story", False, "No kid ID available", "/learning/complete")
            return False
            
        success, status, data = self.make_request(
            'POST',
            '/learning/complete',
            {
                "kid_id": self.test_kid_id,
                "story_id": "story-1",
                "score": 3
            },
            200
        )
        
        if success and 'message' in data:
            self.log_test("Complete Story", True, f"Story completed: {data.get('message')}", "/learning/complete")
            return True
        else:
            self.log_test("Complete Story", False, f"Status: {status}, Response: {data}", "/learning/complete")
            return False

    def test_kid_dashboard(self):
        """Test getting kid dashboard"""
        if not self.test_kid_id:
            self.log_test("Kid Dashboard", False, "No kid ID available", f"/dashboard/kid/{self.test_kid_id}")
            return False
            
        success, status, data = self.make_request('GET', f'/dashboard/kid/{self.test_kid_id}', None, 200)
        
        if success and 'kid' in data and 'wallet' in data:
            self.log_test("Kid Dashboard", True, f"Dashboard loaded for: {data.get('kid', {}).get('name', 'N/A')}", f"/dashboard/kid/{self.test_kid_id}")
            return True
        else:
            self.log_test("Kid Dashboard", False, f"Status: {status}, Response: {data}", f"/dashboard/kid/{self.test_kid_id}")
            return False

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Kids Money API Tests")
        print("=" * 50)
        
        # Authentication tests
        if not self.test_auth_signup():
            print("❌ Signup failed, trying with existing test user")
            self.test_user_email = "test@example.com"
            self.test_user_password = "Test123!@#"
            if not self.test_auth_login():
                print("❌ Cannot authenticate with either new or existing user. Stopping tests.")
                return self.get_summary()
        
        self.test_auth_me()
        
        # Kids management
        self.test_create_kid()
        self.test_list_kids()
        
        # Task management
        self.test_create_task()
        self.test_list_tasks()
        self.test_complete_task()
        self.test_approve_task()
        
        # Wallet & transactions
        self.test_get_wallet()
        self.test_get_transactions()
        
        # Goals
        self.test_create_goal()
        self.test_list_goals()
        self.test_contribute_goal()
        
        # SIP
        self.test_create_sip()
        self.test_pay_sip()
        
        # Loans
        self.test_request_loan()
        self.test_approve_loan()
        self.test_pay_loan()
        
        # Learning
        self.test_get_stories()
        self.test_complete_story()
        
        # Dashboard
        self.test_kid_dashboard()
        
        return self.get_summary()

    def get_summary(self):
        """Get test summary"""
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        
        print("\n" + "=" * 50)
        print(f"📊 API Test Results Summary")
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {success_rate:.1f}%")
        
        if self.tests_run - self.tests_passed > 0:
            print("\n❌ Failed Tests:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['name']}: {result['message']}")
        
        return {
            "total_tests": self.tests_run,
            "passed_tests": self.tests_passed,
            "failed_tests": self.tests_run - self.tests_passed,
            "success_rate": success_rate,
            "test_results": self.test_results
        }

def main():
    """Main test execution"""
    tester = KidsMoneyAPITester()
    summary = tester.run_all_tests()
    
    # Return appropriate exit code
    if summary['failed_tests'] > 0:
        return 1
    return 0

if __name__ == "__main__":
    sys.exit(main())