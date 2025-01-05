'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Toast } from "@/components/ui/toast"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Share2, Trash2, User, Edit2, Search, Sun, Moon, Link, Copy, SortDesc, Clock, Calendar } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { motion, AnimatePresence } from 'framer-motion'
import { exportToJson, importFromJson } from '@/utils/importExport'
import { LinkPreview } from '@/components/LinkPreview'

interface Board {
  id: string;
  name: string;
  description: string;
  links: Link[];
  type: 'saved' | 'instant';
  createdAt: number;
}

interface Link {
  id: string;
  url: string;
  description: string;
  visited: boolean;
  createdAt: number;
  deadline?: string;
}

export default function HomePage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [newBoard, setNewBoard] = useState<Omit<Board, 'id' | 'links' | 'createdAt'>>({ name: '', description: '', type: 'saved' })
  const [newLink, setNewLink] = useState<Omit<Link, 'id' | 'visited' | 'createdAt'>>({ url: '', description: '', deadline: '' })
  const [editingBoard, setEditingBoard] = useState<{ originalBoard: Board, editedBoard: Board } | null>(null)
  const [editingLink, setEditingLink] = useState<{ board: Board, originalLink: Link, editedLink: Link } | null>(null)
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
  const { toast } = useToast()

  useEffect(() => {
    const savedBoards = Object.keys(localStorage)
      .filter(key => key.startsWith('board_'))
      .map(key => {
        try {
          return JSON.parse(localStorage.getItem(key) || '{}') as Board;
        } catch (error) {
          console.error('Error parsing board data:', error);
          return null;
        }
      })
      .filter((board): board is Board => board !== null);
    
    setBoards(savedBoards);

    // Clean up expired instant boards
    const currentTime = Date.now();
    const updatedBoards = savedBoards.filter(board => 
      board.type !== 'instant' || currentTime - board.createdAt <= 24 * 60 * 60 * 1000
    );
    setBoards(updatedBoards);
    updatedBoards.forEach(saveBoard);

    // Set initial dark mode based on user's preference
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDarkMode);
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const saveBoard = (board: Board) => {
    localStorage.setItem(`board_${board.id}`, JSON.stringify(board))
  }

  const deleteBoard = (boardId: string) => {
    localStorage.removeItem(`board_${boardId}`);
    setBoards(boards.filter(board => board.id !== boardId));
    setShowDeleteConfirm(false);
    setBoardToDelete(null);
    toast({
      title: "Board Deleted",
      description: "The board has been successfully deleted.",
    })
  }

  const createBoard = () => {
    if (newBoard.name) {
      const board: Board = { ...newBoard, id: uuidv4(), links: [], createdAt: Date.now() };
      setBoards([...boards, board]);
      if (board.type === 'saved') {
        saveBoard(board);
      }
      setNewBoard({ name: '', description: '', type: 'saved' });
      setShowCreateBoardDialog(false);
      toast({
        title: "Board Created",
        description: `${board.name} has been successfully created.`,
      })
    }
  };

  const updateBoard = () => {
    if (editingBoard) {
      const updatedBoards = boards.map(board => 
        board.id === editingBoard.originalBoard.id ? editingBoard.editedBoard : board
      );
      setBoards(updatedBoards);
      saveBoard(editingBoard.editedBoard);
      setEditingBoard(null);
      toast({
        title: "Board Updated",
        description: "The board has been successfully updated.",
      })
    }
  }

  const addLink = (boardId: string) => {
    if (newLink.url) {
      const updatedBoards = boards.map(board => {
        if (board.id === boardId) {
          const newLinkWithId: Link = { ...newLink, id: uuidv4(), visited: false, createdAt: Date.now() };
          const updatedBoard = {
            ...board,
            links: [...board.links, newLinkWithId]
          }
          saveBoard(updatedBoard)
          return updatedBoard
        }
        return board
      })
      setBoards(updatedBoards);
      setNewLink({ url: '', description: '', deadline: '' })
      toast({
        title: "Link Added",
        description: "The link has been successfully added to the board.",
      })
    }
  }

  const updateLink = () => {
    if (editingLink) {
      const updatedBoards = boards.map(board => {
        if (board.id === editingLink.board.id) {
          const updatedLinks = board.links.map(link => 
            link.id === editingLink.originalLink.id ? editingLink.editedLink : link
          )
          const updatedBoard = { ...board, links: updatedLinks }
          saveBoard(updatedBoard)
          return updatedBoard
        }
        return board
      })
      setBoards(updatedBoards);
      setEditingLink(null)
      toast({
        title: "Link Updated",
        description: "The link has been successfully updated.",
      })
    }
  }

  const deleteLink = (boardId: string, linkId: string) => {
    const updatedBoards = boards.map(board => {
      if (board.id === boardId) {
        const updatedBoard = {
          ...board,
          links: board.links.filter(link => link.id !== linkId)
        }
        saveBoard(updatedBoard)
        return updatedBoard
      }
      return board
    })
    setBoards(updatedBoards);
    toast({
      title: "Link Deleted",
      description: "The link has been successfully deleted from the board.",
    })
  }

  const toggleLinkVisited = (boardId: string, linkId: string) => {
    const updatedBoards = boards.map(board => {
      if (board.id === boardId) {
        const updatedLinks = board.links.map(link => 
          link.id === linkId ? { ...link, visited: !link.visited } : link
        )
        const updatedBoard = { ...board, links: updatedLinks }
        saveBoard(updatedBoard)
        return updatedBoard
      }
      return board
    })
    setBoards(updatedBoards);
  }

  const handleKeyPress = (event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter') {
      action();
      event.preventDefault();
    }
  }

  const shareBoard = (boardId: string) => {
    const board = boards.find(b => b.id === boardId);
    if (board) {
      const shareableData = JSON.stringify({ ...board, permission: sharePermission });
      const shareableUrl = `${window.location.origin}/share?data=${encodeURIComponent(shareableData)}`;
      setShareBoardId(shareableUrl);
      setShowShareDialog(true);
    }
  }

  const copyShareLink = () => {
    if (shareBoardId) {
      navigator.clipboard.writeText(shareBoardId);
      toast({
        title: "Link Copied",
        description: "The share link has been copied to your clipboard.",
      })
    }
  }

  const handleExport = () => {
    const jsonString = exportToJson(boards);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sharelinkz_boards.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Boards Exported",
      description: "Your boards have been exported successfully.",
    })
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        try {
          const importedBoards = importFromJson(content);
          setBoards(prevBoards => [...prevBoards, ...importedBoards]);
          importedBoards.forEach(saveBoard);
          toast({
            title: "Boards Imported",
            description: `${importedBoards.length} boards have been imported successfully.`,
          })
        } catch (error) {
          console.error('Error importing boards:', error);
          toast({
            title: "Import Failed",
            description: "There was an error importing the boards. Please check the file format.",
            variant: "destructive",
          })
        }
      };
      reader.readAsText(file);
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
        return a.createdAt - b.createdAt;
      } else {
        return b.createdAt - a.createdAt;
      }
    });

  return (
    <div className="min-h-screen bg-background text-foreground">
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
            <div className="flex items-center space-x-2">
              <Sun className="h-4 w-4 text-muted-foreground" />
              <Switch
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
              <Moon className="h-4 w-4 text-muted-foreground" />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Avatar>
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                    <AvatarFallback><User /></AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExport}>Export Boards</DropdownMenuItem>
                <DropdownMenuItem>
                  <label htmlFor="import-file" className="cursor-pointer">
                    Import Boards
                  </label>
                  <input
                    id="import-file"
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />
                </DropdownMenuItem>
                <DropdownMenuItem>Account Settings</DropdownMenuItem>
                <DropdownMenuItem>Sign Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
                                  value={editingBoard?.editedBoard.name || board.name}
                                  onChange={(e) => setEditingBoard({
                                    originalBoard: board,
                                    editedBoard: { ...editingBoard?.editedBoard || board, name: e.target.value }
                                  })}
                                  onKeyPress={(e) => handleKeyPress(e, updateBoard)}
                                  className="bg-background text-foreground"
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-board-description">Description</Label>
                                <Textarea
                                  id="edit-board-description"
                                  value={editingBoard?.editedBoard.description || board.description}
                                  onChange={(e) => setEditingBoard({
                                    originalBoard: board,
                                    editedBoard: { ...editingBoard?.editedBoard || board, description: e.target.value }
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
                        Expires in {Math.max(0, Math.floor((board.createdAt + 24 * 60 * 60 * 1000 - Date.now()) / (60 * 60 * 1000))} hours
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
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
                              <LinkPreview url={link.url} />
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
                                      value={editingLink?.editedLink.url || link.url}
                                      onChange={(e) => setEditingLink({
                                        board: board,
                                        originalLink: link,
                                        editedLink: { ...editingLink?.editedLink || link, url: e.target.value }
                                      })}
                                      onKeyPress={(e) => handleKeyPress(e, updateLink)}
                                      className="bg-background text-foreground"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="edit-link-description">Description</Label>
                                    <Input
                                      id="edit-link-description"
                                      value={editingLink?.editedLink.description || link.description}
                                      onChange={(e) => setEditingLink({
                                        board: board,
                                        originalLink: link,
                                        editedLink: { ...editingLink?.editedLink || link, description: e.target.value }
                                      })}
                                      className="bg-background text-foreground"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="edit-link-deadline">Deadline (Optional)</Label>
                                    <Input
                                      id="edit-link-deadline"
                                      type="datetime-local"
                                      value={editingLink?.editedLink.deadline || link.deadline}
                                      onChange={(e) => setEditingLink({
                                        board: board,
                                        originalLink: link,
                                        editedLink: { ...editingLink?.editedLink || link, deadline: e.target.value }
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

      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="bg-background text-foreground">
          <DialogHeader>
            <DialogTitle>Share Board</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Use this link to share your board:</p>
            <div className="flex items-center space-x-2">
              <Input value={shareBoardId || ''} readOnly className="bg-background text-foreground" />
              <Button onClick={copyShareLink}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  )
}

