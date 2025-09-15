import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Badge = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success'
}>(({ className, variant = 'default', ...props }, ref) => {
  const variants = {
    default: 'bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30',
    secondary: 'bg-gray-500/20 text-gray-300 border-gray-500/30 hover:bg-gray-500/30',
    destructive: 'bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30',
    outline: 'text-gray-300 border-gray-600 bg-transparent hover:bg-gray-700/50',
    success: 'bg-green-500/20 text-green-300 border-green-500/30 hover:bg-green-500/30',
  }

  return (
    <div
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        variants[variant],
        className
      )}
      {...props}
    />
  )
})
Badge.displayName = 'Badge'

export { Badge }