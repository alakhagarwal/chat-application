import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import toast from 'react-hot-toast'

/* ─────────────────────────────────────────────
   Utilities
   ───────────────────────────────────────────── */

function getAvatarColor(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash % 360)
  return `hsl(${hue}, 55%, 50%)`
}

function getInitial(name) {
  return name.charAt(0).toUpperCase()
}

function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const now = ctx.currentTime
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.frequency.setValueAtTime(587, now)
    osc1.type = 'sine'
    gain1.gain.setValueAtTime(0.12, now)
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25)
    osc1.start(now)
    osc1.stop(now + 0.25)
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.frequency.setValueAtTime(880, now + 0.08)
    osc2.type = 'sine'
    gain2.gain.setValueAtTime(0.1, now + 0.08)
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35)
    osc2.start(now + 0.08)
    osc2.stop(now + 0.35)
  } catch {
    /* silent fallback */
  }
}

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/* ─────────────────────────────────────────────
   Mock Data
   ───────────────────────────────────────────── */
const MOCK_MESSAGES_TEMPLATE = [
  { sender: 'Alice Johnson', content: 'Hey everyone! Just joined the room 👋', timestamp: '2026-04-10T10:00:00' },
  { sender: 'Bob Smith', content: 'Welcome Alice! We were just discussing the new project.', timestamp: '2026-04-10T10:01:30' },
  { sender: '__SELF__', content: 'Hey! Glad to be here. What did I miss?', timestamp: '2026-04-10T10:02:00' },
  { sender: 'Alice Johnson', content: "Not much! What's the latest update?", timestamp: '2026-04-10T10:02:15' },
  { sender: 'Charlie Dev', content: "We've finalized the UI mockups. The dark theme looks incredible! 🔥", timestamp: '2026-04-10T10:03:00' },
  { sender: '__SELF__', content: 'The glassmorphism effects are super clean! Great work team 👏', timestamp: '2026-04-10T10:03:30' },
  { sender: 'Bob Smith', content: 'Thanks! Spent quite some time on the color palette.', timestamp: '2026-04-10T10:04:00' },
  { sender: 'Alice Johnson', content: 'Can you share the design link?', timestamp: '2026-04-10T10:05:00' },
  { sender: 'Charlie Dev', content: "Sure, I'll drop it in the shared docs. Give me a sec.", timestamp: '2026-04-10T10:06:00' },
  { sender: '__SELF__', content: "Awesome! Let's also discuss the WebSocket implementation next 🛠️", timestamp: '2026-04-10T10:07:00' },
  { sender: 'Bob Smith', content: 'Agreed. I have some thoughts on the STOMP protocol setup.', timestamp: '2026-04-10T10:08:00' },
]

const MOCK_ONLINE_USERS = ['Alice Johnson', 'Bob Smith', 'Charlie Dev']

const AUTO_RESPONSES = [
  "That's a great point! 👍",
  'I totally agree with you on that.',
  'Interesting perspective! Let me think about it.',
  'Ha! Good one 😄',
  "Sure, let's discuss that further.",
  "Nice! I was thinking the same thing.",
  "Let's sync up on this later today.",
  "Sounds good to me! 🚀",
]

/* ─────────────────────────────────────────────
   Component
   ───────────────────────────────────────────── */
