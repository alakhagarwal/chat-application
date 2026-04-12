# 🌌 ChatVerse

**Connect instantly with anyone, anywhere.**  
ChatVerse is a high-performance, real-time messaging application that allows users to seamlessly join ad-hoc chat rooms without the friction of mandatory sign-ups or authentication.

Built with a lightning-fast React frontend and a highly scalable Spring Boot backend, ChatVerse utilizes strict WebSocket/STOMP configurations to handle live data broadcasts effortlessly.

---

## ✨ Key Features

- **⚡ True Real-Time Connectivity**: WebSockets powered by STOMP ensure latency-free broadcasting of messages using publisher-subscriber routing.
- **🎨 Cinematic UI/UX**: Designed meticulously with TailwindCSS v4 and Framer Motion. Contains 3D card tilts, staggered list animations, fluid bubble enter/exit springs, and intelligent auto-scrolling interfaces.
- **⏱️ Dynamic "Time-Ago" Tick**: Engineered a standalone smart component that calculates exact timestamp diffs and recalculates relative text (e.g., `4m ago`) continuously without requiring message re-renders.
- **🔐 Frictionless Access**: No extensive profile building. Simply provide a display name, choose a Room ID, and you instantly step into an active communication channel.
- **🗃️ MongoDB Persistence**: Chat streams are tracked and stored in a NoSQL MongoDB document schema for massive horizontal scaling potential.

---

## 🛠️ Technology Stack

### Frontend Architecture
* **Core**: React 19 + Vite
* **Routing**: React Router DOM
* **Styling**: Tailwind CSS v4, Context APIs
* **Animations**: Motion (Framer Motion)
* **Real-time Pipeline**: `sockjs-client` & `stompjs`
* **Network Requests**: Axios

### Backend Architecture
* **Core**: Java 17 + Spring Boot 3
* **WebSockets**: Spring WebSocket + SimpleBroker STOMP mappings
* **Database**: MongoDB (via Spring Data MongoDB)
* **Boilerplate Reduction**: Lombok API

---

## 🚀 How to Run Locally

To spin up this project on your local machine, you will need to start both the Spring Boot server and the React Vite development server separately.

### 1. Backend Setup

1. Ensure **MongoDB** is running locally on your machine on port `27017` or update the `application.properties` to map to your remote cluster.
2. Navigate into the `backend` directory.
3. Allow Maven to resolve dependencies and boot the server:
   ```bash
   cd backend
   mvn spring-boot:run
   ```
   *The backend will boot up on `http://localhost:8080`.*

### 2. Frontend Setup

1. Open a new terminal and navigate to the `frontend` directory.
2. Install the necessary NPM dependencies:
   ```bash
   cd frontend
   npm install
   ```
3. Set your environment variables: Ensure there is a `.env` file mapping the backend endpoint.
   ```env
   VITE_API_URL=http://localhost:8080
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will boot up on `http://localhost:5173`.*

---

## 📖 WebSockets Documentation

If you are exploring the codebase and wish to understand how the real-time engine maps custom websocket configurations through the `@MessageMapping` and Subscription pipelines, refer to the included [WEBSOCKETS_GUIDE.md](./WEBSOCKETS_GUIDE.md) at the root of the repository.

---

*Designed and Developed for seamless, high-velocity interactions.* 🌌
