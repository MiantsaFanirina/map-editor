import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaCheck, FaTimes, FaInfo } from 'react-icons/fa'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  duration?: number
  onClose: () => void
}

export function Toast({ message, type = 'success', duration = 2000, onClose }: ToastProps) {
  const icons = {
    success: <FaCheck className="text-white" />,
    error: <FaTimes className="text-white" />,
    info: <FaInfo className="text-white" />,
  }

  const colors = {
    success: 'from-green-600 to-emerald-600',
    error: 'from-red-600 to-rose-600',
    info: 'from-indigo-600 to-purple-600',
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
    >
      <div className={`glass-card rounded-xl px-5 py-3 flex items-center gap-3 shadow-2xl bg-gradient-to-r ${colors[type]}`}>
        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
          {icons[type]}
        </div>
        <span className="text-white font-medium">{message}</span>
        <button onClick={onClose} className="ml-2 text-white/70 hover:text-white transition-colors">
          <FaTimes />
        </button>
      </div>
    </motion.div>
  )
}
