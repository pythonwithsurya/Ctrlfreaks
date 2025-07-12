#!/usr/bin/env python3
"""
SkillSwap Platform Backend API Testing
Tests all API endpoints for the skill exchange platform
"""

import requests
import sys
import json
from datetime import datetime
import uuid

class SkillSwapAPITester:
    def __init__(self, base_url="https://74d22d95-e85e-4fb8-b175-b3eacb1bd773.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_users = []  # Store created test users

    def log(self, message):
        """Log test messages with timestamp"""
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {message}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        self.log(f"🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                self.log(f"✅ {name} - Status: {response.status_code}")
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                self.log(f"❌ {name} - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    self.log(f"   Error: {error_detail}")
                except:
                    self.log(f"   Response: {response.text}")
                return False, {}

        except Exception as e:
            self.log(f"❌ {name} - Error: {str(e)}")
            return False, {}

    def test_user_registration(self, email, password, name, location=None):
        """Test user registration"""
        user_data = {
            "email": email,
            "password": password,
            "name": name
        }
        if location:
            user_data["location"] = location
            
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=user_data
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_id = response['user']['id']
            self.test_users.append({
                'email': email,
                'password': password,
                'token': self.token,
                'user_id': self.user_id,
                'user': response['user']
            })
            self.log(f"   User ID: {self.user_id}")
            return True, response['user']
        return False, {}

    def test_user_login(self, email, password):
        """Test user login"""
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data={"email": email, "password": password}
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_id = response['user']['id']
            return True, response['user']
        return False, {}

    def test_get_current_user(self):
        """Test getting current user profile"""
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "users/me",
            200
        )
        return success, response

    def test_update_profile(self, profile_data):
        """Test updating user profile"""
        success, response = self.run_test(
            "Update Profile",
            "PUT",
            "users/me",
            200,
            data=profile_data
        )
        return success, response

    def test_search_users(self, skill=None, location=None):
        """Test searching for users"""
        endpoint = "users/search"
        params = []
        if skill:
            params.append(f"skill={skill}")
        if location:
            params.append(f"location={location}")
        
        if params:
            endpoint += "?" + "&".join(params)
            
        success, response = self.run_test(
            f"Search Users (skill={skill}, location={location})",
            "GET",
            endpoint,
            200
        )
        return success, response

    def test_get_user_profile(self, user_id):
        """Test getting a specific user's profile"""
        success, response = self.run_test(
            "Get User Profile",
            "GET",
            f"users/{user_id}",
            200
        )
        return success, response

    def test_create_swap_request(self, target_user_id, my_skill, their_skill, message=None):
        """Test creating a swap request"""
        swap_data = {
            "requested_user_id": target_user_id,
            "requester_skill": my_skill,
            "requested_skill": their_skill
        }
        if message:
            swap_data["message"] = message
            
        success, response = self.run_test(
            "Create Swap Request",
            "POST",
            "swaps",
            200,
            data=swap_data
        )
        return success, response

    def test_get_sent_requests(self):
        """Test getting sent swap requests"""
        success, response = self.run_test(
            "Get Sent Requests",
            "GET",
            "swaps/sent",
            200
        )
        return success, response

    def test_get_received_requests(self):
        """Test getting received swap requests"""
        success, response = self.run_test(
            "Get Received Requests",
            "GET",
            "swaps/received",
            200
        )
        return success, response

    def test_update_swap_status(self, swap_id, status):
        """Test updating swap request status"""
        success, response = self.run_test(
            f"Update Swap Status to {status}",
            "PUT",
            f"swaps/{swap_id}",
            200,
            data={"status": status}
        )
        return success, response

    def test_delete_swap_request(self, swap_id):
        """Test deleting a swap request"""
        success, response = self.run_test(
            "Delete Swap Request",
            "DELETE",
            f"swaps/{swap_id}",
            200
        )
        return success, response

    def test_dashboard(self):
        """Test dashboard endpoint"""
        success, response = self.run_test(
            "Get Dashboard",
            "GET",
            "dashboard",
            200
        )
        return success, response

    def test_duplicate_registration(self, email):
        """Test duplicate email registration (should fail)"""
        success, response = self.run_test(
            "Duplicate Registration (should fail)",
            "POST",
            "auth/register",
            400,  # Should return 400 for duplicate email
            data={
                "email": email,
                "password": "password123",
                "name": "Duplicate User"
            }
        )
        return success, response

    def test_invalid_login(self):
        """Test login with invalid credentials"""
        success, response = self.run_test(
            "Invalid Login (should fail)",
            "POST",
            "auth/login",
            401,  # Should return 401 for invalid credentials
            data={
                "email": "nonexistent@example.com",
                "password": "wrongpassword"
            }
        )
        return success, response

def main():
    """Main test execution"""
    tester = SkillSwapAPITester()
    
    # Generate unique test data
    timestamp = datetime.now().strftime('%H%M%S')
    user1_email = f"testuser1_{timestamp}@example.com"
    user2_email = f"testuser2_{timestamp}@example.com"
    
    tester.log("🚀 Starting SkillSwap Platform API Tests")
    tester.log(f"Testing against: {tester.base_url}")
    
    # Test 1: User Registration and Authentication
    tester.log("\n📝 Testing User Registration & Authentication")
    success, user1 = tester.test_user_registration(
        user1_email, "password123", "Alice Johnson", "New York"
    )
    if not success:
        tester.log("❌ User registration failed, stopping tests")
        return 1

    # Test 2: Get current user
    tester.test_get_current_user()

    # Test 3: Update profile with skills
    tester.log("\n👤 Testing Profile Management")
    profile_data = {
        "name": "Alice Johnson",
        "location": "New York",
        "skills_offered": ["Python Programming", "Data Analysis"],
        "skills_wanted": ["Spanish", "Photography"],
        "availability": "Weekends",
        "is_profile_public": True
    }
    tester.test_update_profile(profile_data)

    # Test 4: Create second user for swap testing
    tester.log("\n👥 Creating Second User for Swap Testing")
    success, user2 = tester.test_user_registration(
        user2_email, "password456", "Bob Smith", "San Francisco"
    )
    if not success:
        tester.log("❌ Second user registration failed")
        return 1

    # Update second user's profile
    profile_data2 = {
        "name": "Bob Smith",
        "location": "San Francisco", 
        "skills_offered": ["Spanish", "Guitar"],
        "skills_wanted": ["Python Programming", "Data Analysis"],
        "availability": "Evenings",
        "is_profile_public": True
    }
    tester.test_update_profile(profile_data2)

    # Test 5: Search functionality
    tester.log("\n🔍 Testing Search Functionality")
    # Switch back to user1 for searching
    tester.test_user_login(user1_email, "password123")
    tester.test_search_users(skill="Spanish")
    tester.test_search_users(location="San Francisco")
    tester.test_search_users()  # Search all users

    # Test 6: Swap request workflow
    tester.log("\n🔄 Testing Swap Request Workflow")
    # User1 creates swap request to User2
    success, swap_request = tester.test_create_swap_request(
        user2['id'], "Python Programming", "Spanish", 
        "Hi! I'd love to learn Spanish from you!"
    )
    
    if success and 'id' in swap_request:
        swap_id = swap_request['id']
        
        # Test getting sent requests
        tester.test_get_sent_requests()
        
        # Switch to user2 to see received requests
        tester.test_user_login(user2_email, "password456")
        tester.test_get_received_requests()
        
        # User2 accepts the request
        tester.test_update_swap_status(swap_id, "accepted")
        
        # Test marking as completed
        tester.test_update_swap_status(swap_id, "completed")
        
        # Switch back to user1 to test deletion (should fail since it's completed)
        tester.test_user_login(user1_email, "password123")
        
        # Create another request for deletion test
        success2, swap_request2 = tester.test_create_swap_request(
            user2['id'], "Data Analysis", "Guitar", "Another swap request"
        )
        
        if success2 and 'id' in swap_request2:
            # Test deleting pending request
            tester.test_delete_swap_request(swap_request2['id'])

    # Test 7: Dashboard
    tester.log("\n📊 Testing Dashboard")
    tester.test_dashboard()

    # Test 8: Error cases
    tester.log("\n❌ Testing Error Cases")
    tester.test_duplicate_registration(user1_email)
    tester.test_invalid_login()

    # Test 9: Get user profile
    tester.log("\n👁️ Testing User Profile Viewing")
    if len(tester.test_users) >= 2:
        tester.test_get_user_profile(tester.test_users[1]['user_id'])

    # Final results
    tester.log(f"\n📊 Test Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        tester.log("🎉 All tests passed!")
        return 0
    else:
        tester.log(f"⚠️ {tester.tests_run - tester.tests_passed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())