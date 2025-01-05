'use client'

import React, { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Share2, Trash2, User, Edit2, Search, Sun, Moon, Link, Copy, SortDesc, Clock, Calendar, Settings, ChevronLeft } from 'lucide-react'
import { ShareDialog } from '@/components/ShareDialog'
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard'
import { ThemeCustomizer } from '@/components/ThemeCustomizer'

interface Board {
  id: string;
  name: string;
  description: string;
  links: Link[];
  type: 'saved' | 'instant';
  created_at: string;
}

interface Link {
  id: string;
  url: string;
  description: string;
  visited: boolean;
  created_at: string;
  deadline?: string;
}

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
}

export default function ShareLinkZ() {
  const [currentPage, setCurrentPage] = useState<'login' | 'profile' | 'home' | 'settings'>('login')
  const [userProfile, setUserProfile] = useState<UserProfile>({ name: '', email: '', phone: '', socialLinks: {} })
  const [boards, setBoards] = useState<Board[]>([])
  const [newBoard, setNewBoard] = useState<Omit<Board, 'id' | 'links' | 'created_at'>>({ name: '', description: '', type: 'saved' })
  const [newLink, setNewLink] = useState<Omit<Link, 'id' | 'visited' | 'created_at'>>({ url: '', description: '', deadline: '' })
  const [editingBoard, setEditingBoard] = useState<Board | null>(null)
  const [editingLink, setEditingLink] = useState<Link | null>(null)
  const [boardType, setBoardType] = useState<'saved' | 'instant'>('saved')
  const [searchTerm, setSearchTerm] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [boardToDelete, setBoardToDelete] = useState<Board | null>(null)
  const [darkMode, setDarkMode] = useState(false)
  const [showCreateBoardDialog, setShowCreateBoardDialog] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [shareBoardId, setShareBoardId] = useState<string | null>(null)
  const [sharePermission, setSharePermission] = useState<'read' | 'edit'>('read')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false)
  const [showThemeCustomizer, setShowThemeCustomizer] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  useEffect(() => {
    if (currentPage === 'home' && userProfile.name) {
      setShowWelcomeMessage(true)
      const timer = setTimeout(() => setShowWelcomeMessage(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [currentPage, userProfile.name])

  useEffect(() => {
    if (currentPage === 'home') {
      fetchBoards()
    }
  }, [currentPage])

  const fetchBoards = async () => {
    try {
      const response = await fetch('/api/boards')
      if (!response.ok) {
        throw new Error('Failed to fetch boards')
      }
      const data = await response.json()
      setBoards(data)
    } catch (error) {
      console.error('Error fetching boards:', error)
      toast({
        title: "Error",
        description: "Failed to fetch boards. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleLogin = () => {
    setCurrentPage('profile')
  }

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage('home')
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    })
  }

  const createBoard = async () => {
    if (newBoard.name) {
      try {
        const response = await fetch('/api/boards', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...newBoard, userId: 1 }), // Assuming user ID 1 for now
        })
        if (!response.ok) {
          throw new Error('Failed to create board')
        }
        const createdBoard = await response.json()
        setBoards([...boards, createdBoard])
        setNewBoard({ name: '', description: '', type: 'saved' })
        setShowCreateBoardDialog(false)
        toast({
          title: "Board Created",
          description: `${createdBoard.name} has been successfully created.`,
        })
      } catch (error) {
        console.error('Error creating board:', error)
        toast({
          title: "Error",
          description: "Failed to create board. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const updateBoard = async () => {
    if (editingBoard) {
      try {
        const response = await fetch(`/api/boards/${editingBoard.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: editingBoard.name, description: editingBoard.description }),
        })
        if (!response.ok) {
          throw new Error('Failed to update board')
        }
        const updatedBoard = await response.json()
        setBoards(boards.map(board => board.id === updatedBoard.id ? updatedBoard : board))
        setEditingBoard(null)
        toast({
          title: "Board Updated",
          description: "The board has been successfully updated.",
        })
      } catch (error) {
        console.error('Error updating board:', error)
        toast({
          title: "Error",
          description: "Failed to update board. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const deleteBoard = async (boardId: string) => {
    try {
      const response = await fetch(`/api/boards/${boardId}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to delete board')
      }
      setBoards(boards.filter(board => board.id !== boardId))
      setShowDeleteConfirm(false)
      setBoardToDelete(null)
      toast({
        title: "Board Deleted",
        description: "The board has been successfully deleted.",
      })
    } catch (error) {
      console.error('Error deleting board:', error)
      toast({
        title: "Error",
        description: "Failed to delete board. Please try again.",
        variant: "destructive",
      })
    }
  }

  const addLink = async (boardId: string) => {
    if (newLink.url) {
      try {
        const response = await fetch('/api/links', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...newLink, boardId }),
        })
        if (!response.ok) {
          throw new Error('Failed to add link')
        }
        const createdLink = await response.json()
        setBoards(boards.map(board => 
          board.id === boardId 
            ? { ...board, links: [...board.links, createdLink] }
            : board
        ))
        setNewLink({ url: '', description: '', deadline: '' })
        toast({
          title: "Link Added",
          description: "The link has been successfully added to the board.",
        })
      } catch (error) {
        console.error('Error adding link:', error)
        toast({
          title: "Error",
          description: "Failed to add link. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const updateLink = async () => {
    if (editingLink) {
      try {
        const response = await fetch(`/api/links/${editingLink.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(editingLink),
        })
        if (!response.ok) {
          throw new Error('Failed to update link')
        }
        const updatedLink = await response.json()
        setBoards(boards.map(board => ({
          ...board,
          links: board.links.map(link => link.id === updatedLink.id ? updatedLink : link)
        })))
        setEditingLink(null)
        toast({
          title: "Link Updated",
          description: "The link has been successfully updated.",
        })
      } catch (error) {
        console.error('Error updating link:', error)
        toast({
          title: "Error",
          description: "Failed to update link. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const deleteLink = async (boardId: string, linkId: string) => {
    try {
      const response = await fetch(`/api/links/${linkId}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to delete link')
      }
      setBoards(boards.map(board => 
        board.id === boardId
          ? { ...board, links: board.links.filter(link => link.id !== linkId) }
          : board
      ))
      toast({
        title: "Link Deleted",
        description: "The link has been successfully deleted from the board.",
      })
    } catch (error) {
      console.error('Error deleting link:', error)
      toast({
        title: "Error",
        description: "Failed to delete link. Please try again.",
        variant: "destructive",
      })
    }
  }

  const toggleLinkVisited = async (boardId: string, linkId: string) => {
    const board = boards.find(b => b.id === boardId)
    const link = board?.links.find(l => l.id === linkId)
    if (link) {
      try {
        const response = await fetch(`/api/links/${linkId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...link, visited: !link.visited }),
        })
        if (!response.ok) {
          throw new Error('Failed to update link')
        }
        const updatedLink = await response.json()
        setBoards(boards.map(board => 
          board.id === boardId
            ? { ...board, links: board.links.map(l => l.id === linkId ? updatedLink : l) }
            : board
        ))
      } catch (error) {
        console.error('Error toggling link visited status:', error)
        toast({
          title: "Error",
          description: "Failed to update link status. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const handleKeyPress = (event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter') {
      action()
      event.preventDefault()
    }
  }

  const shareBoard = (boardId: string) => {
    const board = boards.find(b => b.id === boardId)
    if (board) {
      setShareBoardId(board.id)
      setShowShareDialog(true)
    }
  }

  const sortedAndFilteredBoards = boards
    .filter(board => 
      board.type === boardType &&
      (board.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       board.links.some(link => 
         link.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
         link.description.toLowerCase().includes(searchTerm.toLowerCase())
       )
      )
    )
    .sort((a, b) => {
      if (sortOrder === 'asc') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      } else {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

  if (currentPage === 'login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-400 to-purple-500">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-[350px]">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">Welcome to ShareLinkZ</CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={handleLogin}>
                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                  <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                </svg>
                Login with Google
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  if (currentPage === 'profile') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-400 to-blue-500">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-[400px]">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">Complete Your Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={userProfile.name}
                    onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userProfile.email}
                    onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={userProfile.phone}
                    onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">Save Profile</Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  if (currentPage === 'settings') {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <header className="bg-card shadow-md">
          <div className="container mx-auto px-4 py-4 flex items-center">
            <Button variant="ghost" onClick={() => setCurrentPage('home')}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <h1 className="text-2xl font-bold ml-4">Settings</h1>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>User Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="settings-name">Name</Label>
                <Input
                  id="settings-name"
                  value={userProfile.name}
                  onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="settings-email">Email</Label>
                <Input
                  id="settings-email"
                  type="email"
                  value={userProfile.email}
                  onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="settings-phone">Phone Number</Label>
                <Input
                  id="settings-phone"
                  type="tel"
                  value={userProfile.phone}
                  onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value })}
                />
              </div>
              <div>
                <Label>Social Media Links</Label>
                <div className="space-y-2">
                  <Input
                    placeholder="Facebook URL"
                    value={userProfile.socialLinks.facebook || ''}
                    onChange={(e) => setUserProfile({
                      ...userProfile,
                      socialLinks: { ...userProfile.socialLinks, facebook: e.target.value }
                    })}
                  />
                  <Input
                    placeholder="Twitter URL"
                    value={userProfile.socialLinks.twitter || ''}
                    onChange={(e) => setUserProfile({
                      ...userProfile,
                      socialLinks: { ...userProfile.socialLinks, twitter: e.target.value }
                    })}
                  />
                  <Input
                    placeholder="Instagram URL"
                    value={userProfile.socialLinks.instagram || ''}
                    onChange={(e) => setUserProfile({
                      ...userProfile,
                      socialLinks: { ...userProfile.socialLinks, instagram: e.target.value }
                    })}
                  />
                  <Input
                    placeholder="LinkedIn URL"
                    value={userProfile.socialLinks.linkedin || ''}
                    onChange={(e) => setUserProfile({
                      ...userProfile,
                      socialLinks: { ...userProfile.socialLinks, linkedin: e.target.value }
                    })}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <Switch
                  id="dark-mode"
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => {
                setCurrentPage('home')
                toast({
                  title: "Settings Saved",
                  description: "Your settings have been successfully updated.",
                })
              }}>
                Save Settings
              </Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Analytics Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <AnalyticsDashboard boards={boards} />
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AnimatePresence>
        {showWelcomeMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-0 left-0 right-0 bg-green-500 text-white p-4 text-center z-50"
          >
            <p className="text-lg font-semibold">Welcome back, {userProfile.name}!</p>
          </motion.div>
        )}
      </AnimatePresence>
      <header className="bg-card shadow-md">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between">
          <h1 className="text-3xl font-bold text-primary mb-4 sm:mb-0">ShareLinkZ</h1>
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Input
              type="text"
              placeholder="Search boards and links..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64"
            />
            <Button
              variant="default"
              className="w-full sm:w-auto"
              onClick={() => setShowCreateBoardDialog(true)}
            >
              <Plus className="mr-2 h-4 w-4" /> Create Board
            </Button>
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setCurrentPage('settings')}
            >
              <Settings className="mr-2 h-4 w-4" /> Settings
            </Button>
            <div className="flex items-center space-x-2">
              <Sun className="h-4 w-4 text-muted-foreground" />
              <Switch
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
              <Moon className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <Tabs defaultValue="saved" className="w-full sm:w-auto mb-4 sm:mb-0">
            <TabsList className="grid w-full sm:w-auto grid-cols-2">
              <TabsTrigger value="saved" onClick={() => setBoardType('saved')}>Saved Boards</TabsTrigger>
              <TabsTrigger value="instant" onClick={() => setBoardType('instant')}>Instant Boards</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              <SortDesc className="mr-2 h-4 w-4" />
              Sort {sortOrder === 'asc' ? 'Oldest' : 'Newest'}
            </Button>
          </div>
        </div>
        <AnimatePresence>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedAndFilteredBoards.map((board) => (
              <motion.div
                key={board.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span className="text-xl font-bold text-primary">{board.name}</span>
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-background text-foreground">
                            <DialogHeader>
                              <DialogTitle>Edit Board</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="edit-board-name">Board Name</Label>
                                <Input
                                  id="edit-board-name"
                                  value={editingBoard?.name || board.name}
                                  onChange={(e) => setEditingBoard({
                                    ...editingBoard!,
                                    name: e.target.value
                                  })}
                                  onKeyPress={(e) => handleKeyPress(e, updateBoard)}
                                  className="bg-background text-foreground"
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-board-description">Description</Label>
                                <Textarea
                                  id="edit-board-description"
                                  value={editingBoard?.description || board.description}
                                  onChange={(e) => setEditingBoard({
                                    ...editingBoard!,
                                    description: e.target.value
                                  })}
                                  className="bg-background text-foreground"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button onClick={updateBoard}>Save Changes</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Button variant="ghost" size="icon" onClick={() => shareBoard(board.id)}>
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setBoardToDelete(board);
                            setShowDeleteConfirm(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                    {board.description && <p className="text-sm text-muted-foreground">{board.description}</p>}
                    {board.type === 'instant' && (
                      <p className="text-xs text-orange-500">
                        <Clock className="inline-block mr-1 h-3 w-3" />
                        Expires in {Math.max(0, Math.floor((new Date(board.created_at).getTime() + 24 * 60 * 60 * 1000 - Date.now()) / (60 * 60 * 1000)))} hours
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      <ul className="space-y-2">
                        {board.links.map((link) => (
                          <li key={link.id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 overflow-hidden">
                              <Checkbox
                                checked={link.visited}
                                onCheckedChange={() => toggleLinkVisited(board.id, link.id)}
                              />
                              <div className="overflow-hidden">
                                <a
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`text-blue-600 dark:text-blue-400 hover:underline ${link.visited ? 'line-through' : ''} truncate block`}
                                >
                                  {link.url}
                                </a>
                                {link.description && (
                                  <p className="text-sm text-muted-foreground truncate">{link.description}</p>
                                )}
                                {link.deadline && (
                                  <p className="text-xs text-orange-500">
                                    <Calendar className="inline-block mr-1 h-3 w-3" />
                                    Deadline: {new Date(link.deadline).toLocaleString()}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex space-x-2 ml-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-background text-foreground">
                                  <DialogHeader>
                                    <DialogTitle>Edit Link</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label htmlFor="edit-link-url">URL</Label>
                                      <Input
                                        id="edit-link-url"
                                        value={editingLink?.url || link.url}
                                        onChange={(e) => setEditingLink({
                                          ...editingLink!,
                                          url: e.target.value
                                        })}
                                        onKeyPress={(e) => handleKeyPress(e, updateLink)}
                                        className="bg-background text-foreground"
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="edit-link-description">Description</Label>
                                      <Input
                                        id="edit-link-description"
                                        value={editingLink?.description || link.description}
                                        onChange={(e) => setEditingLink({
                                          ...editingLink!,
                                          description: e.target.value
                                        })}
                                        className="bg-background text-foreground"
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="edit-link-deadline">Deadline (Optional)</Label>
                                      <Input
                                        id="edit-link-deadline"
                                        type="datetime-local"
                                        value={editingLink?.deadline || link.deadline}
                                        onChange={(e) => setEditingLink({
                                          ...editingLink!,
                                          deadline: e.target.value
                                        })}
                                        className="bg-background text-foreground"
                                      />
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button onClick={updateLink}>Save Changes</Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                              <Button variant="ghost" size="icon" onClick={() => deleteLink(board.id, link.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </ScrollArea>
                  </CardContent>
                  <CardFooter>
                    <form onSubmit={(e) => { e.preventDefault(); addLink(board.id); }} className="space-y-2 w-full">
                      <Input
                        value={newLink.url}
                        onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                        placeholder="Enter link URL"
                        onKeyPress={(e) => handleKeyPress(e, () => addLink(board.id))}
                        className="bg-background text-foreground"
                      />
                      <Input
                        value={newLink.description}
                        onChange={(e) => setNewLink({ ...newLink, description: e.target.value })}
                        placeholder="Enter link description (optional)"
                        className="bg-background text-foreground"
                      />
                      <Input
                        type="datetime-local"
                        value={newLink.deadline}
                        onChange={(e) => setNewLink({ ...newLink, deadline: e.target.value })}
                        className="bg-background text-foreground"
                      />
                      <Button type="submit" className="w-full">Add Link</Button>
                    </form>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </main>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="bg-background text-foreground">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this board? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => boardToDelete && deleteBoard(boardToDelete.id)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCreateBoardDialog} onOpenChange={setShowCreateBoardDialog}>
        <DialogContent className="bg-background text-foreground">
          <DialogHeader>
            <DialogTitle className="text-foreground">Create New Board</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="board-name" className="text-foreground">Board Name</Label>
              <Input
                id="board-name"
                value={newBoard.name}
                onChange={(e) => setNewBoard({ ...newBoard, name: e.target.value })}
                onKeyPress={(e) => handleKeyPress(e, createBoard)}
                placeholder="Enter board name"
                className="bg-background text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div>
              <Label htmlFor="board-description" className="text-foreground">Description (Optional)</Label>
              <Textarea
                id="board-description"
                value={newBoard.description}
                onChange={(e) => setNewBoard({ ...newBoard, description: e.target.value })}
                placeholder="Enter board description"
                className="bg-background text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div>
              <Label htmlFor="board-type" className="text-foreground">Board Type</Label>
              <Select
                value={newBoard.type}
                onValueChange={(value: 'saved' | 'instant') => setNewBoard({ ...newBoard, type: value })}
              >
                <SelectTrigger id="board-type" className="bg-background text-foreground">
                  <SelectValue placeholder="Select board type" />
                </SelectTrigger>
                <SelectContent className="bg-background text-foreground">
                  <SelectItem value="saved">Saved Board</SelectItem>
                  <SelectItem value="instant">Instant Board (24h)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={createBoard}>Create Board</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ShareDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        board={boards.find(b => b.id === shareBoardId)}
        sharePermission={sharePermission}
        setSharePermission={setSharePermission}
      />

      <ThemeCustomizer
        open={showThemeCustomizer}
        onOpenChange={setShowThemeCustomizer}
      />

      <Toaster />
    </div>
  )
}

