# Handover

## Quick Start

### Setup
1. Get your MongoDB connection string from Atlas
2. Create a `.env` file in the `server/` directory:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=Sample1
   PORT=3000
   ```

3. Install dependencies and run:
   ```bash
   cd server
   npm install
   npm run dev
   ```

**Note**: By default, data is going to be stored in `test` database unless you specify your particular database.
- **Collections**: Automatically created from model names (pluralized and lowercase)
  - `User` model → `users` collection
  - `Spending` model → `spendings` collection
  - `Card` model → `cards` collection

 ---

## Current Models

### 1. User Model (`models/User.js`)
Stores user account information.

**Fields:**
- `name` (String, required)
- `email` (String, required, unique)
- `password` (String, required, hashed)
- Timestamps (createdAt, updatedAt)

### 2. Spending Model (`models/Spending.js`)
Stores user spending transactions.

**Fields:**
- `userId` (ObjectId, reference to User)
- `amount` (Number, required)
- `category` (String, required)
- `merchant` (String)
- `date` (Date, default: now)
- Timestamps (createdAt, updatedAt)

### 3. Card Model (`models/Card.js`)
Basic structure started - needs completion.

---

## API Routes

### User Endpoints
| Method | Endpoint | Description | 
|--------|----------|-------------|
| `POST` | `/api/users/register` | Create new user account | 

**TODO:** Login, profile update, account deletion

### Spending Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/spending` | Create spending transaction |
| `GET` | `/api/spending` | Get all spending (with filters) | 
| `GET` | `/api/spending/:id` | Get single transaction | 
| `PUT` | `/api/spending/:id` | Update transaction | 
| `DELETE` | `/api/spending/:id` | Delete transaction | 

**Query Parameters for GET `/api/spending`:**
- `category` - Filter by category (e.g., `dining`, `groceries`)
- `startDate` - Filter from date (ISO format: `2025-11-01`)
- `endDate` - Filter until date (ISO format: `2025-11-30`)

--

# Examples for testing

## User Routes (`/api/users`)

### ✅ Valid Requests

#### 1. Register a New User (Success)
````bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "secret123",
    "firstName": "John",
    "lastName": "Doe"
  }'
````

**Expected Response (201 Created):**
````json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "673d1e2f3a4b5c6d7e8f9012",
    "email": "test@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
````

#### 2. Register Demo User (For Testing)
````bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@cardwise.com",
    "password": "demo123",
    "firstName": "Demo",
    "lastName": "User"
  }'
````

#### 3. Register Another User
````bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane.smith@example.com",
    "password": "password456",
    "firstName": "Jane",
    "lastName": "Smith"
  }'
````

---

### ❌ Invalid Requests (Error Cases)

#### 4. Missing Email (400 Bad Request)
````bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "password": "secret123",
    "firstName": "John",
    "lastName": "Doe"
  }'
````

**Expected Response:**
````json
{
  "success": false,
  "message": "Email and password are required"
}
````

#### 5. Missing Password (400 Bad Request)
````bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }'
````

**Expected Response:**
````json
{
  "success": false,
  "message": "Email and password are required"
}
````

#### 6. Missing First Name (400 Bad Request)
````bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "secret123",
    "lastName": "Doe"
  }'
````

**Expected Response:**
````json
{
  "success": false,
  "message": "First name and last name are required"
}
````

#### 7. Missing Last Name (400 Bad Request)
````bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "secret123",
    "firstName": "John"
  }'
````

#### 8. Duplicate Email (409 Conflict)
````bash
# First, register a user
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "duplicate@example.com",
    "password": "secret123",
    "firstName": "First",
    "lastName": "User"
  }'

# Then try to register with same email
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "duplicate@example.com",
    "password": "different456",
    "firstName": "Second",
    "lastName": "User"
  }'
````

**Expected Response:**
````json
{
  "success": false,
  "message": "User already exists"
}
````

#### 9. Invalid JSON Format (400 Bad Request)
````bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
    "password": "secret123"
  }'
# Missing comma between fields
````

#### 10. Empty Request Body (400 Bad Request)
````bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{}'
````

---

## Spending Routes (`/api/spending`)

**Note:** Replace `YOUR_USER_ID` with actual user ID from registration (e.g., `691e5bb8367d68ed3a766bfd`)

### ✅ Valid Requests

#### 1. Create Spending Entry - Full Data (201 Created)
````bash
curl -X POST http://localhost:3000/api/spending \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 45.99,
    "category": "dining",
    "merchant": "Starbucks",
    "date": "2025-11-15",
    "notes": "Morning coffee with team",
    "cardUsed": "Chase Sapphire Preferred"
  }'
````

