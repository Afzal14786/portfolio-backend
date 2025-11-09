# Portfolio Dashboard API Documentation

## Overview

Complete REST API documentation for Portfolio Dashboard with dual authentication system (Admin & Public users) and OTP-based verification.

**Base URL**: `http://localhost:8080/api/v1`

**Interactive Documentation**: `http://localhost:8080/api-docs`

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

```http
// 1. Check registration status
GET /admin-auth/registration-otp/status?email=admin@example.com&type=registration

// 2. Register admin
POST /admin-auth/register
{
  "name": "Admin User",
  "user_name": "adminuser",
  "email": "admin@example.com",
  "password": "password123"
}

// 3. Verify OTP (from email)
POST /admin-auth/register/verify-otp
{
  "email": "admin@example.com",
  "otp": "123456"
}

// 4. Login
POST /admin-auth/login
{
  "email": "admin@example.com",
  "password": "password123"
}

// 5. Verify login OTP
POST /admin-auth/login/verify
{
  "email": "admin@example.com",
  "otp": "123456"
}
```

### 3. Public User Flow

```javascript
// 1. Register public user
POST /public-auth/register
{
  "name": "Public User",
  "user_name": "publicuser",
  "email": "user@example.com",
  "password": "password123"
}

// 2. Verify OTP
POST /public-auth/register/verify-otp
{
  "email": "user@example.com",
  "otp": "123456"
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
