# 🌐 Portfolio Backend API

## 🚀 Overview

This repository houses the robust backend API built for my personal portfolio. Its primary function is to serve as a secure content management system for the admin dashboard and provide fast, publicly accessible endpoints for the main portfolio website (Landing Page).

The API is built following RESTful principles, ensuring clear separation of concerns and maintainability.

### 💻 Technology Stack

| **Component** | **Technology** | **Notes** | 
| :--- | :--- | :--- |
| **Runtime** | Node.js | Asynchronous, event-driven JavaScript runtime environment. | 
| **Framework** | Express.js | Fast, unopinionated, minimalist web framework for Node.js. | 
| **Language** | JavaScript (JS) | Backend logic is written in pure JavaScript for deployment efficiency. | 
| **Database** | MongoDB / Mongoose | Flexible NoSQL database for content storage and Mongoose for schema management. | 

---

## ✨ Detailed Features

The backend supports two main functional areas: **Authentication & Profile Management** and **Content Management**.

### 1. Authentication & Profile Management

This module handles user identity and administrative profile updates.

| **Feature** | **Description** | **Key Routes** | 
| :--- | :--- | :--- |
| **Registration** | Secure user sign-up requiring **Full Name**, **Username**, and a **Strong Password**. Uses **OTP Verification** sent via email for confirmation. | `/user/register`, `/user/verify-otp` | 
| **Login** | Supports standard email/password login as well as third-party authentication via **GitHub** and **Google** for streamlined access. | `/user/login`, `/user/social-login` | 
| **Password Management** | Provides protected endpoints for updating the password from the dashboard and a secure mechanism for resetting a forgotten password via email link. | `/user/update-password`, `/user/reset-password` | 
| **Profile CRUD** | The admin can add or modify their **Profile Picture**, **Banner Picture**, **Resume** (PDF), and manage an array of **Social Media Links** and **Hobbies**. | `/user/profile`, `/user/profile/update` | 

### 2. Content Management (CRUD)

All dynamic content displayed on the portfolio site is managed via dedicated endpoints, ensuring real-time updates.

| **Content Model** | **Description** | **Primary Routes** | 
| :--- | :--- | :--- |
| **Projects** | Full CRUD for portfolio projects, including retrieval of all projects and individual project details. | `/user/project/all-projects`, `/user/project/:id` | 
| **Blogs** | Complete management system for blog posts. **The API must support an auto-save/draft feature** (e.g., frequent `PUT` requests) while the user writes content. | `/user/blogs/all-blogs`, `/user/blogs/:id` | 
| **Skills** | Management of a list of technical skills. The dashboard handles adding, editing, and deleting individual skills, then sends the updated array for a single API `PUT` operation. | `/user/skills/all-skills`, `/user/skills` | 
| **Certificates** | CRUD functionality for official certifications and achievements. | `/user/certificates/all-certificates`, `/user/certificates/:id` | 
| **Reading Resources** | Management of external reading links (an array of objects). The full array is typically managed in one update request (`PUT`). | `/user/reading-resources/all` | 
| **Timelines** | CRUD for "My Journey" entries, detailing professional or personal milestones. | `/user/timelines/all`, `/user/timelines/:id` | 
| **Inquiries** | Endpoint for the public frontend to send messages (contact form) and a protected endpoint for the admin to retrieve them. | `/messages`, `/messages/all` | 

---

## 🏗️ System Workflow (Conceptual)

The backend operates under a controlled access flow to maintain security and integrity.

| **Step** | **Actor** | **Action** | **Result/Security** |
| :--- | :--- | :--- | :--- |
| **1. Registration** | New User | POST `/api/user/register` | Sends OTP to Email for confirmation. |
| **2. Login** | Admin User | POST `/api/user/login` | Returns **Auth Token** (JWT). |
| **3. Content Access**| Admin User | GET/POST/PUT/DELETE `/api/user/...` | Requires **Bearer Token** in the Authorization Header. |
| **4. Public Fetch** | Public Site | GET `/api/public/data` | Unauthenticated requests for displaying content. |
| **5. Contact** | Public Visitor | POST `/api/messages` | Saves message to database for admin review. |

---

## 🛠️ API Reference

All protected endpoints require an `Authorization: Bearer [TOKEN]` header.

| **Feature** | **Method** | **Route** | **Protected** | **Description** | 
| :--- | :--- | :--- | :--- | :--- |
| **Registration** | `POST` | `/api/user/register` | ❌ | Registers user and sends OTP. | 
| **Login** | `POST` | `/api/user/login` | ❌ | Authenticates user and issues JWT token. | 
| **Get Profile** | `GET` | `/api/user/profile` | ✅ | Retrieves logged-in user profile data. | 
| **Update Profile** | `PUT` | `/api/user/profile/update` | ✅ | Updates profile details and uploads files (images/resume). | 
| **Project CRUD** | `POST/PUT/DELETE` | `/api/user/project/:id` | ✅ | Create, Update, or Delete a single project. | 
| **Blog CRUD** | `POST/PUT/DELETE` | `/api/user/blogs/:id` | ✅ | Create, Update, or Delete a single blog post. | 
| **Update Skills** | `PUT` | `/api/user/skills` | ✅ | Overwrites the entire skills array with the new list. | 
| **Get Messages** | `GET` | `/api/messages/all` | ✅ | Retrieves all contact messages. | 

---

## 🧪 Testing Examples

Use **cURL** or a similar tool to test core functionality. Replace `[BASE_URL]` with your server's address.

### 1. User Login

**A. Request: User Login**

```bash
curl -X POST "[BASE_URL]/api/user/login" \
-H "Content-Type: application/json" \
-d '{
    "email": "dev@example.com",
    "password": "Secure!Password123"
}'  
```  

**B. Expected Response (Login Success)**  

```bash
{
    "success": true,
    "message": "Login successful.",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NmQyYzFlOGY3YTlkMGIzYzRlNWE2YjciLCJpYXQiOjE2ODg5ODc3ODR9.S1Q2R3Q4VzlYMGYxQTIiVnMyUTZ2YkE",
    "username": "devuser"
}
```
 
### 2. Protected Route: Create New Blog Post  

> Note: Use the token received from the login step in the Authorization header.  

**A. Request: Create Blog Post**  
```bash
curl -X POST "[BASE_URL]/api/user/blogs" \
-H "Content-Type: application/json" \
-H "Authorization: Bearer [YOUR_AUTH_TOKEN]" \
-d '{
    "title": "My First Backend Blog",
    "content": "This post details the API implementation of my portfolio.",
    "tags": ["NodeJS", "Express", "MongoDB"]
}'
```  

**B. Expected Response (Content Creation Success)**  
```bash
{
    "success": true,
    "message": "Blog post created successfully.",
    "blogId": "99d2c1e8f7a9d0b3c4e5a6b7",
    "title": "My First Backend Blog"
}
```