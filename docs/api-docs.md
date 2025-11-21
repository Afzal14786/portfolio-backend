# Portfolio Dashboard API Documentation

## Overview

Complete REST API documentation for Portfolio Dashboard with dual authentication system (Admin & Public users) and OTP-based verification.

**Base URL**: `http://localhost:8080/api/v1`  
**Health Check**: `GET /` - API status and endpoints overview  
**Interactive Documentation**: `/api-docs`   

## 🏥 API Health Check Endpoints  
| Endpoint | Method | Description | Authentication |
|----------|---------|-------------|----------------|
| `/` | GET | Main API health check | None |
| `/admin` | GET | Admin API health check | None |
| `/admin/auth` | GET | Auth service health | None |
| `/admin/blogs` | GET | Blog service health | Required |
| `/admin/profile` | GET | Profile service health | Required |
| `/admin/password` | GET | Password service health | None |
| `/admin/email` | GET | Email service health | None | 
  


## Authentication Flow

All authentication operations use OTP (One-Time Password) verification sent via email.

### Registration Flow:

1. `POST /{user_type}/auth/signup` - Submit registration details
2. Check email for OTP (valid for 10 minutes)
3. `POST /{user_type}/auth/signup/verify-otp` - Verify OTP to activate account

### Login Flow:

1. `POST /{user_type}/auth/signin` - Submit credentials  
2. Check email for OTP (valid for 10 minutes)
3. `POST /{user_type}/auth/signin/verify` - Verify OTP to get access token

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

### 👑 {user_type} Authentication

#### Registration

- **POST** `/{user_type}/signup` - Register New Admin
- **POST** `/{user_type}/signup/verify-otp` - Verify Admin Registration OTP
- **GET** `/{user_type}/auth-otp/status` - Check Admin Registration OTP Status
- **POST** `/{user_type}/auth-otp/resend` - Resend Admin Registration OTP

#### Login & Session

- **POST** `/{user_type}/auth/signin` - Admin login request
- **POST** `/{user_type}/auth/signin/verify` - Verify login OTP
- **POST** `/{user_type}/auth/otp/resend` - Resend OTP for operations
- **GET** `/{user_type}/auth/otp/status` - Check OTP status

#### OTP Operations (Authenticated)

- **POST** `/{user_type}/otp/resend` - Resend OTP for operations
- **GET** `/{user_type}/otp/status` - Check OTP Status  


### Resetting The Password For {user_type} (Un-Authenticated)
- **POST** `/{user_type}/password/reset/request` - Requesting For Password Reset token --reset link send over the registered email
- **POST** `/{user_type}/password/reset/verify` - Verify the token

### 🔧 {user_type} Profile Updates (All Require Authentication)  
#### File Upload Endpoints
- **PATCH** `/{user_type}/profile/image` -  Update profile image
- **PATCH** `/{user_type}/profile/banner` -  Update banner image
- **PATCH** `/{user_type}/profile/resume` -  Update resume

#### Data Update Endpoints
- **PATCH** `/{user_type}/profile/social-media` -  Update social_media
- **PATCH** `/{user_type}/profile/reading-resources` -  Update reading-resources
- **PATCH** `/{user_type}/profile/quote` -  Update Quote
- **PATCH** `/{user_type}/profile/hobbies` -  Update Hobbies
- **PATCH** `/{user_type}/profile/basic-info` -  Update name & username
- **PATCH** `/{user_type}/profile/bulk-update` -  Bulk update multiple fields 

#### Security Endpoints For Password & Email Update
- **POST** `/{user_type}/password/update/request` -  Request password update -- for authenticate user only
- **POST** `/{user_type}/password/update/verify-otp` -  Verify OTP and update password -- for authenticate user only
- **POST** `/{user_type}/update_email/request-update` -  Request for email update -- OTP Sent -- for authenticate user only
- **POST** `/{user_type}/update_email/verify-otp` -  Verify OTP and update email

### 📝 Blog Management (`/admin/blogs`)  

#### Analytics & Stats  
- **GET** `/admin/blogs/stats` - Dashboard statistics
- **GET** `/admin/blogs/analytics/:blogId` - Blog-specific analytics  

#### Blog CRUD Operations  

- **GET** `/admin/blogs` - Get all admin's blogs
- **GET** `/admin/blogs/:id` - Get blog by ID
- **POST** `/admin/blogs` - Create new blog
- **POST** `/admin/blogs/draft` - Create draft
- **POST** `/admin/blogs/:blogId/auto-save` - Auto-save draft
- **PUT** `/admin/blogs/:id` - Update blog
- **PATCH** `/admin/blogs/:id/status` - Update blog status
- **DELETE** `/admin/blogs/:id` - Delete blog

#### Content Management  
- **POST** `/admin/blogs/:blogId/images` - Upload blog image  

### 👤 Profile Management (`/admin/profile`)  

#### File Uploads  
- **PATCH** `/admin/profile/update/image` - Update profile image
- **PATCH** `/admin/profile/update/banner` - Update banner image  
- **PATCH** `/admin/profile/update/resume` - Update resume

#### Data Updates  
- **PATCH** `/admin/profile/update/social-media` - Update social media
- **PATCH** `/admin/profile/update/reading-resources` - Update reading resources
- **PATCH** `/admin/profile/update/quote` - Update personal quote
- **PATCH** `/admin/profile/update/hobbies` - Update hobbies
- **PATCH** `/admin/profile/update/basic-info` - Update name & username
- **PATCH** `/admin/profile/update/bulk-update` - Bulk update

#### Profile Info  
- **GET** `/admin/profile/info` - Get profile information  

### 🔒 Security Management  

