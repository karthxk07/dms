# 📄 Document Management System

A secure, role-based document management system built with Next.js, Node.js, PostgreSQL, and Google Drive integration. Users can create groups, upload documents, and manage participant access via a clean interface and robust backend.

## 🚀 Features

* **JWT-based user authentication** with bcrypt password hashing
* **Google OAuth2 + Drive API** for file storage
* **Role-based access** (Admins and Participants)
* **Group-based file management**
* **Server-side auth protection** with custom middleware
* Deployed using Render, Neon, and Vercel (initially)

## ⚙️ Tech Stack

* **Frontend:** Next.js
* **Backend:** Express.js
* **Database:** PostgreSQL (Neon)
* **Auth:** JWT, bcrypt, Google OAuth2
* **Storage:** Google Drive
* **Hosting:** Render (API + frontend), Neon (DB)

## 🧪 Local Development Setup

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/yourusername/document-management-system.git](https://github.com/yourusername/document-management-system.git)
    cd document-management-system
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Setup environment variables**
    Copy the `.env.sample` and rename it to `.env` for both /apps/web and /apps/api, then fill in your config values (Google OAuth, database URL, JWT secret, etc.)

    ```bash
    cp .env.sample .env
    ```

    ⚠️ **Ensure you have Google API credentials (Client ID, API Key) and a Neon Postgres DB URL.**

4.  **Start the development server**
    ```bash
    npm run dev
    ```

## 📌 Notes

* Uses Google Drive API for storing files – ensure proper OAuth scopes and token handling.
* Cookies and tokens may have issues on secure browsers with strict policies (e.g., Brave).
* Frontend and backend must be hosted under the same or compatible subdomains for cookie handling.
