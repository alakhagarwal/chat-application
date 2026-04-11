import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useMotionValue, useTransform } from 'motion/react'
import toast from 'react-hot-toast'
import RoomService from '../services/RoomService'

/* ── Floating particle positions (fixed so they don't re-randomise on re-render) ── */
const PARTICLES = [
  { x: '12%',  y: '18%', size: 3,   delay: 0    },
  { x: '87%',  y: '11%', size: 2,   delay: 0.6  },
  { x: '73%',  y: '72%', size: 4,   delay: 1.1  },
  { x: '22%',  y: '80%', size: 2.5, delay: 0.3  },
  { x: '55%',  y: '5%',  size: 2,   delay: 1.8  },
  { x: '5%',   y: '50%', size: 3.5, delay: 0.9  },
  { x: '93%',  y: '45%', size: 2,   delay: 0.4  },
  { x: '42%',  y: '92%', size: 3,   delay: 1.5  },
  { x: '68%',  y: '28%', size: 2,   delay: 2.0  },
  { x: '30%',  y: '35%', size: 1.5, delay: 0.75 },
]

/* ── Animation variants ── */
const containerVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.25 } },
}

const itemVariants = {
  hidden:  { opacity: 0, y: 18, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0,  filter: 'blur(0px)', transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
}

export default function JoinRoom() {
  const [name,        setName]        = useState('')
  const [roomId,      setRoomId]      = useState('')
  const [isCreating,  setIsCreating]  = useState(false)
  const [isJoining,   setIsJoining]   = useState(false)
  const [nameFocused, setNameFocused] = useState(false)
  const [roomFocused, setRoomFocused] = useState(false)
  const navigate = useNavigate()

  /* Card 3-D tilt values */
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [3, -3])
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-3, 3])

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set(((e.clientX - rect.left) / rect.width)  - 0.5)
    mouseY.set(((e.clientY - rect.top)  / rect.height) - 0.5)
  }
  const handleMouseLeave = () => { mouseX.set(0); mouseY.set(0) }

  const validateInputs = (checkRoomId = true) => {
    if (!name.trim()) {
      toast.error('Please enter your name')
      return false
    }
    if (checkRoomId && !roomId.trim()) {
      toast.error('Please enter a room ID')
      return false
    }
    return true
  }

  const handleJoinRoom = async () => {
    if (!validateInputs(true)) return
    setIsJoining(true)
    const targetRoomId = roomId.trim()

    try {
      // Validate with backend that room exists
      await RoomService.joinRoom(targetRoomId)
      
      toast.success(`Joined room ${targetRoomId}`)
      setTimeout(() => navigate(`/chat/${targetRoomId}`, { state: { username: name.trim() } }), 400)
    } catch (error) {
      console.error("Failed to join room:", error)
      const backendError = error.response?.data?.message || (typeof error.response?.data === 'string' ? error.response.data : null)
      toast.error(backendError || `Room ${targetRoomId} not found`)
      setIsJoining(false)
    }
  }

  const handleCreateRoom = async () => {
    if (!validateInputs(true)) return // Require the user to type an ID
    setIsCreating(true)
    const newRoomId = roomId.trim()
    
    try {
      // Call Spring Boot backend to construct the room with the USER-provided ID
      const createdRoom = await RoomService.createRoom(newRoomId)
      
      // Backend returns internal ID + roomId. Always use tracking roomId for the UI URL.
      const finalRoomId = createdRoom?.roomId || newRoomId
      
      toast.success(`Room ${finalRoomId} created!`)
      setTimeout(() => navigate(`/chat/${finalRoomId}`, { state: { username: name.trim() } }), 600)
    } catch (error) {
      console.error("Failed to create room:", error)
      
      const backendError = error.response?.data?.message 
                        || (typeof error.response?.data === 'string' ? error.response.data : null);

      if (backendError) {
        toast.error(backendError) // Will show "Room with ID ... already exists"
      } else {
        toast.error('Failed to create room. Is your backend running?')
      }
      
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#060a14] flex items-center justify-center px-4">

      {/* ── Animated background orbs ── */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      {/* ── Subtle grid overlay ── */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* ── Floating particles ── */}
      {PARTICLES.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-indigo-400/20 pointer-events-none"
          style={{ left: p.x, top: p.y, width: p.size, height: p.size }}
          animate={{
            y:       [0, -18, 0],
            opacity: [0.15, 0.5, 0.15],
            scale:   [1, 1.4, 1],
          }}
          transition={{
            duration: 4 + i * 0.4,
            delay:    p.delay,
            repeat:   Infinity,
            ease:     'easeInOut',
          }}
        />
      ))}

      {/* ── Main card (3-D tilt) ── */}
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.94 }}
        animate={{ opacity: 1, y: 0,  scale: 1 }}
        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, perspective: 1200, transformStyle: 'preserve-3d' }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass-card rounded-3xl p-8 sm:p-10 border border-white/[0.08] shadow-2xl shadow-black/40">

          {/* ── Branding ── */}
          <div className="text-center mb-9">

            {/* Logo with shimmer ring */}
            <div className="relative inline-block mb-5">
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 14 }}
                className="relative inline-flex items-center justify-center w-[72px] h-[72px] rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 shadow-xl shadow-indigo-500/30 animate-pulse-glow"
              >
                <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {/* Shimmer sweep across the logo */}
                <motion.div
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.35) 50%, transparent 60%)',
                    backgroundSize: '200% 100%',
                  }}
                  animate={{ backgroundPosition: ['-100% 0', '200% 0'] }}
                  transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }}
                />
              </motion.div>

              {/* Orbiting ring */}
              <motion.div
                className="absolute -inset-2 rounded-[20px] border border-indigo-500/20"
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
              />
            </div>

            {/* Title + subtitle stagger */}
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38, duration: 0.5 }}
              className="text-4xl font-extrabold text-gradient tracking-tight"
            >
              ChatVerse
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.52, duration: 0.5 }}
              className="text-slate-500 mt-2.5 text-sm font-medium"
            >
              Connect instantly with anyone, anywhere
            </motion.p>
          </div>

          {/* ── Form (staggered children) ── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-5"
          >
            {/* Name Input */}
            <motion.div variants={itemVariants}>
              <label htmlFor="name-input" className="block text-sm font-medium text-slate-300 mb-2">
                Your Name
              </label>
              <motion.div
                className="relative group"
                animate={nameFocused ? { scale: 1.015 } : { scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <motion.svg
                    animate={{ color: nameFocused ? '#818cf8' : '#64748b' }}
                    transition={{ duration: 0.2 }}
                    className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </motion.svg>
                </div>
                <input
                  id="name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                  placeholder="Enter your name"
                  className="w-full pl-12 pr-4 py-3.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/15 focus:bg-white/[0.06] transition-all duration-300 text-sm"
                />
              </motion.div>
            </motion.div>

            {/* Room ID Input */}
            <motion.div variants={itemVariants}>
              <label htmlFor="room-input" className="block text-sm font-medium text-slate-300 mb-2">
                Room ID
              </label>
              <motion.div
                className="relative group"
                animate={roomFocused ? { scale: 1.015 } : { scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <motion.svg
                    animate={{ color: roomFocused ? '#818cf8' : '#64748b' }}
                    transition={{ duration: 0.2 }}
                    className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </motion.svg>
                </div>
                <input
                  id="room-input"
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  onFocus={() => setRoomFocused(true)}
                  onBlur={() => setRoomFocused(false)}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                  placeholder="Enter room ID to join"
                  className="w-full pl-12 pr-4 py-3.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/15 focus:bg-white/[0.06] transition-all duration-300 text-sm"
                />
              </motion.div>
            </motion.div>

            {/* Buttons */}
            <motion.div variants={itemVariants} className="flex gap-3 pt-2">
              {/* Join Room */}
              <motion.button
                whileHover={{ scale: 1.03, y: -2, boxShadow: '0 8px 30px rgba(99,102,241,0.45)' }}
                whileTap={{ scale: 0.96 }}
                onClick={handleJoinRoom}
                disabled={isJoining || isCreating}
                className="relative flex-1 overflow-hidden py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-colors duration-300 cursor-pointer text-sm disabled:opacity-60"
              >
                {/* Hover shimmer */}
                <motion.span
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)',
                    backgroundSize: '200% 100%',
                    backgroundPosition: '-100% 0',
                  }}
                  whileHover={{ backgroundPosition: '200% 0' }}
                  transition={{ duration: 0.5 }}
                />
                <span className="relative flex items-center justify-center gap-2">
                  {isJoining ? (
                    <motion.svg
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </motion.svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                  )}
                  {isJoining ? 'Joining…' : 'Join Room'}
                </span>
              </motion.button>

              {/* Create Room */}
              <motion.button
                whileHover={{ scale: 1.03, y: -2, boxShadow: '0 8px 30px rgba(16,185,129,0.4)' }}
                whileTap={{ scale: 0.96 }}
                onClick={handleCreateRoom}
                disabled={isCreating || isJoining}
                className="relative flex-1 overflow-hidden py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/30 transition-colors duration-300 cursor-pointer text-sm disabled:opacity-60"
              >
                <motion.span
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)',
                    backgroundSize: '200% 100%',
                    backgroundPosition: '-100% 0',
                  }}
                  whileHover={{ backgroundPosition: '200% 0' }}
                  transition={{ duration: 0.5 }}
                />
                <span className="relative flex items-center justify-center gap-2">
                  {isCreating ? (
                    /* Spinner while creating */
                    <motion.svg
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </motion.svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  )}
                  {isCreating ? 'Creating…' : 'Create Room'}
                </span>
              </motion.button>
            </motion.div>

            {/* Footer */}
            <motion.p
              variants={itemVariants}
              className="text-center text-slate-600 text-xs pt-1 flex items-center justify-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Encrypted rooms · No sign-up required
            </motion.p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
