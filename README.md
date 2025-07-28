# 💬 Connect - Real-Time Chat App

🌐 Live Demo: [https://chat-app-connect-eight.vercel.app](https://chat-app-connect-eight.vercel.app)

Connect is a modern, secure, and responsive real-time chat application built with React and Node.js. It enables seamless one-on-one and group messaging with live updates, user authentication, and an intuitive interface for desktop and mobile devices.

Whether you're connecting with friends or collaborating with teams, Connect offers a smooth, interactive experience powered by WebSocket technology for instant communication.

## 📁 Project Structure

<pre>
💬 Connect/
├── 📸 screenshots/             # 📷 Screenshots used in README
├── 🖥️ backend/                 # 🧠 Node.js + Express API
│   ├── 🧩 config/              # ⚙️ DB connection, env config
│   ├── 🧬 models/              # 📄 Mongoose models (User, Message, Group)
│   ├── 🛣️ routes/             # 🚏 API endpoints (auth, groups, users)
│   ├── 🛡️ middleware/         # 🔐 Authentication middlewares
│   ├── 📄 .env                 # 🔐 Backend environment (MONGO_URI, JWT)
│   └── 🚀 index.js            # 🔥 Entry point of backend server
├── 💻 frontend/               # 🎨 React + Tailwind UI
│   ├── 📁 public/             # 🌐 Static assets
│   ├── 🖼️ src/                # 💡 Application source
│   │   ├── 🧠 App.jsx         # 🎯 Root component
│   │   ├── 🌐 context/        # 🔌 Auth & socket contexts
│   │   ├── 💬 chat/           # 📱 Chat UI components
│   │   ├── 🧑 profile/        # 👤 User profile management
│   │   ├── 📄 pages/          # 📄 Routes (Login, Register, 404)
│   │   ├── 🎨 assets/         # 🖼️ Icons, logos, images
│   │   ├── 📄 main.jsx        # 🚀 ReactDOM entry point
│   │   ├── 🎨 App.css         # 💅 Base styling
│   │   ├── 📄 .env            # ⚙️ Frontend env (VITE_API_URL)
│   │   └── 📄 index.css       # 🎨 Tailwind + custom styles
├── ⚙️ vite.config.js           # ⚙️ Vite project configuration
├── 📦 package.json             # 📦 Project metadata & scripts
└── 📝 README.md                # 📘 Project description and guide
</pre>
## 🚀 Features

- 🔐 **Authentication & Authorization**  
  Secure user registration, login, and role-based access using JWT tokens.

- 🛒 **Shopping Cart & Wishlist**  
  Seamless add/remove functionality with quantity updates and persistence.

- 👤 **User Dashboard**  
  View orders, update profile info, and manage personal data.

- 🛠️ **Admin Dashboard**  
  Full control over products, categories, and users with analytics.

- 📦 **Product Management**  
  Create, update, and delete products with image upload and categorization.

- 💬 **Real-Time Toast Notifications**  
  Instant feedback for actions (added to cart, login success, errors, etc.).

- 💳 **Order Placement & Checkout Flow**  
  Simulated order system with pricing, shipping, and order history.

- 🔎 **Product Search & Filter**  
  Search products by name, filter by category, and sort by price.

- 🧠 **State Management with Context API**  
  Efficient global state sharing for cart, wishlist, auth, and admin.

- 🎨 **Stylish UI with Tailwind CSS + Framer Motion**  
  Beautifully animated, responsive design with modern interactions.

- 🔗 **Routing with React Router**  
  Protected and public routes managed via client-side routing.

- ☁️ **Deployed on Vercel & Render**  
  Frontend hosted on Vercel, backend on Render for full-stack deployment.

---

## 🧰 Tech Stack & Tools

| Tech             | Purpose                                      |
|------------------|----------------------------------------------|
| React.js         | Frontend framework                          |
| Tailwind CSS     | Styling with utility-first CSS              |
| Framer Motion    | Animations and transitions                  |
| React Router     | Client-side routing                         |
| Context API      | Global state management                     |
| Axios            | HTTP requests to the backend                |
| Express.js       | Backend web framework                       |
| MongoDB & Mongoose | Database and schema modeling             |
| JWT              | Secure token-based authentication           |
| Cloudinary       | Image uploading and storage                 |
| Vercel           | Hosting for frontend                        |
| Render           | Hosting for backend                         |
| Dotenv           | Environment configuration                   |

---

## 📸 Screenshots

> Below are the core screens of the Chat Application showcasing the user journey.

---

### 🔐 Login Page  
Secure login with username & password. Form validation, animations, and responsive design.

<p float="left">
  <img src="screenshots/login.png" width="260" />
</p>
---

### 📝 Register Page  
User registration with input validation and smooth user experience.

<p float="left">
  <img src="screenshots/register.png" width="260" />
</p>


---
### 👥 Group List / Rooms Page  
Displays all available chat groups. Users can join, leave, or create rooms.

<p float="left">
  <img src="screenshots/group.png" width="260" />
</p>

---
### 💬 Chat Window  
Realtime chat interface using **Socket.IO**. Includes:
- Message bubbles
- User avatars
- Timestamps
- Auto-scroll
- Typing indicators

<p float="left">
  <img src="screenshots/chat.png" width="260" />
</p>

---

🛠️ Installation & Setup
Prerequisites
Node.js (v16 or higher) — Download here

MongoDB — You can use a local instance or a cloud service like MongoDB Atlas

Step 1: Clone the Repository
git clone [https://github.com/yourusername/chat-app-connect-eight.git](https://github.com/yourusername/chat-app-connect-eight.git)
cd chat-app-connect-eight

Step 2: Install Dependencies
Install backend dependencies:
cd backend
npm install

Install frontend dependencies:
cd ../frontend
npm install

Step 3: Configure Environment Variables
Create .env files in both the backend and frontend folders.

Backend .env example:
DB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000

Frontend .env example:
VITE_API_URL=http://localhost:5000/api

Step 4: Run the Application
Start the backend server:

cd ../backend
npm start
# or
node index.js

Start the frontend development server:
cd ../frontend
npm run dev

⚙️ Deployment
Deployed frontend and backend separately:

Frontend: Vercel

Backend: Render

👤 Author
Soumayshree Rout

🔗 GitHub: @MSC-0013

🌐 Portfolio: [[Portfolio](https://port-folio-tau-coral.vercel.app)]

📬 Contact
📧 Email: <soumyashreerout99@gmail.com>

💼 LinkedIn: [Linkedin Profile]([https://](https://www.linkedin.com/in/soumyashree-rout-500671253/)
