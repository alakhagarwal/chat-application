import { useState, useEffect, useRef, useCallback } from 'react'
import {useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import toast from 'react-hot-toast'
import useChatContext from '../context/ChatContext'
import { baseURL } from '../config/api'
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import RoomService from '../services/RoomService'


/* ─────────────────────────────────────────────
   Utilities
   ───────────────────────────────────────────── */

function getAvatarColor(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return `hsl(${Math.abs(hash % 360)}, 55%, 50%)`
}

function getInitial(name) {
  return name.charAt(0).toUpperCase()
}

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
   Animation Variants
   ───────────────────────────────────────────── */

/** Sidebar users stagger */
const sidebarListVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.3 } },
}
const sidebarItemVariants = {
  hidden: { opacity: 0, x: -20, filter: 'blur(4px)' },
  visible: {
    opacity: 1, x: 0, filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 260, damping: 22 }
  },
}

/** Own bubble — springs in from right */
const ownBubbleVariants = {
  hidden: { opacity: 0, x: 30, scale: 0.88 },
  visible: {
    opacity: 1, x: 0, scale: 1,
    transition: { type: 'spring', stiffness: 320, damping: 26 }
  },
  exit: { opacity: 0, x: 20, scale: 0.9, transition: { duration: 0.15 } },
}

/** Other bubble — springs in from left */
const otherBubbleVariants = {
  hidden: { opacity: 0, x: -30, scale: 0.88 },
  visible: {
    opacity: 1, x: 0, scale: 1,
    transition: { type: 'spring', stiffness: 320, damping: 26 }
  },
  exit: { opacity: 0, x: -20, scale: 0.9, transition: { duration: 0.15 } },
}

/* ─────────────────────────────────────────────
   Component
   ───────────────────────────────────────────── */
