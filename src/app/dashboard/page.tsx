'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AnimatedBackground } from '@/components/ui/animated-background'
import { 
  Plus, Edit, Trash, LogOut, Crown, Save, X, Search, 
  FileText, Calendar, User, Zap, TrendingUp,
  Clock, BarChart3, PlusCircle
} from 'lucide-react'

interface Note {
  id: string
  title: string
  content: string
  createdAt: string
  user: {
    email: string
    role: string
  }
}

export default function DashboardPage() {
  const { user, logout, token } = useAuth()
  const router = useRouter()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [upgrading, setUpgrading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch('/api/notes', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        
        if (response.status === 401) {
          // Token is invalid, clear auth and redirect
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
          }
          router.push('/login')
          return
        }
        
        const data = await response.json()
        setNotes(data.notes)
      } catch (error) {
        console.error('Error fetching notes:', error)
        // On network error, still try to show the UI
      } finally {
        setLoading(false)
      }
    }

    // Check if user exists and has valid tenant data
    if (!user || !token || !user.tenant) {
      // Clear any corrupted auth state and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
      router.push('/login')
      return
    }
    fetchNotes()
  }, [user, token, router])

  const createNote = async () => {
    if (!title.trim() || !content.trim()) return

    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setNotes([data.note, ...notes])
        setTitle('')
        setContent('')
        setCreating(false)
      } else if (response.status === 403) {
        alert(`Note limit reached! You have ${data.current}/${data.maxNotes} notes on the ${data.subscription} plan.`)
      }
    } catch (error) {
      console.error('Error creating note:', error)
    }
  }

  const updateNote = async (id: string) => {
    if (!title.trim() || !content.trim()) return

    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content }),
      })
      
      if (response.ok) {
        const data = await response.json()
        setNotes(notes.map(note => note.id === id ? data.note : note))
        setTitle('')
        setContent('')
        setEditing(null)
      }
    } catch (error) {
      console.error('Error updating note:', error)
    }
  }

  const deleteNote = async (id: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return

    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        setNotes(notes.filter(note => note.id !== id))
      }
    } catch (error) {
      console.error('Error deleting note:', error)
    }
  }

  const upgradeTenant = async () => {
    if (!user?.tenant?.slug) return

    setUpgrading(true)
    try {
      const response = await fetch(`/api/tenants/${user.tenant.slug}/upgrade`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        alert('Successfully upgraded to Pro plan!')
        window.location.reload()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to upgrade')
      }
    } catch (error) {
      console.error('Error upgrading:', error)
      alert('Failed to upgrade')
    } finally {
      setUpgrading(false)
    }
  }

  const startEditing = (note: Note) => {
    setEditing(note.id)
    setTitle(note.title)
    setContent(note.content)
    setCreating(false)
  }

  const cancelEditing = () => {
    setEditing(null)
    setCreating(false)
    setTitle('')
    setContent('')
  }

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <AnimatedBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div className="glass-effect p-8 rounded-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-white mt-4 text-center">Loading your workspace...</p>
          </div>
        </div>
      </AnimatedBackground>
    )
  }

  // Safety check: ensure user and tenant data exists
  if (!user || !user.tenant) {
    // Clear corrupted auth state and redirect
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
    return (
      <AnimatedBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div className="glass-effect p-8 rounded-xl text-center">
            <p className="text-white mb-4">Session expired. Redirecting to login...</p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        </div>
      </AnimatedBackground>
    )
  }

  return (
    <AnimatedBackground>
      <div className="min-h-screen">
        {/* Header */}
        <div className="border-b border-gray-700/50 backdrop-blur-lg bg-gray-900/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">
                      {user.tenant.name}
                    </h1>
                    <div className="flex items-center space-x-2">
                      <Badge variant={user.tenant.subscription === 'PRO' ? 'success' : 'secondary'}>
                        {user.tenant.subscription}
                      </Badge>
                      <span className="text-gray-400 text-sm">•</span>
                      <span className="text-gray-400 text-sm">{user.email}</span>
                      <span className="text-gray-400 text-sm">•</span>
                      <Badge variant={user.role === 'ADMIN' ? 'default' : 'outline'}>
                        {user.role}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {user.role === 'ADMIN' && user.tenant.subscription === 'FREE' && (
                  <Button 
                    onClick={upgradeTenant} 
                    disabled={upgrading}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    {upgrading ? 'Upgrading...' : 'Upgrade to Pro'}
                  </Button>
                )}
                
                <Button onClick={logout} variant="outline" className="border-gray-600 text-gray-300 hover:text-white">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="glass-effect border-0 card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Notes</p>
                    <p className="text-2xl font-bold text-white">{notes.length}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-effect border-0 card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Plan Limit</p>
                    <p className="text-2xl font-bold text-white">
                      {user.tenant.subscription === 'PRO' ? '∞' : `${notes.length}/3`}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-effect border-0 card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">This Month</p>
                    <p className="text-2xl font-bold text-white">{notes.length}</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-effect border-0 card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Last Updated</p>
                    <p className="text-2xl font-bold text-white">
                      {notes.length > 0 ? 'Today' : 'Never'}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Actions */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
              />
            </div>
            
            {!creating && !editing && (
              <Button 
                onClick={() => setCreating(true)}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Create Note
              </Button>
            )}
          </div>

          {/* Create/Edit Note Form */}
          {(creating || editing) && (
            <Card className="glass-effect border-0 glow-effect mb-8">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Edit className="w-5 h-5" />
                  <span>{editing ? 'Edit Note' : 'Create New Note'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Enter note title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 text-lg font-semibold"
                />
                <Textarea
                  placeholder="Write your note content here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 resize-none"
                />
                <div className="flex space-x-3">
                  <Button
                    onClick={editing ? () => updateNote(editing) : createNote}
                    disabled={!title.trim() || !content.trim()}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {editing ? 'Update Note' : 'Create Note'}
                  </Button>
                  <Button onClick={cancelEditing} variant="outline" className="border-gray-600 text-gray-300">
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Usage Warning */}
          {user.tenant.subscription === 'FREE' && notes.length >= 2 && (
            <Card className="glass-effect border-yellow-500/50 bg-yellow-500/10 mb-6">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className="text-yellow-300 font-medium">
                      You&apos;re approaching your Free plan limit ({notes.length}/3 notes)
                    </p>
                    <p className="text-yellow-400/80 text-sm">
                      Upgrade to Pro for unlimited notes and advanced features
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes Grid */}
          {filteredNotes.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredNotes.map((note) => (
                <Card key={note.id} className="glass-effect border-0 card-hover h-fit">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-white text-lg line-clamp-2 flex-1 mr-2">
                        {note.title}
                      </CardTitle>
                      <div className="flex space-x-1 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEditing(note)}
                          className="text-gray-400 hover:text-white hover:bg-gray-700/50 w-8 h-8 p-0"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteNote(note.id)}
                          className="text-gray-400 hover:text-red-400 hover:bg-red-500/20 w-8 h-8 p-0"
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-gray-300 mb-4 line-clamp-4 text-sm leading-relaxed">
                      {note.content}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-2">
                        <User className="w-3 h-3" />
                        <span>{note.user.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="glass-effect border-0 text-center py-12">
              <CardContent>
                <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  {searchTerm ? 'No notes found' : 'No notes yet'}
                </h3>
                <p className="text-gray-400 mb-6">
                  {searchTerm 
                    ? 'Try adjusting your search terms' 
                    : 'Create your first note to get started with your digital workspace'
                  }
                </p>
                {!searchTerm && !creating && (
                  <Button 
                    onClick={() => setCreating(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Note
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AnimatedBackground>
  )
}