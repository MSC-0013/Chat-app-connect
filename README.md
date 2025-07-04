# 💬 Connect Eight - Real-Time Chat App

🌐 Live Demo: [https://chat-app-connect-eight.vercel.app](https://chat-app-connect-eight.vercel.app)

Connect Eight is a sleek and secure real-time chat application built with modern technologies. Whether you're messaging a friend or collaborating with a group, Connect Eight offers a seamless communication experience with live updates and smooth navigation.

---

## 🚀 Features

- 🔐 **Authentication** – Secure login and registration
- 💬 **Real-time Messaging** – Chat live with other users
- 🧑‍🤝‍🧑 **User List** – See who's online
- 🛡️ **Protected Routes** – Restrict access for unauthenticated users
- 🌙 **Dark Mode Support** – Elegant interface for day and night use
- 📱 **Fully Responsive** – Works on mobile, tablet, and desktop

---

## 🛠️ Tech Stack

### Frontend

- ⚛️ React
- 🌀 Tailwind CSS
- 🔁 React Router
- 📦 React Query (for API state management)

### Backend (Optional/Assumed)

- 🧠 Node.js
- ⚙️ Express.js
- 🔐 JWT for authentication
- 🗃️ MongoDB or Firebase for user & message data


---

## 🧑‍💻 Getting Started (Local Setup)

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/chat-app-connect-eight.git
cd chat-app-connect-eight

# 2. Install dependencies
npm install

# 3. Start the development server
npm start


├── public/
├── src/
│   ├── chat/            # Chat components (ChatLayout, MessageBox, etc.)
│   ├── pages/           # Login, Register, NotFound, ProtectedRoute
│   ├── context/         # Auth context provider
│   ├── App.jsx
│   └── main.jsx
└── tailwind.config.js

