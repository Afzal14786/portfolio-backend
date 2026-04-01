# 🌐 Integrated Portfolio And Blog Management System -- Backend

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)
![Swagger](https://img.shields.io/badge/-Swagger-%23Clojure?style=for-the-badge&logo=swagger&logoColor=white)

This repository contains the **RESTful API Core Engine** for the Integrated Portfolio & Blog Management System. Built on a highly scalable MVC architecture, it securely serves data to both the Public Client Frontend and the Secure Admin Dashboard.

---

## 🎯 Key Technical Achievements

- **Advanced Security & Auth:** Implements a robust JWT (JSON Web Token) strategy utilizing both **Access and HTTP-Only Refresh Tokens**. Includes Nodemailer-powered OTP (One Time Password) email verification for registration and password resets.
- **High-Performance Caching:** Integrates **Redis** to cache frequently accessed public data (like the active portfolio profile and published blogs), drastically reducing MongoDB query loads and latency.
- **Enterprise Media Management:** Completely decoupled from local file storage. Uses `Multer` combined with the `Cloudinary` API to securely upload, optimize, and serve images (avatars, banners, blog covers, certificates).
- **Complex Relational NoSQL:** Utilizes Mongoose to create a highly relational document structure. Blogs are intrinsically linked to dynamic references for Comments, Likes, Shares, and Author Profiles.
- **Modular Service-Oriented Architecture:** Business logic is abstracted out of controllers into a dedicated `services` layer (e.g., `email.service.js`, `otp.service.js`), making the codebase highly testable and maintainable.
- **Comprehensive API Documentation:** Includes integrated **Swagger UI** for beautiful, interactive API endpoint documentation and testing.

---

## 🛠️ Technology Stack

| Technology | Purpose |
| :--- | :--- |
| **Node.js & Express** | Core runtime and web application framework for handling routing and HTTP requests. |
| **MongoDB & Mongoose** | Primary NoSQL database and Object Data Modeling (ODM) library. |
| **Redis** | In-memory data structure store used for high-speed API response caching. |
| **JWT & Bcrypt** | Secure password hashing and stateless session management. |
| **Cloudinary** | Cloud-based image and video management service. |
| **Nodemailer** | SMTP client for sending transactional emails (Welcome, OTP, Password Reset). |
| **Swagger (OpenAPI)** | Auto-generated interactive API documentation interface. |

---

## 📂 System Architecture

The application strictly adheres to a **Controller-Service-Model** pattern, ensuring separation of concerns and preventing "fat controllers."

```text
src/
├── config/               # Database, Cloudinary, Redis, and Passport configurations
├── controllers/          # Request/Response handlers (Admin, Public, Blog, Portfolio)
├── emails/               # Nodemailer setup and dynamic HTML Email Templates
├── middlewares/          # Auth guards, Error Handlers, and Multer upload intercepts
├── models/               # Mongoose Database Schemas (User, Blog, Comments, Journey, etc.)
├── routes/               # API endpoint definitions (Public vs. Protected paths)
├── schemas/              # Input validation schemas (Preventing bad data ingestion)
├── services/             # Reusable business logic (Auth, Email, OTP logic)
└── utils/                # Helper functions (Token generation, URL formatting)
docs/
└── swagger.yaml          # OpenAPI specification file
app.js                    # Express app initialization and global middleware
index.js                  # Application entry point and server listener
```  

## 🗄️ Database Entity Relationship Overview  
While MongoDB is NoSQL, this system utilizes advanced Mongoose `ref` populations to maintain relational integrity:  

* **Admin User** (`user.model`): Holds universal configuration (Bio, Socials, Hobbies) mapped to the `/me` frontend endpoint.  

* **Public User** (`publicUser.model`): Separate collection for readers who authenticate to Like or Comment.  

* **Blogs** (`blog.model`): The central entity. Contains an array of Tags, Status (Draft/Published), and references the Admin `author`.  

* **Interactions** (`comments`, `likes`, `share`): Decoupled collections that reference a specific `Blog_ID` and `User_ID`, preventing the main Blog document from exceeding MongoDB's 16MB size limit as engagement grows.  

## 🔐 The Authentication Flow  

1. **Login:** User authenticates with email/password.  
2. **Tokens Issued:** Server issues a short-lived `accessToken` (sent in JSON) and a long-lived `refreshToken` (set as a secure, HTTP-only cookie).
3. **Protected Routes:** The `middleware.auth.js` intercepts requests, verifying the `accessToken`.
4. **Token Refresh:** If the access token expires, the client calls `/auth/refresh`. The server validates the HTTP-only cookie against the database and issues a new access token without requiring re-login.  

## 💻 Local Setup & Installation  

**Prerequisites**  
* Node.js (v16+ recommended) 
* MongoDB instance (Local or Atlas)
* Redis Server (Running locally or via cloud provider)
* Cloudinary Account (Free tier)  

**1. Clone the repository** 
```bash
git clone https://github.com/Afzal14786/portfolio-backend.git
cd portfolio-backend
```  

**2. Install dependencies**  
```bash
npm install
```  
 **3. Set up Environment Variables**  
 Create a `.env` file in the root directory. You must configure the following keys:  

```text
# Server
PORT=5000
NODE_ENV=development

# Database & Cache
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/portfolio
REDIS_URL=redis://localhost:6379

# JWT Secrets
JWT_ACCESS_SECRET=your_super_secret_access_key
JWT_REFRESH_SECRET=your_super_secret_refresh_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# SMTP (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

GOOGLE_CLIENT_ID=google_client_id
GOOGLE_CLIENT_SECRET=google_client_secret
GITHUB_CLIENT_ID= github_client_id 
GITHUB_CLIENT_SECRET=githu_client_secret
```  

**4. Run the Server**  
```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```  
*The server will start on `http://localhost:5000.`*  

**5. View API Documentation**  
Once the server is running, navigate to:  
`http://localhost:5000/api-docs` to view the interactive Swagger UI.

--- 
*This project is submitted as part of the BCA Final Year Project requirement.*