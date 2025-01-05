import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { QRCodeSVG } from 'qrcode.react'

interface QRCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
}

export function QRCodeDialog({ open, onOpenChange, url }: QRCodeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background text-foreground">
        <DialogHeader>
          <DialogTitle>QR Code for Shared Board</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center">
          <QRCodeSVG value={url} size={256} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

