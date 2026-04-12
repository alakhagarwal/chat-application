import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import JoinRoom from './pages/JoinRoom'
import ChatRoom from './pages/ChatRoom'

function App() {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            borderRadius: '12px',
            fontSize: '14px',
            padding: '12px 16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#f8fafc',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#f8fafc',
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<JoinRoom />} />
        <Route path="/chat/:roomId" element={<ChatRoom />} />
      </Routes>
    </>
  )
}

export default App
