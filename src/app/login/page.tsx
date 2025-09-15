'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AnimatedBackground } from '@/components/ui/animated-background'
import { Eye, EyeOff, Shield, Users, Zap, ArrowRight, Building, User } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const success = await login(email, password)
    
    if (success) {
      router.push('/dashboard')
    } else {
      setError('Invalid credentials')
    }
    
    setLoading(false)
  }

  const quickLogin = (emailValue: string) => {
    setEmail(emailValue)
    setPassword('password')
  }

  return (
    <AnimatedBackground>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Branding and Features */}
          <div className="space-y-8 text-center lg:text-left">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass-effect glow-effect">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="text-sm font-medium text-gray-300">Multi-Tenant SaaS Platform</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                <span className="text-gradient">SaaS Notes</span>
              </h1>
              
              <p className="text-xl text-gray-400 max-w-lg">
                Secure, scalable, and intelligent note management for modern teams. 
                Experience the future of collaborative productivity.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-effect p-4 rounded-xl card-hover">
                <Shield className="w-8 h-8 text-blue-400 mb-2" />
                <h3 className="font-semibold text-white mb-1">Enterprise Security</h3>
                <p className="text-sm text-gray-400">Bank-level encryption and tenant isolation</p>
              </div>
              
              <div className="glass-effect p-4 rounded-xl card-hover">
                <Users className="w-8 h-8 text-green-400 mb-2" />
                <h3 className="font-semibold text-white mb-1">Team Collaboration</h3>
                <p className="text-sm text-gray-400">Real-time collaboration across organizations</p>
              </div>
              
              <div className="glass-effect p-4 rounded-xl card-hover">
                <Zap className="w-8 h-8 text-purple-400 mb-2" />
                <h3 className="font-semibold text-white mb-1">Lightning Fast</h3>
                <p className="text-sm text-gray-400">Optimized for speed and performance</p>
              </div>
            </div>
          </div>

          {/* Right side - Login Form */}
          <div className="space-y-6">
            <Card className="glass-effect glow-effect border-0 shadow-2xl">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-white">
                  Welcome Back
                </CardTitle>
                <p className="text-gray-400">Sign in to your account to continue</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Email</label>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Password</label>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  {error && (
                    <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50">
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Quick Login Options */}
            <Card className="glass-effect border-0 shadow-xl">
              <CardHeader className="pb-3">
                <h3 className="font-semibold text-white text-center">Demo Accounts</h3>
                <p className="text-xs text-gray-400 text-center">Click to auto-fill credentials</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm font-medium text-purple-300">
                    <Building className="w-4 h-4" />
                    <span>Acme Corporation</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => quickLogin('admin@acme.test')}
                      className="p-3 rounded-lg bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 text-left"
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <Shield className="w-3 h-3 text-purple-400" />
                        <Badge variant="outline" className="text-xs px-1.5 py-0 border-purple-400/50 text-purple-300">Admin</Badge>
                      </div>
                      <p className="text-xs text-gray-300">admin@acme.test</p>
                    </button>
                    
                    <button
                      onClick={() => quickLogin('user@acme.test')}
                      className="p-3 rounded-lg bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 text-left"
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <User className="w-3 h-3 text-blue-400" />
                        <Badge variant="outline" className="text-xs px-1.5 py-0 border-blue-400/50 text-blue-300">Member</Badge>
                      </div>
                      <p className="text-xs text-gray-300">user@acme.test</p>
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm font-medium text-green-300">
                    <Building className="w-4 h-4" />
                    <span>Globex Corporation</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => quickLogin('admin@globex.test')}
                      className="p-3 rounded-lg bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 hover:border-green-400/50 transition-all duration-300 text-left"
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <Shield className="w-3 h-3 text-green-400" />
                        <Badge variant="outline" className="text-xs px-1.5 py-0 border-green-400/50 text-green-300">Admin</Badge>
                      </div>
                      <p className="text-xs text-gray-300">admin@globex.test</p>
                    </button>
                    
                    <button
                      onClick={() => quickLogin('user@globex.test')}
                      className="p-3 rounded-lg bg-gradient-to-r from-teal-600/20 to-cyan-600/20 border border-teal-500/30 hover:border-teal-400/50 transition-all duration-300 text-left"
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <User className="w-3 h-3 text-teal-400" />
                        <Badge variant="outline" className="text-xs px-1.5 py-0 border-teal-400/50 text-teal-300">Member</Badge>
                      </div>
                      <p className="text-xs text-gray-300">user@globex.test</p>
                    </button>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <p className="text-xs text-gray-500">
                    🔑 All accounts use password: <span className="font-mono text-gray-400">password</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AnimatedBackground>
  )
}