**Expected Response:**
````json
{
  "success": true,
  "message": "Spending entry created successfully",
  "data": {
    "id": "673...",
    "amount": 45.99,
    "category": "dining",
    "merchant": "Starbucks",
    "date": "2025-11-15T00:00:00.000Z",
    "notes": "Morning coffee with team",
    "cardUsed": "Chase Sapphire Preferred",
    "user": {
      "_id": "691e5bb8367d68ed3a766bfd",
      "profile": {
        "firstName": "Demo",
        "lastName": "User"
      }
    }
  }
}
````

#### 2. Create Spending - Minimal Required Fields
````bash
curl -X POST http://localhost:3000/api/spending \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 120.50,
    "category": "groceries"
  }'
````

#### 3. Create Spending - Different Categories
````bash
# Groceries
curl -X POST http://localhost:3000/api/spending \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 85.32,
    "category": "groceries",
    "merchant": "Whole Foods",
    "date": "2025-11-14"
  }'

# Gas
curl -X POST http://localhost:3000/api/spending \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 55.00,
    "category": "gas",
    "merchant": "Shell",
    "date": "2025-11-13"
  }'

# Travel
curl -X POST http://localhost:3000/api/spending \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 450.00,
    "category": "travel",
    "merchant": "United Airlines",
    "date": "2025-11-10"
  }'

# Entertainment
curl -X POST http://localhost:3000/api/spending \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 25.00,
    "category": "entertainment",
    "merchant": "AMC Theaters",
    "date": "2025-11-12"
  }'
````

#### 4. Create Spending - Negative Amount (Refund)
````bash
curl -X POST http://localhost:3000/api/spending \
  -H "Content-Type: application/json" \
  -d '{
    "amount": -15.99,
    "category": "dining",
    "merchant": "Starbucks",
    "notes": "Refund for wrong order"
  }'
````

#### 5. Create Spending - Zero Amount
````bash
curl -X POST http://localhost:3000/api/spending \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 0,
    "category": "other",
    "notes": "Pending transaction"
  }'
````

#### 6. Get All Spending (200 OK)
````bash
curl http://localhost:3000/api/spending
````

**Expected Response:**
````json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "673...",
      "userId": {
        "_id": "691e5bb8367d68ed3a766bfd",
        "profile": {
          "firstName": "Demo"
        }
      },
      "amount": 45.99,
      "category": "dining",
      "merchant": "Starbucks",
      "date": "2025-11-15T00:00:00.000Z",
      "createdAt": "...",
      "updatedAt": "..."
    },
    // ... more entries
  ]
}
````

#### 7. Get All Spending - Filter by Category
````bash
# Get only dining expenses
curl "http://localhost:3000/api/spending?category=dining"

# Get only groceries
curl "http://localhost:3000/api/spending?category=groceries"

# Get only travel
curl "http://localhost:3000/api/spending?category=travel"
````

#### 8. Get All Spending - Filter by Date Range
````bash
# Get spending for November 2025
curl "http://localhost:3000/api/spending?startDate=2025-11-01&endDate=2025-11-30"

# Get spending from Nov 10 onwards
curl "http://localhost:3000/api/spending?startDate=2025-11-10"

# Get spending up to Nov 15
curl "http://localhost:3000/api/spending?endDate=2025-11-15"
````

#### 9. Get All Spending - Combine Filters
````bash
# Dining expenses in November
curl "http://localhost:3000/api/spending?category=dining&startDate=2025-11-01&endDate=2025-11-30"

# Groceries from Nov 10 onwards
curl "http://localhost:3000/api/spending?category=groceries&startDate=2025-11-10"
````

#### 10. Get Spending by ID (200 OK)
````bash
# Replace SPENDING_ID with actual ID from create response
curl http://localhost:3000/api/spending/673d1e2f3a4b5c6d7e8f9012
````

**Expected Response:**
````json
{
  "success": true,
  "data": {
    "_id": "673d1e2f3a4b5c6d7e8f9012",
    "userId": {
      "_id": "691e5bb8367d68ed3a766bfd",
      "profile": {
        "firstName": "Demo",
        "lastName": "User"
      }
    },
    "amount": 45.99,
    "category": "dining",
    "merchant": "Starbucks",
    "date": "2025-11-15T00:00:00.000Z",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
````

#### 11. Update Spending - Change Amount (200 OK)
````bash
curl -X PUT http://localhost:3000/api/spending/SPENDING_ID \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50.00
  }'
````

#### 12. Update Spending - Change Category
````bash
curl -X PUT http://localhost:3000/api/spending/SPENDING_ID \
  -H "Content-Type: application/json" \
  -d '{
    "category": "entertainment"
  }'
````

#### 13. Update Spending - Multiple Fields
````bash
curl -X PUT http://localhost:3000/api/spending/SPENDING_ID \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 55.50,
    "category": "dining",
    "merchant": "Chipotle",
    "notes": "Updated: lunch instead of breakfast"
  }'
````