export default function ChatRoom() {
  // const { roomId }  = useParams()
  const navigate = useNavigate()
  const { roomId, currentUser, connected } = useChatContext()
  const [stompClient, setStompClient] = useState(null);

  useEffect(() => {
    if (!connected) {
      navigate('/')
    }
  }, [connected, roomId, currentUser])

  useEffect(() => {
    // stomp client

    const connectWebSocket = () => {
      const sock = new SockJS(`${baseURL}/chat`);
      const client = Stomp.over(sock);

      client.connect({}, () => {
        setStompClient(client);
        toast.success('Connected');

        client.subscribe(`/topic/room/${roomId}`, (message) => {
          const receivedMessage = JSON.parse(message.body);
          setMessages((prev) => [...prev, receivedMessage]);
        });
      });
      
    };

    connectWebSocket();
  }, [roomId])

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const messages = await RoomService.getMessages(roomId);
        setMessages(messages);
      } catch (error) {
        toast.error('Error fetching messages:', error);
      }
    };
    fetchMessages();
  }, [])


  // Pull the username synced from the Join screen
  const username = currentUser || 'You'

  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [inputFocused, setInputFocused] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSendMessage = async () => {
    if(stompClient && connected && newMessage.trim()){
      const message = {
        sender: currentUser,
        content: newMessage,
        roomId: roomId
      }
      stompClient.send(`/app/sendMessage/${roomId}`, {}, JSON.stringify(message))
      setNewMessage('')
    }
  }

  const handleLeaveRoom = () => {
    toast.success('Left the room')
    navigate('/')
  }

  const isOwn = (sender) => sender === username

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#060a14', overflow: 'hidden' }}>

      {/* ═══ Header ─ slides down on mount ═══ */}
      <motion.header
        initial={{ y: -64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Room badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 20 }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: 'rgba(99,102,241,0.1)', borderRadius: 8, border: '1px solid rgba(99,102,241,0.15)' }}
          >
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399' }}
            />
            <span style={{ color: '#a5b4fc', fontSize: 14, fontWeight: 600, letterSpacing: '0.025em' }}>
              {roomId}
            </span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{ display: 'flex', alignItems: 'center', gap: 12 }}
        >
          {/* User badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <motion.div
              whileHover={{ scale: 1.1 }}
              style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 700, background: getAvatarColor(username) }}
            >
              {getInitial(username)}
            </motion.div>
            <span style={{ color: '#cbd5e1', fontSize: 14, fontWeight: 500 }}>{username}</span>
          </div>

          {/* Leave button */}
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 16px rgba(239,68,68,0.3)' }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLeaveRoom}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 8, color: '#f87171', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
          >
            <svg style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Leave
          </motion.button>
        </motion.div>
      </motion.header>

      {/* ═══ Body ═══ */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>


        {/* ── Messages + Input Column ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

          {/* Messages scroll area */}
          <div
            className="scrollbar-thin"
            style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            {/* Date separator */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 0' }}
            >
              <div style={{ height: 1, width: 48, background: 'linear-gradient(to right, transparent, rgba(71,85,105,0.5))' }} />
              <span style={{ fontSize: 11, color: '#475569', fontWeight: 500, padding: '4px 12px', background: 'rgba(30,41,59,0.3)', borderRadius: 999, margin: '0 12px' }}>
                Today
              </span>
              <div style={{ height: 1, width: 48, background: 'linear-gradient(to left, transparent, rgba(71,85,105,0.5))' }} />
            </motion.div>

            {/* Message list */}
            <AnimatePresence initial={false}>
              {messages.map((msg, index) => {
                const own = isOwn(msg.sender)
                const variants = own ? ownBubbleVariants : otherBubbleVariants
                return (
                  <motion.div
                    key={index}
                    variants={variants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                    style={{ display: 'flex', alignItems: 'flex-end', gap: 10, justifyContent: own ? 'flex-end' : 'flex-start' }}
                  >
                    {/* Left avatar */}
                    {!own && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.05 }}
                        style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 700, flexShrink: 0, marginBottom: 20, background: getAvatarColor(msg.sender) }}
                      >
                        {getInitial(msg.sender)}
                      </motion.div>
                    )}

                    <div style={{ maxWidth: '60%' }}>
                      {!own && (
                        <p style={{ fontSize: 11, color: '#64748b', marginBottom: 4, marginLeft: 4, fontWeight: 600 }}>
                          {msg.sender}
                        </p>
                      )}

                      {/* Bubble */}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        style={{
                          padding: '10px 16px',
                          borderRadius: own ? '16px 16px 6px 16px' : '16px 16px 16px 6px',
                          lineHeight: 1.5,
                          cursor: 'default',
                          ...(own
                            ? { background: 'linear-gradient(135deg, #4f46e5, #2563eb)', color: 'white', boxShadow: '0 4px 12px rgba(79,70,229,0.2)' }
                            : { background: '#151d2e', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.05)' }
                          ),
                        }}
                      >
                        <p style={{ fontSize: 13.5, margin: 0 }}>{msg.content}</p>
                      </motion.div>

                      <p style={{ fontSize: 10, color: '#475569', marginTop: 4, textAlign: own ? 'right' : 'left', paddingLeft: own ? 0 : 4, paddingRight: own ? 4 : 0 }}>
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>

                    {/* Right avatar */}
                    {own && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.05 }}
                        style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 700, flexShrink: 0, marginBottom: 20, background: getAvatarColor(msg.sender) }}
                      >
                        {getInitial(msg.sender)}
                      </motion.div>
                    )}
                  </motion.div>
                )
              })}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>

          {/* ═══ Input Bar — slides up on mount ═══ */}
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            style={{ padding: '16px 24px', background: 'rgba(10,15,30,0.75)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}
          >
            <motion.div
              animate={inputFocused
                ? { boxShadow: '0 0 0 1px rgba(99,102,241,0.25), 0 4px 24px rgba(99,102,241,0.08)' }
                : { boxShadow: 'none' }
              }
              transition={{ duration: 0.25 }}
              style={{ display: 'flex', alignItems: 'center', gap: 12, maxWidth: 800, margin: '0 auto', borderRadius: 16, padding: '2px 2px 2px 6px' }}
            >
              {/* Emoji */}
              <motion.button
                whileHover={{ scale: 1.15, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
                style={{ padding: 10, borderRadius: 10, background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex' }}
              >
                <svg style={{ width: 20, height: 20 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </motion.button>

              {/* Text input */}
              <input
                ref={inputRef}
                id="message-input"
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder="Type a message..."
                style={{ flex: 1, padding: '12px 20px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: 'white', fontSize: 14, outline: 'none', fontFamily: 'inherit' }}
              />

              {/* Attach */}
              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                style={{ padding: 10, borderRadius: 10, background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex' }}
              >
                <svg style={{ width: 20, height: 20 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </motion.button>

              {/* Send */}
              <motion.button
                whileHover={newMessage.trim() ? { scale: 1.1, boxShadow: '0 6px 20px rgba(79,70,229,0.45)' } : {}}
                whileTap={newMessage.trim() ? { scale: 0.9 } : {}}
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                animate={newMessage.trim()
                  ? { background: 'linear-gradient(135deg, #4f46e5, #2563eb)' }
                  : { background: '#334155' }
                }
                transition={{ duration: 0.2 }}
                style={{ padding: 12, border: 'none', borderRadius: 12, color: 'white', cursor: newMessage.trim() ? 'pointer' : 'not-allowed', display: 'flex' }}
              >
                <motion.svg
                  animate={newMessage.trim() ? { x: [0, 2, 0] } : {}}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1.5 }}
                  style={{ width: 20, height: 20 }}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </motion.svg>
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