export default function ChatRoom() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const username = location.state?.username || 'You'

  const initialMessages = MOCK_MESSAGES_TEMPLATE.map((msg) => ({
    ...msg,
    sender: msg.sender === '__SELF__' ? username : msg.sender,
  }))
  const [messages, setMessages] = useState(initialMessages)
  const [newMessage, setNewMessage] = useState('')
  const [showSidebar, setShowSidebar] = useState(false)
  const [isTyping, setIsTyping] = useState(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const onlineUsers = [...MOCK_ONLINE_USERS, username]

  useEffect(() => {
    if (!location.state?.username) {
      toast('Using default name. Join via homepage for a custom name.', { icon: 'ℹ️' })
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSendMessage = useCallback(() => {
    if (!newMessage.trim()) return

    const message = {
      sender: username,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, message])
    setNewMessage('')
    inputRef.current?.focus()

    const responder = MOCK_ONLINE_USERS[Math.floor(Math.random() * MOCK_ONLINE_USERS.length)]
    const delay = 1200 + Math.random() * 2000

    setTimeout(() => setIsTyping(responder), 800)

    setTimeout(() => {
      setIsTyping(null)
      const response = {
        sender: responder,
        content: AUTO_RESPONSES[Math.floor(Math.random() * AUTO_RESPONSES.length)],
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, response])
      playNotificationSound()
    }, delay)
  }, [newMessage, username])

  const handleLeaveRoom = () => {
    toast.success('Left the room')
    navigate('/')
  }

  const isOwnMessage = (sender) => sender === username

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#060a14', overflow: 'hidden' }}>
      {/* ═══ Header ═══ */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 24px',
          background: 'rgba(10, 15, 30, 0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Mobile sidebar toggle */}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="lg:hidden"
            style={{
              padding: '8px',
              borderRadius: '8px',
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
            }}
          >
            <svg style={{ width: 20, height: 20 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Room badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            background: 'rgba(99, 102, 241, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(99, 102, 241, 0.15)',
          }}>
            <div style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#34d399',
              animation: 'pulse 2s infinite',
            }} />
            <span style={{ color: '#a5b4fc', fontSize: '14px', fontWeight: 600, letterSpacing: '0.025em' }}>
              {roomId}
            </span>
          </div>

          {/* Online count */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#64748b',
            fontSize: '12px',
            fontWeight: 500,
          }}>
            <svg style={{ width: 14, height: 14 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {onlineUsers.length} online
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* User badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px',
              fontWeight: 700,
              background: getAvatarColor(username),
            }}>
              {getInitial(username)}
            </div>
            <span style={{ color: '#cbd5e1', fontSize: '14px', fontWeight: 500 }}>{username}</span>
          </div>

          {/* Leave button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLeaveRoom}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.15)',
              borderRadius: '8px',
              color: '#f87171',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <svg style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Leave
          </motion.button>
        </div>
      </header>

      {/* ═══ Body: Sidebar + Messages ═══ */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        {/* Mobile overlay */}
        {showSidebar && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 20,
            }}
            onClick={() => setShowSidebar(false)}
          />
        )}

        {/* ── Sidebar ── */}
        <aside
          style={{
            width: 256,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            background: 'rgba(10, 15, 30, 0.9)',
            backdropFilter: 'blur(20px)',
            borderRight: '1px solid rgba(255,255,255,0.05)',
            padding: 20,
            overflowY: 'auto',
          }}
          className="hidden lg:flex"
        >
          <h3 style={{
            fontSize: '11px',
            fontWeight: 600,
            color: '#475569',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            marginBottom: 20,
          }}>
            Online — {onlineUsers.length}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {onlineUsers.map((user, index) => (
              <motion.div
                key={user}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.08 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 12px',
                  borderRadius: 12,
                  cursor: 'default',
                }}
                className="hover:bg-white/[0.04]"
              >
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 700,
                    background: getAvatarColor(user),
                  }}>
                    {getInitial(user)}
                  </div>
                  <div style={{
                    position: 'absolute',
                    bottom: -2,
                    right: -2,
                    width: 12,
                    height: 12,
                    background: '#34d399',
                    borderRadius: '50%',
                    border: '2px solid #0a0f1e',
                  }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    color: '#cbd5e1',
                    fontSize: '13px',
                    fontWeight: 500,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {user === username ? `${user} (You)` : user}
                  </div>
                  <div style={{ color: 'rgba(16, 185, 129, 0.6)', fontSize: '10px', fontWeight: 500 }}>
                    Active now
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div style={{ marginTop: 'auto', paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#475569', fontSize: '11px' }}>
              <svg style={{ width: 14, height: 14 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              End-to-end encrypted
            </div>
          </div>
        </aside>

        {/* ── Messages + Input Column ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Messages scroll area */}
          <div
            className="scrollbar-thin"
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            {/* Date separator */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 0' }}>
              <div style={{ height: 1, width: 48, background: 'linear-gradient(to right, transparent, rgba(71, 85, 105, 0.5))' }} />
              <span style={{
                fontSize: '11px',
                color: '#475569',
                fontWeight: 500,
                padding: '4px 12px',
                background: 'rgba(30, 41, 59, 0.3)',
                borderRadius: 999,
                margin: '0 12px',
              }}>
                Today
              </span>
              <div style={{ height: 1, width: 48, background: 'linear-gradient(to left, transparent, rgba(71, 85, 105, 0.5))' }} />
            </div>

            {/* Messages */}
            <AnimatePresence initial={false}>
              {messages.map((msg, index) => {
                const own = isOwnMessage(msg.sender)
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 15, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-end',
                      gap: 10,
                      justifyContent: own ? 'flex-end' : 'flex-start',
                    }}
                  >
                    {/* Left avatar for others */}
                    {!own && (
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: 700,
                        flexShrink: 0,
                        marginBottom: 20,
                        background: getAvatarColor(msg.sender),
                      }}>
                        {getInitial(msg.sender)}
                      </div>
                    )}

                    <div style={{ maxWidth: '60%' }}>
                      {/* Sender name (others only) */}
                      {!own && (
                        <p style={{ fontSize: '11px', color: '#64748b', marginBottom: 4, marginLeft: 4, fontWeight: 600 }}>
                          {msg.sender}
                        </p>
                      )}

                      {/* Bubble */}
                      <div style={{
                        padding: '10px 16px',
                        borderRadius: own ? '16px 16px 6px 16px' : '16px 16px 16px 6px',
                        lineHeight: 1.5,
                        ...(own
                          ? {
                              background: 'linear-gradient(135deg, #4f46e5, #2563eb)',
                              color: 'white',
                              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)',
                            }
                          : {
                              background: '#151d2e',
                              color: '#e2e8f0',
                              border: '1px solid rgba(255,255,255,0.05)',
                            }),
                      }}>
                        <p style={{ fontSize: '13.5px', margin: 0 }}>{msg.content}</p>
                      </div>

                      {/* Timestamp */}
                      <p style={{
                        fontSize: '10px',
                        color: '#475569',
                        marginTop: 4,
                        textAlign: own ? 'right' : 'left',
                        paddingLeft: own ? 0 : 4,
                        paddingRight: own ? 4 : 0,
                      }}>
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>

                    {/* Right avatar for own */}
                    {own && (
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: 700,
                        flexShrink: 0,
                        marginBottom: 20,
                        background: getAvatarColor(msg.sender),
                      }}>
                        {getInitial(msg.sender)}
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </AnimatePresence>

            {/* Typing indicator */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                >
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 700,
                    background: getAvatarColor(isTyping),
                  }}>
                    {getInitial(isTyping)}
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '12px 16px',
                    background: '#151d2e',
                    borderRadius: 16,
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}>
                    <span className="animate-bounce" style={{ width: 8, height: 8, background: '#64748b', borderRadius: '50%', display: 'inline-block', animationDelay: '0ms' }} />
                    <span className="animate-bounce" style={{ width: 8, height: 8, background: '#64748b', borderRadius: '50%', display: 'inline-block', animationDelay: '150ms' }} />
                    <span className="animate-bounce" style={{ width: 8, height: 8, background: '#64748b', borderRadius: '50%', display: 'inline-block', animationDelay: '300ms' }} />
                  </div>
                  <span style={{ fontSize: '10px', color: '#475569', fontStyle: 'italic' }}>
                    {isTyping.split(' ')[0]} is typing...
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>

          {/* ═══ Input Bar ═══ */}
          <div style={{
            padding: '16px 24px',
            background: 'rgba(10, 15, 30, 0.75)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, maxWidth: 800, margin: '0 auto' }}>
              {/* Emoji button */}
              <button style={{
                padding: 10,
                borderRadius: 10,
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                display: 'flex',
              }}>
                <svg style={{ width: 20, height: 20 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>

              {/* Text input */}
              <input
                ref={inputRef}
                id="message-input"
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                placeholder="Type a message..."
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 12,
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />

              {/* Attach button */}
              <button style={{
                padding: 10,
                borderRadius: 10,
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                display: 'flex',
              }}>
                <svg style={{ width: 20, height: 20 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>

              {/* Send button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                style={{
                  padding: 12,
                  background: newMessage.trim()
                    ? 'linear-gradient(135deg, #4f46e5, #2563eb)'
                    : '#334155',
                  border: 'none',
                  borderRadius: 12,
                  color: 'white',
                  cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  boxShadow: newMessage.trim() ? '0 4px 12px rgba(79, 70, 229, 0.25)' : 'none',
                }}
              >
                <svg style={{ width: 20, height: 20 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
