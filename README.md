# 🌐 Integrated Portfolio And Blog Management System -- Backend

## 🚀 Overview

This repository houses the robust backend API built for my personal portfolio and integrated blog management system. Its primary function is to serve as a secure blog management system for the admin dashboard and provide fast, publicly accessible endpoints for the main portfolio website. In the main website public users are able to `view`, `read`, `like` and `comment` in the blog . 

The API is built following RESTful principles with dual authentication system `(Admin & Public users)` and `OTP-based verification` for enhanced security.

### 📚 API Documentation

**Interactive Swagger UI**: [`http://localhost:8080/api-docs`](http://localhost:8080/api-docs)

**Base URL**: `http://localhost:8080/api/v1`

### 💻 Technology Stack

| **Component** | **Technology** | **Notes** |
| :--- | :--- | :--- |
| **Runtime** | Node.js | Asynchronous, event-driven JavaScript runtime environment. |
| **Framework** | Express.js | Fast, unopinionated, minimalist web framework for Node.js. |
| **Language** | JavaScript (JS) | Backend logic is written in pure JavaScript for deployment efficiency. |
| **Database** | MongoDB / Mongoose | Flexible NoSQL database for content storage and Mongoose for schema management. |
| **Documentation** | OpenAPI 3.0 | Comprehensive API documentation with Swagger UI |

---

## ✨ Core Features

### 🔐 Dual Authentication System

| **User Type** | **Features** | **OTP Verification** |
| :--- | :--- | :--- |
| **Admin Users** | Full dashboard access, content management, user management | Registration, Login, Password Reset, Email Update |
| **Public Users** | Portfolio access, contact forms, blog reading | Registration, Login, Password Reset |

### 📊 Authentication Flow

**Registration Flow:**
1. `POST /{user-type}-auth/signup/register` - Submit registration details
2. Check email for OTP
3. `POST /{user-type}-auth/signup/verify-otp` - Verify OTP to activate account

**Login Flow:**
1. `POST /{user-type}-auth/signin/login` - Submit credentials
2. Check email for OTP
3. `POST /{user-type}-auth/signin/verify` - Verify OTP to get access token

### 🛡️ Security Features
- **OTP Verification** for all critical operations
- **JWT Tokens** with HTTP-only cookies for refresh tokens
- **BCrypt Password Hashing** with salt rounds 12
- **Rate Limiting** and account locking mechanisms
- **CORS Protection** with configurable origins

---

## 🏗️ API Architecture

### 📍 Endpoint Structure
-   `http://localhost:8080/api/v1/{category}/{endpoint}`


### 🔄 System Workflow

| **Step** | **Actor** | **Action** | **API Route** |
| :--- | :--- | :--- | :--- |
| **1. Health Check** | Any User | `GET /` | API status verification |
| **2. Admin Registration** | New Admin | `POST /admin-auth/signup/register` | OTP sent to email |
| **3. OTP Verification** | New Admin | `POST /admin-auth/signup/verify-otp` | Account activation |
| **4. Admin Login** | Admin User | `POST /admin-auth/signin/login` | OTP sent to email |
| **5. Login Verification** | Admin User | `POST /admin-auth/signin/verify` | JWT token issued |
| **6. Content Management** | Admin User | Various protected routes | Bearer token required |
| **7. Public Access** | Public Site | Public routes | Unauthenticated access |

---

## 🎯 Quick Start Guide

### 1. Health Checks
```bash
# API Root
curl http://localhost:8080/api/v1/

# Admin Auth Status
curl http://localhost:8080/api/v1/admin-auth

# Public Auth Status  
curl http://localhost:8080/api/v1/public-auth
``` 

### 2. Admin Registration & Login

```bash
# 1. Register Admin
curl -X POST http://localhost:8080/api/v1/admin-auth/signup/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "user_name": "adminuser", 
    "email": "admin@example.com",
    "password": "password123"
  }'

# 2. Verify OTP (check email for code)
curl -X POST http://localhost:8080/api/v1/admin-auth/signup/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "otp": "123456"
  }'

# 3. Login
curl -X POST http://localhost:8080/api/v1/admin-auth/signin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'

# 4. Verify Login OTP
curl -X POST http://localhost:8080/api/v1/admin-auth/signin/verify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com", 
    "otp": "123456"
  }'
```

### 3. Public User Flow
```bash
# Register Public User
curl -X POST http://localhost:8080/api/v1/public-auth/signup/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Public User",
    "user_name": "publicuser",
    "email": "user@example.com",
    "password": "password123"
  }'
```

## 📋 API Categories 

### 🔍 Health Checks
-   `GET /` - API Root Health Check
-   `GET /admin-auth` - Admin Auth Status
-   `GET /public-auth` - Public Auth Status

### 👑 Admin Authentication
-   `POST /admin-auth/signup/register` - Register new admin
-   `POST /admin-auth/signup/verify-otp` - Verify registration OTP
-   `POST /admin-auth/signin/login` - Admin login request
-   `POST /admin-auth/signin/verify` - Verify login OTP
-   `POST /admin-auth/signin/logout` - Admin logout
-   `GET /admin-auth/auth-otp/status` - Check OTP status
-   `POST /admin-auth/auth-otp/resend` - Resend OTP

### 👥 Public Authentication
-   `POST /public-auth/signup/register` - Register public user
-   `POST /public-auth/signup/verify-otp` - Verify registration OTP
-   `POST /public-auth/signin/login` - Public user login
-   `POST /public-auth/signin/verify` - Verify login OTP
-   `POST /public-auth/login/logout` - Public user logout

### 🔧 OTP Operations
-   `POST /admin-auth/otp/resend` - Resend OTP (Admin)
-   `GET /admin-auth/otp/status` - Check OTP status (Admin)
-   `POST /public-auth/otp/resend` - Resend OTP (Public)
-   `GET /public-auth/otp/status` - Check OTP status (Public)

---

## 🛡️ Security & Authentication

### Required Headers for Protected Routes
```http
Authorization: Bearer your_jwt_token_here
Content-Type: application/json
```

### OTP Types Supported
**For Both Admin & Public:**
-   `registration` - User registration
-   `login` - User login
-   `email_update` - Email change verification
-   `password_reset` - Password reset requests
-   `password_change` - Password change requests

**Admin Only:**
-   `blog_management` - Blog Management

---

## 🧪 Testing & Development

### Testing Tips
1. Use different emails for admin and public user testing
2. Check server logs for OTP values during development
3. Password requirements: Minimum 8 characters
4. Username requirements: 3-20 characters, alphanumeric + underscore only

### Example Authenticated Request
```bash
# Check OTP status (requires authentication)
curl -X GET "http://localhost:8080/api/v1/admin-auth/otp/status?type=password_reset" \
  -H "Authorization: Bearer your_access_token_here"
```

### Success Response Format
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "user": {
      "name": "Admin User",
      "email": "admin@example.com",
      "userType": "admin"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 🔗 Useful Links

-   🔄 Live API: `http://localhost:8080/api/v1`
-   📚 Interactive Docs: `http://localhost:8080/api-docs`
-   ❤️ Health Check: `http://localhost:8080/health`

--- 
*__Maintainer__: Md Afzal Ansari*  
*__Email__: mdafzal14777@gmail.com*

--- 
*Last Updated: Nov 9, 2025*
