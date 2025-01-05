import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { QRCodeShare } from '@/components/QRCodeShare'
import { BoardPreview } from '@/components/BoardPreview'
import { Copy, Facebook, Twitter, Linkedin, PhoneIcon as Whatsapp, Instagram, SnailIcon as Snapchat, Mail, Send } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"
import html2canvas from 'html2canvas'

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  board: Board | undefined;
  sharePermission: 'read' | 'edit';
  setSharePermission: (permission: 'read' | 'edit') => void;
}

interface Board {
  id: string;
  name: string;
  description: string;
  links: any[];
}

export function ShareDialog({ open, onOpenChange, board, sharePermission, setSharePermission }: ShareDialogProps) {
  const { toast } = useToast()
  const shareableUrl = board ? `${window.location.origin}/share/${board.id}?permission=${sharePermission}` : ''
  const [boardImage, setBoardImage] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (open && board) {
      generateBoardImage()
    }
  }, [open, board])

  const generateBoardImage = async () => {
    const element = document.getElementById('board-preview')
    if (element) {
      const canvas = await html2canvas(element)
      setBoardImage(canvas.toDataURL('image/png'))
    }
  }

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareableUrl)
    toast({
      title: "Link Copied",
      description: "The share link has been copied to your clipboard.",
    })
  }

  const shareToSocialMedia = (platform: string) => {
    let url = ''
    const text = `Check out my ShareLinkZ board: ${board?.name}`

    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareableUrl)}`
        break
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareableUrl)}`
        break
      case 'linkedin':
        url = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareableUrl)}&title=${encodeURIComponent(text)}`
        break
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(text + ' ' + shareableUrl)}`
        break
      case 'instagram':
        // Instagram doesn't have a direct share URL, so we'll copy the link to clipboard
        navigator.clipboard.writeText(shareableUrl)
        toast({
          title: "Link Copied",
          description: "The share link has been copied. You can now paste it into your Instagram post or story.",
        })
        return
      case 'snapchat':
        url = `https://www.snapchat.com/scan?attachmentUrl=${encodeURIComponent(shareableUrl)}`
        break
      case 'gmail':
        url = `https://mail.google.com/mail/?view=cm&fs=1&tf=1&to=&su=${encodeURIComponent(`Check out my ShareLinkZ board: ${board?.name}`)}&body=${encodeURIComponent(`${text}\n\n${shareableUrl}`)}`
        break
      case 'outlook':
        url = `https://outlook.office.com/mail/deeplink/compose?subject=${encodeURIComponent(`Check out my ShareLinkZ board: ${board?.name}`)}&body=${encodeURIComponent(`${text}\n\n${shareableUrl}`)}`
        break
    }

    if (url) {
      window.open(url, '_blank')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background text-foreground max-w-4xl">
        <DialogHeader>
          <DialogTitle>Share Board: {board?.name}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div id="board-preview">
              <BoardPreview board={board} />
            </div>
            {boardImage && (
              <img src={boardImage} alt="Board Preview" className="w-full h-auto" />
            )}
            <div>
              <Label htmlFor="share-permission" className="text-foreground">Share Permission</Label>
              <Select
                value={sharePermission}
                onValueChange={(value: 'read' | 'edit') => setSharePermission(value)}
              >
                <SelectTrigger id="share-permission" className="bg-background text-foreground">
                  <SelectValue placeholder="Select permission" />
                </SelectTrigger>
                <SelectContent className="bg-background text-foreground">
                  <SelectItem value="read">Read Only</SelectItem>
                  <SelectItem value="edit">Edit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="share-link" className="text-foreground">Share Link</Label>
              <div className="flex items-center space-x-2">
                <Input id="share-link" value={shareableUrl} readOnly className="bg-background text-foreground" />
                <Button onClick={copyShareLink}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
            </div>
            <QRCodeShare url={shareableUrl} />
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Share to Social Media and Email</h3>
            <div className="grid grid-cols-3 gap-4">
              <Button onClick={() => shareToSocialMedia('facebook')} className="flex items-center justify-center">
                <Facebook className="h-5 w-5 mr-2" />
                Facebook
              </Button>
              <Button onClick={() => shareToSocialMedia('twitter')} className="flex items-center justify-center">
                <Twitter className="h-5 w-5 mr-2" />
                Twitter
              </Button>
              <Button onClick={() => shareToSocialMedia('linkedin')} className="flex items-center justify-center">
                <Linkedin className="h-5 w-5 mr-2" />
                LinkedIn
              </Button>
              <Button onClick={() => shareToSocialMedia('whatsapp')} className="flex items-center justify-center">
                <Whatsapp className="h-5 w-5 mr-2" />
                WhatsApp
              </Button>
              <Button onClick={() => shareToSocialMedia('instagram')} className="flex items-center justify-center">
                <Instagram className="h-5 w-5 mr-2" />
                Instagram
              </Button>
              <Button onClick={() => shareToSocialMedia('snapchat')} className="flex items-center justify-center">
                <Snapchat className="h-5 w-5 mr-2" />
                Snapchat
              </Button>
              <Button onClick={() => shareToSocialMedia('gmail')} className="flex items-center justify-center">
                <Mail className="h-5 w-5 mr-2" />
                Gmail
              </Button>
              <Button onClick={() => shareToSocialMedia('outlook')} className="flex items-center justify-center">
                <Send className="h-5 w-5 mr-2" />
                Outlook
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

