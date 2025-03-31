Task-manager-FS-

 Task Manager Application

 Project Overview
This is a full-stack Task Manager application** that allows users to create, update, and delete tasks and lists. The app also includes user authentication with JWT tokens for secure access.
**(Note1)**
**(The confidetial credentials of this project is in .env file in the backend)**

**(Note2)**
**(The final project code is in final-output branch)**
**(The progress1 and final-progress branch is the code which is pushed after partial segment completion of project)**

 Table of Contents
1. [How to Set Up and Run the Project](#setup)
2. [Assumptions Made During Development](#assumptions)
3. [Technologies and Libraries Used](#technologies)
4. [Additional Information](#additional-info)

---

 1. How to Set Up and Run the Project
 Prerequisites
Ensure you have the following installed on your system:
- Node.js (Latest LTS version recommended)
- MongoDB (Ensure MongoDB is running locally or use a cloud database like MongoDB Atlas)
- Angular CLI (For frontend development)
- Postman (Optional, for testing API endpoints)

 Steps to Set Up
 Backend Setup (Node.js + Express + MongoDB)
1. Clone the repository:
   ```sh
   git clone https://github.com/your-repo/task-manager.git
   ```
2. Navigate to the backend directory:
   ```sh
   cd task-manager/backend
   ```
3. Install dependencies:
   ```sh
   npm install
   ```
4. Start the backend server:
   ```sh
   npm start
   ```
   This will run the backend on `http://localhost:3000`

 Frontend Setup (Angular)
1. Navigate to the frontend directory:
   ```sh
   cd ../frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Run the Angular development server:
   ```sh
   ng serve
   ```
   The frontend will be available at `http://localhost:4200`

 Database Setup (MongoDB)
- If using a local MongoDB instance, ensure MongoDB is running before starting the backend.
- If using MongoDB Atlas, update the connection string in the backend's `mongoose.js` file.


 2. Assumptions Made During Development 
- Users will only manage their own tasks and lists(authentication required).
- JWT-based authentication is sufficient for securing user sessions.
- The frontend assumes the backend follows RESTful API principles
- MongoDB is used as the database, and data integrity is maintained using Mongoose validation.
- Error handling is basic, and future improvements can include more detailed error messages.

---

 3. Technologies and Libraries Used 
Backend
- Node.js – Server-side runtime
- Express.js – Backend framework
- MongoDB + Mongoose – Database and ODM
- JWT (jsonwebtoken) – Authentication
- CORS – Cross-Origin Resource Sharing
- Body-parser – Parsing JSON requests

Frontend
- Angular – Frontend framework
- TypeScript – For structured JavaScript development
- Angular Router – Handling navigation
- Bulma CSS – Styling the UI
- HttpClient (Angular) – API calls to the backend

Development & Testing Tools
 - Postman – API testing
 - Git & GitHub – Version control
- VS Code – Code editor

---

 4. Challenges Faced and Solutions

 Login requests were failing (400 Bad Request) - Ensured that the login API call did not send an authentication token before login. 
 Tasks not appearing in the UI after adding -  Fixed API calls and added `changeDetection` in Angular to refresh data automatically. 
 CORS issues between frontend and backend - Properly configured CORS middleware in Express.js. 
 Token expiration issues -  Implemented token refresh mechanism using JWT and refresh tokens. 
 Dropdown menu misaligned in UI -  Used `flexbox` and `position: absolute` to properly align UI elements. 

 Contact
For any queries or issues, feel free to reach out!
Email: sudhuind08@gmail.com.com  


