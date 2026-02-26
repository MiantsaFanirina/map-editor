import { motion } from 'framer-motion'

interface ToolbarButtonProps {
  onClick: () => void
  disabled?: boolean
  title: string
  icon: React.ReactNode
  variant?: 'default' | 'primary' | 'secondary' | 'accent'
  className?: string
}

const variants = {
  default: 'glass hover:bg-white/10',
  primary: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/20',
  secondary: 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-500/20',
  accent: 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 shadow-lg shadow-pink-500/20',
}

export function ToolbarButton({ 
  onClick, 
  disabled, 
  title, 
  icon, 
  variant = 'default',
  className = ''
}: ToolbarButtonProps) {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.05, y: -2 } : undefined}
      whileTap={!disabled ? { scale: 0.95 } : undefined}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all ${variants[variant]} ${disabled ? 'opacity-40' : 'cursor-pointer'} ${className}`}
    >
      {icon}
    </motion.button>
  )
}
