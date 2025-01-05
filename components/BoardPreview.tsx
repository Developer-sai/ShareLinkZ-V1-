import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface BoardPreviewProps {
  board: Board | undefined;
}

interface Board {
  id: string;
  name: string;
  description: string;
  links: Link[];
}

interface Link {
  id: string;
  url: string;
  description: string;
}

export function BoardPreview({ board }: BoardPreviewProps) {
  if (!board) return null

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{board.name}</CardTitle>
      </CardHeader>
      <CardContent>
        {board.description && <p className="text-sm text-muted-foreground mb-4">{board.description}</p>}
        <ScrollArea className="h-[200px]">
          <ul className="space-y-2">
            {board.links.map((link) => (
              <li key={link.id} className="text-sm">
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                  {link.url}
                </a>
                {link.description && <p className="text-muted-foreground">{link.description}</p>}
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

