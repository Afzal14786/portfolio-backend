# Portfolio Dashboard API Documentation

## Overview

Complete REST API documentation for Portfolio Dashboard with dual authentication system (Admin & Public users) and OTP-based verification.

**Base URL**: `/api/v1`

**Interactive Documentation**: `/api-docs`

## Authentication Flow

All authentication operations use OTP (One-Time Password) verification sent via email.

### Registration Flow:

1. `POST /{user-type}-auth/register` - Submit registration details
2. Check email for OTP
3. `POST /{user-type}-auth/register/verify-otp` - Verify OTP to activate account

### Login Flow:

1. `POST /{user-type}-auth/login` - Submit credentials
2. Check email for OTP
3. `POST /{user-type}-auth/login/verify` - Verify OTP to get access token

## 📋 Test Results Summary

| Operation              | Status  | Notes                                                  |
| ---------------------- | ------- | ------------------------------------------------------ |
| ✅ Admin Registration  | Working | OTP sent successfully, user created after verification |
| ✅ Admin Login         | Working | OTP verification required for login                    |
| ✅ Public Registration | Working | Fixed enum validation for authProvider                 |
| ✅ Public Login        | Working | OTP verification working correctly                     |
| ✅ OTP Resend          | Working | Both registration and login OTP resend functional      |
| ✅ OTP Status Check    | Working | Can check active OTP status                            |
| ✅ Logout              | Working | Refresh token revoked successfully                     |

## 🚀 Complete API Endpoints

### 🔍 Health Checks

- **GET** `/` - API Root Health Check
- **GET** `/admin-auth` - Admin Auth Health Check
- **GET** `/public-auth` - Public Auth Health Check

### 👑 Admin Authentication

#### Registration

- **POST** `/admin-auth/register` - Register New Admin
- **POST** `/admin-auth/register/verify-otp` - Verify Admin Registration OTP
- **GET** `/admin-auth/registration-otp/status` - Check Admin Registration OTP Status
- **POST** `/admin-auth/registration-otp/resend` - Resend Admin Registration OTP

#### Login & Session

- **POST** `/admin-auth/login` - Admin Login Request
- **POST** `/admin-auth/login/verify` - Verify Admin Login OTP
- **POST** `/admin-auth/login/logout` - Admin Logout

#### OTP Operations (Authenticated)

- **POST** `/admin-auth/otp/resend` - Resend OTP for operations
- **GET** `/admin-auth/otp/status` - Check OTP Status

### 👥 Public User Authentication

#### Registration

- **POST** `/public-auth/register` - Register New Public User
- **POST** `/public-auth/register/verify-otp` - Verify Public User Registration OTP
- **GET** `/public-auth/registration-otp/status` - Check Public Registration OTP Status
- **POST** `/public-auth/registration-otp/resend` - Resend Public Registration OTP

#### Login & Session

- **POST** `/public-auth/login` - Public User Login Request
- **POST** `/public-auth/login/verify` - Verify Public User Login OTP
- **POST** `/public-auth/login/logout` - Public User Logout

#### OTP Operations (Authenticated)

- **POST** `/public-auth/otp/resend` - Resend OTP for operations
- **GET** `/public-auth/otp/status` - Check OTP Status

## 🚀 Quick Start Examples

### 1. Admin User Flow

- **a. Admin Registration OTP Status**  
  **Request Body**
  ```http
  GET /api/v1/admin-auth/registration-otp/status?email=admin@example.com&type=registration
  Content-Type: application/json
  ```
- **Response Body**  

  ```json
    {
      "success": true,
      "data": {
        "exists": false,
        "email": "admin@gmail.com",
        "type": "registration",
        "userType": "admin",
        "message": "No active OTP found"
      }
    }
  ```

- **b. Admin Registration**

  ```http
  POST /api/v1/admin-auth/register
  Content-Type: application/json
  ```
  **Request Body**
  ```json
  {
    "name": "Admin User",
    "user_name": "adminuser",
    "email": "admin@example.com",
    "password": "password123"
  }
  ```
  **Response body**
  ```json
  {
    "message": "Admin registration successful! Please check your email to verify your account.",
    "success": true,
    "data": {
      "email": "admin@example.com",
      "userType": "admin",
      "expiresIn": 600
    }
  }
  ```

  **Verify The OTP**
  ```http
  POST /api/v1/admin-auth/register/verify-otp
  Content-Type: application/json
  ```

  **Request Body**
  ```json
  {
    "email": "admin@example.com",
    "otp": "123456" 
  }
  ```

  **Response Body**
  ```json
    {
    "message": "Admin account verified and registered successfully",
    "success": true,
    "data": {
      "user": {
        "id": "64a1b2c3d4e5f67890123456",
        "user_name": "adminuser",
        "email": "admin@example.com",
        "role": "Admin",
        "userType": "admin",
        "isVerified": true,
        "isActive": true
      },
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```