#### Password Management (`/{user_type}/password`)
- **POST** `/{user_type}/password/reset/request` - Forgot password (no auth)
- **POST** `/{user_type}/password/reset/verify-otp` - Verify reset OTP (no auth)
- **POST** `/{user_type}/password/update/request` - Password update request (auth)
- **POST** `/{user_type}/password/update/verify-otp` - Verify update OTP (auth)  

#### Email Management (`/admin/email`)  
- **POST** `/{user_type}/email/request-update` - Request email update (auth)
- **POST** `/{user_type}/email/verify-otp` - Verify email OTP (auth) 

## 🌐 Public Routes  

### Blog Portfolio (`/blogs`)
- **GET** `/blogs` - Get all published blogs
- **GET** `/blogs/:slug` - Get blog by slug 


## 🚀 Quick Start Examples

### 1. {user_type} Registration & Login Flow

- **Register {user_type}:**
  ```http
  POST /api/v1/{user_type}-auth/signup
  Content-Type: application/json

  {
    "name": "{user_type}",
    "user_name": "adminuser",
    "email": "admin@example.com",
    "password": "password123"
  }
  ```
- **Verify Registration OTP:**  
  ```http
  POST /api/v1/{user_type}-auth/signup/verify-otp
  Content-Type: application/json

  {
    "email": "admin@example.com",
    "otp": "123456"
  }
  ```

- **{user_type} Login:**

  ```http
  POST /api/v1/{user_type}-auth/signin
  Content-Type: application/json

  {
    "email": "admin@example.com", 
    "password": "password123"
  }
  ```
  **Verify Login OTP:**
  ```http
  POST /api/v1/{user_type}-auth/signin/verify
  Content-Type: application/json

  {
    "email": "admin@example.com",
    "otp": "123456"
  }
  ```

### 2. Blog Creation (Authenticated)  
```http
POST /api/v1/admin/blogs
Authorization: Bearer your_access_token
Content-Type: application/json
{
  "title": "My First Blog Post",
  "content": "Blog content here...",
  "topic": "Technology",
  "tags": ["javascript", "nodejs"],
  "status": "draft"
}
```

### 3. Profile Image Upload  
```http
PATCH /api/v1/admin/profile/update/image
Authorization: Bearer your_access_token
Content-Type: multipart/form-data

[FormData with profile_image file]
```

### File Upload Specifications  
| File Type      | Formats                 | Size Limit | Notes                |
|----------------|--------------------------|------------|----------------------|
| Profile Image  | JPEG, PNG, WebP, GIF     | 5MB        | 1:1 aspect ratio     |
| Banner Image   | JPEG, PNG, WebP, GIF     | 5MB        | 16:9 aspect ratio    |
| Resume         | PDF, DOC, DOCX           | 5MB        | -                    |
| Blog Images    | JPEG, PNG, WebP, GIF     | 5MB        | Auto WebP conversion |


### Response Format  
**Success:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { /* response data */ },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```



### 4. {user_type} Profile Management Examples 

#### Update Profile Image (Authenticated):
```http
PATCH /api/v1/{user_type}/profile/image
Authorization: Bearer your_access_token
Content-Type: multipart/form-data

[FormData with profile_image file]
```

#### Update Social Media Links:
```http
PATCH /api/v1/{user_type}/profile/social-media
Authorization: Bearer your_access_token
Content-Type: application/json

{
  "socialMedia": {
    "github": "https://github.com/username",
    "linkedin": "https://linkedin.com/in/username",
    "twitter": "https://twitter.com/username"
  }
}
```

#### Update Password:
```http
POST /api/v1/{user_type}/update_password
Authorization: Bearer your_access_token
Content-Type: application/json

{
  "oldPassword": "currentpassword",
  "newPassword": "newpassword123"
}
```

#### Verify Password OTP:
```http
POST /api/v1/{user_type}/verify-password-otp
Authorization: Bearer your_access_token  
Content-Type: application/json

{
  "otp": "123456"
}
```

#### Update Email:
```http
POST /api/v1/{user_type}/update_email/request-update
Authorization: Bearer your_access_token
Content-Type: application/json

{
  "newEmail": "newemail@example.com"
}
```

#### Verify Email OTP:
```http
POST /api/v1/{user_type}/update_email/verify-otp
Authorization: Bearer your_access_token
Content-Type: application/json

{
  "newEmail": "newemail@example.com",
  "otp": "123456"
}
```

### 📊 OTP Types Supported
#### Authentication OTP Types:
- `registration` - {user_type} registration
- `login` - {user_type} login

#### Security OTP Types:
- `password_update` - Password update requests
- `email_update` - Email update requests

### 🔐 Security Features

| Security Layer | Technology Used | Configuration |
|---------------|----------------|---------------|
| **Authentication** | JWT Tokens + OTP | Email verification for critical operations |
| **Password Security** | BCrypt Hashing | 12 salt rounds |
| **Account Protection** | Automatic Locking | 3 failed attempts → 15 min lock |
| **File Security** | Type & Size Validation | MIME type checking + 5MB limit |

### 🛡️ File Upload Specifications

| File Type | Supported Formats | Size Limit | Validation |
|-----------|------------------|------------|------------|
| **Profile Images** | JPEG, JPG, PNG, WebP | 5MB | MIME type + dimensions |
| **Banner Images** | JPEG, JPG, PNG, WebP | 5MB | MIME type + dimensions |
| **Resume/Documents** | PDF, DOC, DOCX | 5MB | MIME type check |

### 📝 Response Formats
#### Success Response:
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { /* response data */ }
}
```

#### Error Response:
```json
{
  "success": false, 
  "message": "Error description",
  "error": "Detailed error message" // In development
}
```

#### Admin Only:

- `blog_management` - Blog Management  

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

### Last Updated: Nov 21, 2025

### Maintainer: Md Afzal Ansari