#### 14. Update Spending - Add Missing Fields
````bash
curl -X PUT http://localhost:3000/api/spending/SPENDING_ID \
  -H "Content-Type: application/json" \
  -d '{
    "merchant": "Trader Joes",
    "cardUsed": "Amex Blue Cash"
  }'
````

#### 15. Delete Spending (200 OK)
````bash
curl -X DELETE http://localhost:3000/api/spending/SPENDING_ID
````

**Expected Response:**
````json
{
  "success": true,
  "message": "Spending deleted successfully"
}
````

---

### ❌ Invalid Requests (Error Cases)

#### 16. Create Spending - Missing Amount (400 Bad Request)
````bash
curl -X POST http://localhost:3000/api/spending \
  -H "Content-Type: application/json" \
  -d '{
    "category": "dining",
    "merchant": "Starbucks"
  }'
````

**Expected Response:**
````json
{
  "success": false,
  "message": "Amount and category are required"
}
````

#### 17. Create Spending - Missing Category (400 Bad Request)
````bash
curl -X POST http://localhost:3000/api/spending \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 45.99,
    "merchant": "Starbucks"
  }'
````

#### 18. Create Spending - Invalid Amount Type
````bash
curl -X POST http://localhost:3000/api/spending \
  -H "Content-Type: application/json" \
  -d '{
    "amount": "not-a-number",
    "category": "dining"
  }'
````

#### 19. Get Spending - Invalid ID Format (500 or 400)
````bash
curl http://localhost:3000/api/spending/invalid-id-format
````

#### 20. Get Spending - Non-existent ID (404 Not Found)
````bash
curl http://localhost:3000/api/spending/673d1e2f3a4b5c6d7e8f9999
````

**Expected Response:**
````json
{
  "success": false,
  "message": "Spending record not found"
}
````

#### 21. Update Spending - Non-existent ID (404 Not Found)
````bash
curl -X PUT http://localhost:3000/api/spending/673d1e2f3a4b5c6d7e8f9999 \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100
  }'
````

#### 22. Update Spending - Invalid ID Format
````bash
curl -X PUT http://localhost:3000/api/spending/not-a-valid-id \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100
  }'
````

#### 23. Delete Spending - Non-existent ID (404 Not Found)
````bash
curl -X DELETE http://localhost:3000/api/spending/673d1e2f3a4b5c6d7e8f9999
````

#### 24. Delete Spending - Invalid ID Format
````bash
curl -X DELETE http://localhost:3000/api/spending/invalid-id
````

---

## Testing Workflow (Recommended Order)

### Complete Flow Test

````bash
# 1. Register a user
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "test123",
    "firstName": "Test",
    "lastName": "User"
  }'
# Save the returned user ID

# 2. Create some spending entries
curl -X POST http://localhost:3000/api/spending \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 45.99,
    "category": "dining",
    "merchant": "Starbucks",
    "date": "2025-11-15"
  }'
# Save the returned spending ID

curl -X POST http://localhost:3000/api/spending \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 120.50,
    "category": "groceries",
    "merchant": "Whole Foods",
    "date": "2025-11-14"
  }'

# 3. Get all spending
curl http://localhost:3000/api/spending

# 4. Filter by category
curl "http://localhost:3000/api/spending?category=dining"

# 5. Get specific spending
curl http://localhost:3000/api/spending/YOUR_SPENDING_ID

# 6. Update spending
curl -X PUT http://localhost:3000/api/spending/YOUR_SPENDING_ID \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50.00,
    "notes": "Updated amount"
  }'

# 7. Delete spending
curl -X DELETE http://localhost:3000/api/spending/YOUR_SPENDING_ID

# 8. Verify deletion
curl http://localhost:3000/api/spending/YOUR_SPENDING_ID
# Should return 404
````

---



## Startup and development


For setup: 
First, get your mongodb connection string and save that into your environment or a `.env` file


Testing and run the server: `cd server && npm run dev`

`dev` entry point is from `src/index.js` which loads environment vairables and connect to mongoDB and starts express server

Right now, everything is being saved into `test` database and default collection for each model is their own name (Spending -> `spendings`).
This above is **DEFAULT BEHAVIOUR** if you want to change, specify your own db and table in connection string in environment

`index.js` file is responsible to connect using `db.js`. When you run `npm run dev`, you connect to `test` database and create respective 

## Models

We have two models right now:
- Spending
- User

- Card (just start)

## Controllers

Again two controller for each object:


- `spendingController.js`: 
   1. Hardcoded userID for now which is a reference to ID assigned by mongoDB to the object


- `userController.js`: 
   1. Contains only basic registration function without JWT token 
   2. No logic or updating user info or deletin account

## Routes

Describe where we can use which API

- `spending.js`:
   1. `POST /api/spending/`: Create a spending transaction into database
   2. GET /api/spending/
- `user.js`