- **c. Login Admin** 
  ```http
  POST /api/v1/admin-auth/login
  Content-Type: application/json
  ```

  **Request Body**
  ```json
  {
    "email": "admin@example.com",
    "password": "password123"
  }
  ```

  **Response Body**
  ```json
  {
    "message": "OTP sent to your email. Please verify to continue.",
    "success": true,
    "data": {
      "email": "admin@example.com",
      "userType": "admin",
      "expiresIn": 120
    }
  }
  ```

  **Verify Login OTP**
  ```http
  POST /api/v1/admin-auth/login/verify
  Content-Type: application/json
  ```
  **Request Body**
  ```json
  {
    "email": "admin@example.com",
    "otp": "123456" 
  }
  ```

  **Response Body**
  ```json
  {
    "message": "Admin login verified successfully",
    "success": true,
    "data": {
      "user": {
        "_id": "64a1b2c3d4e5f67890123456",
        "name": "Admin User",
        "email": "admin@example.com",
        "role": "Admin",
        "userType": "admin",
        "isVerified": true,
        "isActive": true,
        "lastLogin": "2024-01-15T10:30:00.000Z"
      },
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```

<!-- Admin's More Features Like " Update OR Reset Password, Update Profile Like {Name, Email, etc...}-->


### 2. Public User Flow

- **a. Public Registration Status**
  ```http
  GET /api/v1/public-auth/registration-otp/status?email=user@example.com&type=registration
  Content-Type: application/json
  ```

  **Response Body**
  ```json
  {
    "success": true,
    "data": {
      "exists": false,
      "email": "user@example.com",
      "type": "registration",
      "userType": "public",
      "message": "No active OTP found"
    }
  }
  ```

- **b. Register Public User**
  
  ```http
  POST /api/v1/public-auth/register
  Content-Type: application/json
  ```
  **Request Body**
  ```json
  {
    "name": "Public User",
    "user_name": "publicuser",
    "email": "user@example.com",
    "password": "password123"
  }
  ```
  **Response Body**
  ```json
  {
    "message": "Registration successful! Please check your email to verify your account.",
    "success": true,
    "data": {
      "email": "user@example.com",
      "userType": "public",
      "expiresIn": 600
    }
  }
  ```

  **Verify Public Registration OTP**
  ```http
  POST /api/v1/public-auth/register/verify-otp
  Content-Type: application/json
  ```

  **Request Body**
  ```json
  {
    "email": "user@example.com",
    "otp": "123456"
  }
  ```

  **Response Body**
  ```json
    {
    "message": "Account verified and registered successfully",
    "success": true,
    "data": {
      "user": {
        "id": "64a1b2c3d4e5f67890123457",
        "user_name": "publicuser",
        "email": "user@example.com",
        "role": "public",
        "userType": "public",
        "isVerified": true,
        "isActive": true
      },
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```

- **c. Public User Login**
  ```http
  POST /api/v1/public-auth/login
  Content-Type: application/json
  ```
  **Request Body**
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

  **Response Body**
  ```json
  {
    "message": "OTP sent to your email. Please verify to continue.",
    "success": true,
    "data": {
      "email": "user@example.com",
      "userType": "public",
      "expiresIn": 120
    }
  }
  ```

  **Verify Public Login OTP**
  ```http
  POST /api/v1/public-auth/login/verify
  Content-Type: application/json
  ```
  
  **Requested Body**
  ```json
  {
    "email": "user@example.com",
    "otp": "123456"
  }
  ```

  **Response Body**
  ```json
  {
    "message": "Login verified successfully",
    "success": true,
    "data": {
      "user": {
        "_id": "64a1b2c3d4e5f67890123457",
        "name": "Public User",
        "email": "user@example.com",
        "role": "public",
        "userType": "public",
        "isVerified": true,
        "isActive": true
      },
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```


## 🔐 Security Features

- **OTP Verification:** All critical operations require email OTP verification
- **JWT Tokens:** Access tokens for authenticated requests
- **HTTP-only Cookies:** Refresh tokens stored securely
- **Password Hashing:** BCrypt with salt rounds 12
- **Rate Limiting:** OTP resend cooldown (20 seconds)
- **Account Locking:** 3 failed attempts lock account for 15 minutes

## 📊 OTP Types Supported

### For Both Admin & Public:

- `registration` - User registration
- `login` - User login
- `password_reset` - Password reset requests
- `password_update` - Password update requests

### Admin Only:

- `blog_management` - Blog Management

## 🛡️ Error Handling

Common error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

**Common HTTP Status Codes:**

- `200` - Success
- `400` - Validation error / Invalid OTP
- `401` - Invalid credentials
- `403` - Unauthorized OTP type
- `404` - User not found
- `409` - User already exists
- `423` - Account locked
- `500` - Internal server error

## 🔧 Testing Tips

1. Use different emails for admin and public user testing
2. Check server logs for OTP values during development
3. Password requirements: Minimum 8 characters
4. Username requirements: 3-20 characters, alphanumeric + underscore only
5. Save access tokens from login responses for authenticated requests

## 📝 Example Requests

### Authenticated Request:

```http
POST /admin-auth/otp/resend
Content-Type: application/json
Authorization: Bearer your_access_token_here

{
  "type": "password_reset"
}
```

### Check OTP Status:

```http
GET /admin-auth/otp/status?type=password_reset
Authorization: Bearer your_access_token_here
```

## 🎯 Success Responses

### Registration Success:

```json
{
  "message": "Admin registration successful! Please check your email to verify your account.",
  "success": true,
  "data": {
    "email": "admin@example.com",
    "userType": "admin",
    "expiresIn": 600
  }
}
```

### Login Success:

```json
{
  "message": "Admin login verified successfully",
  "success": true,
  "data": {
    "user": {
      "_id": "64a1b2c3d4e5f67890123456",
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "Admin",
      "userType": "admin",
      "isVerified": true,
      "isActive": true
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Last Updated: Nov 9, 2025

### Maintainer: Md Afzal Ansari
