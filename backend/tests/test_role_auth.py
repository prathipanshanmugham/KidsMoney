"""
Tests for role-based authentication features:
- Parent signup/login
- Add kid with ui_theme and pin
- Kid login with parent_email, kid_name, pin
- /api/auth/me returning correct role
- Kid task completion
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://finlit-kids-ui.preview.emergentagent.com').rstrip('/')

# Test data with unique identifiers to avoid conflicts
TEST_ID = str(uuid.uuid4())[:8]
TEST_PARENT_EMAIL = f"test_parent_{TEST_ID}@example.com"
TEST_PARENT_PASSWORD = "Test1234!"
TEST_PARENT_NAME = f"Test Parent {TEST_ID}"
TEST_KID_NAME = f"TestKid_{TEST_ID}"
TEST_KID_PIN = "1234"
TEST_KID_THEME = "boy"


class TestParentAuth:
    """Parent authentication tests"""
    
    parent_token = None
    parent_id = None
    
    def test_01_parent_signup(self):
        """Test parent signup creates account and returns token"""
        response = requests.post(f"{BASE_URL}/api/auth/signup", json={
            "full_name": TEST_PARENT_NAME,
            "email": TEST_PARENT_EMAIL,
            "password": TEST_PARENT_PASSWORD
        })
        
        assert response.status_code == 200, f"Signup failed: {response.text}"
        data = response.json()
        
        # Validate response structure
        assert "token" in data, "Missing token in response"
        assert "user" in data, "Missing user in response"
        assert data["user"]["email"] == TEST_PARENT_EMAIL.lower()
        assert data["user"]["full_name"] == TEST_PARENT_NAME
        assert data["user"]["role"] == "parent"
        
        TestParentAuth.parent_token = data["token"]
        TestParentAuth.parent_id = data["user"]["id"]
        print(f"✓ Parent signup successful - ID: {TestParentAuth.parent_id}")
    
    def test_02_parent_login(self):
        """Test parent login with email/password"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_PARENT_EMAIL,
            "password": TEST_PARENT_PASSWORD
        })
        
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == TEST_PARENT_EMAIL.lower()
        assert data["user"]["role"] == "parent"
        
        TestParentAuth.parent_token = data["token"]
        print(f"✓ Parent login successful")
    
    def test_03_auth_me_parent(self):
        """Test /api/auth/me returns parent role"""
        response = requests.get(f"{BASE_URL}/api/auth/me", headers={
            "Authorization": f"Bearer {TestParentAuth.parent_token}"
        })
        
        assert response.status_code == 200, f"Auth/me failed: {response.text}"
        data = response.json()
        
        assert data["role"] == "parent", f"Expected parent role, got {data['role']}"
        assert data["email"] == TEST_PARENT_EMAIL.lower()
        assert "full_name" in data
        print(f"✓ /api/auth/me returns parent role correctly")
    
    def test_04_parent_login_invalid_credentials(self):
        """Test login with wrong credentials returns 401"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_PARENT_EMAIL,
            "password": "WrongPassword123!"
        })
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print(f"✓ Invalid credentials properly rejected")


class TestAddKidWithThemeAndPin:
    """Tests for adding kid with ui_theme and pin fields"""
    
    kid_id = None
    
    def test_01_add_kid_with_theme_and_pin(self):
        """Test adding kid with ui_theme and pin via POST /api/kids"""
        assert TestParentAuth.parent_token, "Parent token not available"
        
        response = requests.post(f"{BASE_URL}/api/kids", json={
            "name": TEST_KID_NAME,
            "age": 8,
            "avatar": "panda",
            "ui_theme": TEST_KID_THEME,
            "pin": TEST_KID_PIN,
            "starting_balance": 100
        }, headers={
            "Authorization": f"Bearer {TestParentAuth.parent_token}"
        })
        
        assert response.status_code == 200, f"Add kid failed: {response.text}"
        data = response.json()
        
        # Validate kid data
        assert data["name"] == TEST_KID_NAME
        assert data["age"] == 8
        assert data["ui_theme"] == TEST_KID_THEME, f"Expected ui_theme '{TEST_KID_THEME}', got '{data.get('ui_theme')}'"
        assert data["pin"] == TEST_KID_PIN, f"Expected pin '{TEST_KID_PIN}', got '{data.get('pin')}'"
        assert data["level"] == 1
        assert data["xp"] == 0
        assert data["credit_score"] == 500
        
        TestAddKidWithThemeAndPin.kid_id = data["id"]
        print(f"✓ Kid added with ui_theme='{TEST_KID_THEME}' and pin='{TEST_KID_PIN}' - ID: {TestAddKidWithThemeAndPin.kid_id}")
    
    def test_02_verify_kid_data_persisted(self):
        """Verify kid data (ui_theme, pin) is persisted by GET /api/kids/{id}"""
        assert TestParentAuth.parent_token, "Parent token not available"
        assert TestAddKidWithThemeAndPin.kid_id, "Kid ID not available"
        
        response = requests.get(f"{BASE_URL}/api/kids/{TestAddKidWithThemeAndPin.kid_id}", headers={
            "Authorization": f"Bearer {TestParentAuth.parent_token}"
        })
        
        assert response.status_code == 200, f"Get kid failed: {response.text}"
        data = response.json()
        
        assert data["ui_theme"] == TEST_KID_THEME
        assert data["pin"] == TEST_KID_PIN
        print(f"✓ Kid data (ui_theme, pin) correctly persisted in database")


class TestKidLogin:
    """Tests for kid login flow via POST /api/auth/kid-login"""
    
    kid_token = None
    
    def test_01_kid_login_success(self):
        """Test kid login with parent_email, kid_name, pin"""
        response = requests.post(f"{BASE_URL}/api/auth/kid-login", json={
            "parent_email": TEST_PARENT_EMAIL,
            "kid_name": TEST_KID_NAME,
            "pin": TEST_KID_PIN
        })
        
        assert response.status_code == 200, f"Kid login failed: {response.text}"
        data = response.json()
        
        # Validate response
        assert "token" in data, "Missing token in kid login response"
        assert "kid" in data, "Missing kid in response"
        assert data["kid"]["name"] == TEST_KID_NAME
        assert data["kid"]["ui_theme"] == TEST_KID_THEME, f"Expected ui_theme in response"
        
        TestKidLogin.kid_token = data["token"]
        print(f"✓ Kid login successful - Name: {data['kid']['name']}, Theme: {data['kid']['ui_theme']}")
    
    def test_02_auth_me_kid(self):
        """Test /api/auth/me returns kid role for kid token"""
        assert TestKidLogin.kid_token, "Kid token not available"
        
        response = requests.get(f"{BASE_URL}/api/auth/me", headers={
            "Authorization": f"Bearer {TestKidLogin.kid_token}"
        })
        
        assert response.status_code == 200, f"Auth/me failed for kid: {response.text}"
        data = response.json()
        
        assert data["role"] == "kid", f"Expected kid role, got {data['role']}"
        assert data["name"] == TEST_KID_NAME
        assert data["ui_theme"] == TEST_KID_THEME
        print(f"✓ /api/auth/me returns kid role correctly")
    
    def test_03_kid_login_wrong_pin(self):
        """Test kid login with wrong pin returns 401"""
        response = requests.post(f"{BASE_URL}/api/auth/kid-login", json={
            "parent_email": TEST_PARENT_EMAIL,
            "kid_name": TEST_KID_NAME,
            "pin": "9999"
        })
        
        assert response.status_code == 401, f"Expected 401 for wrong pin, got {response.status_code}"
        print(f"✓ Wrong PIN correctly rejected")
    
    def test_04_kid_login_wrong_name(self):
        """Test kid login with wrong name returns 401"""
        response = requests.post(f"{BASE_URL}/api/auth/kid-login", json={
            "parent_email": TEST_PARENT_EMAIL,
            "kid_name": "NonExistentKid",
            "pin": TEST_KID_PIN
        })
        
        assert response.status_code == 401, f"Expected 401 for wrong name, got {response.status_code}"
        print(f"✓ Wrong kid name correctly rejected")
    
    def test_05_kid_login_wrong_parent_email(self):
        """Test kid login with wrong parent email returns 401"""
        response = requests.post(f"{BASE_URL}/api/auth/kid-login", json={
            "parent_email": "nonexistent@example.com",
            "kid_name": TEST_KID_NAME,
            "pin": TEST_KID_PIN
        })
        
        assert response.status_code == 401, f"Expected 401 for wrong email, got {response.status_code}"
        print(f"✓ Wrong parent email correctly rejected")


class TestKidRoutes:
    """Tests for kid-specific routes with kid token"""
    
    def test_01_kid_dashboard(self):
        """Test GET /api/kid/dashboard with kid token"""
        assert TestKidLogin.kid_token, "Kid token not available"
        
        response = requests.get(f"{BASE_URL}/api/kid/dashboard", headers={
            "Authorization": f"Bearer {TestKidLogin.kid_token}"
        })
        
        assert response.status_code == 200, f"Kid dashboard failed: {response.text}"
        data = response.json()
        
        assert "kid" in data
        assert "wallet" in data
        assert "active_tasks" in data
        assert "level_info" in data
        print(f"✓ GET /api/kid/dashboard works with kid token")
    
    def test_02_kid_wallet(self):
        """Test GET /api/kid/wallet with kid token"""
        assert TestKidLogin.kid_token, "Kid token not available"
        
        response = requests.get(f"{BASE_URL}/api/kid/wallet", headers={
            "Authorization": f"Bearer {TestKidLogin.kid_token}"
        })
        
        assert response.status_code == 200, f"Kid wallet failed: {response.text}"
        data = response.json()
        
        assert "balance" in data
        assert data["balance"] == 100  # Starting balance
        print(f"✓ GET /api/kid/wallet returns wallet data")
    
    def test_03_kid_goals(self):
        """Test GET /api/kid/goals with kid token"""
        assert TestKidLogin.kid_token, "Kid token not available"
        
        response = requests.get(f"{BASE_URL}/api/kid/goals", headers={
            "Authorization": f"Bearer {TestKidLogin.kid_token}"
        })
        
        assert response.status_code == 200, f"Kid goals failed: {response.text}"
        # Returns empty array if no goals
        assert isinstance(response.json(), list)
        print(f"✓ GET /api/kid/goals works")
    
    def test_04_kid_learning_stories(self):
        """Test GET /api/kid/learning/stories with kid token"""
        assert TestKidLogin.kid_token, "Kid token not available"
        
        response = requests.get(f"{BASE_URL}/api/kid/learning/stories", headers={
            "Authorization": f"Bearer {TestKidLogin.kid_token}"
        })
        
        assert response.status_code == 200, f"Kid stories failed: {response.text}"
        data = response.json()
        
        assert isinstance(data, list)
        assert len(data) > 0  # Should have stories
        print(f"✓ GET /api/kid/learning/stories returns {len(data)} stories")
    
    def test_05_kid_achievements(self):
        """Test GET /api/kid/achievements with kid token"""
        assert TestKidLogin.kid_token, "Kid token not available"
        
        response = requests.get(f"{BASE_URL}/api/kid/achievements", headers={
            "Authorization": f"Bearer {TestKidLogin.kid_token}"
        })
        
        assert response.status_code == 200, f"Kid achievements failed: {response.text}"
        data = response.json()
        
        assert "badges" in data
        assert "stats" in data
        assert "level_info" in data
        print(f"✓ GET /api/kid/achievements works")


class TestKidTaskCompletion:
    """Test kid completing tasks via PUT /api/kid/tasks/{task_id}/complete"""
    
    task_id = None
    
    def test_01_create_task_as_parent(self):
        """Parent creates a task for the kid"""
        assert TestParentAuth.parent_token, "Parent token not available"
        assert TestAddKidWithThemeAndPin.kid_id, "Kid ID not available"
        
        response = requests.post(f"{BASE_URL}/api/tasks", json={
            "kid_id": TestAddKidWithThemeAndPin.kid_id,
            "title": f"Test Task {TEST_ID}",
            "description": "Complete this task for testing",
            "reward_amount": 10,
            "approval_required": True
        }, headers={
            "Authorization": f"Bearer {TestParentAuth.parent_token}"
        })
        
        assert response.status_code == 200, f"Create task failed: {response.text}"
        data = response.json()
        
        TestKidTaskCompletion.task_id = data["id"]
        assert data["status"] == "pending"
        print(f"✓ Task created - ID: {TestKidTaskCompletion.task_id}")
    
    def test_02_kid_complete_task(self):
        """Kid marks task as complete"""
        assert TestKidLogin.kid_token, "Kid token not available"
        assert TestKidTaskCompletion.task_id, "Task ID not available"
        
        response = requests.put(f"{BASE_URL}/api/kid/tasks/{TestKidTaskCompletion.task_id}/complete", headers={
            "Authorization": f"Bearer {TestKidLogin.kid_token}"
        })
        
        assert response.status_code == 200, f"Complete task failed: {response.text}"
        data = response.json()
        
        # Task requires approval, so status should be 'completed'
        assert data["status"] == "completed", f"Expected status 'completed', got '{data['status']}'"
        print(f"✓ Kid completed task - Status: {data['status']}")
    
    def test_03_verify_task_status(self):
        """Verify task status via kid tasks endpoint"""
        assert TestKidLogin.kid_token, "Kid token not available"
        
        response = requests.get(f"{BASE_URL}/api/kid/tasks", headers={
            "Authorization": f"Bearer {TestKidLogin.kid_token}"
        })
        
        assert response.status_code == 200, f"Get kid tasks failed: {response.text}"
        tasks = response.json()
        
        task = next((t for t in tasks if t["id"] == TestKidTaskCompletion.task_id), None)
        assert task is not None, "Task not found in kid's tasks"
        assert task["status"] == "completed"
        print(f"✓ Task status verified as 'completed'")


class TestRoleBasedAccess:
    """Test role-based access control - kid cannot access parent routes"""
    
    def test_01_kid_cannot_access_parent_kids_list(self):
        """Kid token should not be able to list kids"""
        assert TestKidLogin.kid_token, "Kid token not available"
        
        response = requests.get(f"{BASE_URL}/api/kids", headers={
            "Authorization": f"Bearer {TestKidLogin.kid_token}"
        })
        
        # Should return 403 Forbidden
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"
        print(f"✓ Kid cannot access /api/kids (parent route)")
    
    def test_02_parent_cannot_access_kid_routes(self):
        """Parent token should not be able to access kid-specific routes"""
        assert TestParentAuth.parent_token, "Parent token not available"
        
        response = requests.get(f"{BASE_URL}/api/kid/dashboard", headers={
            "Authorization": f"Bearer {TestParentAuth.parent_token}"
        })
        
        # Should return 403 Forbidden
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"
        print(f"✓ Parent cannot access /api/kid/dashboard (kid route)")


class TestCleanup:
    """Clean up test data"""
    
    def test_cleanup_delete_kid(self):
        """Delete test kid and all related data"""
        if not TestParentAuth.parent_token or not TestAddKidWithThemeAndPin.kid_id:
            pytest.skip("No test data to clean up")
        
        response = requests.delete(f"{BASE_URL}/api/kids/{TestAddKidWithThemeAndPin.kid_id}", headers={
            "Authorization": f"Bearer {TestParentAuth.parent_token}"
        })
        
        assert response.status_code == 200, f"Delete kid failed: {response.text}"
        print(f"✓ Test kid deleted")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
