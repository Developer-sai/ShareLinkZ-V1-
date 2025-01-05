import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, Pie } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

interface Board {
  id: string;
  name: string;
  links: Array<{
    visited: boolean;
    deadline?: string;
  }>;
}

interface AnalyticsDashboardProps {
  boards: Board[];
}

export function AnalyticsDashboard({ boards }: AnalyticsDashboardProps) {
  const totalBoards = boards.length
  const totalLinks = boards.reduce((sum, board) => sum + board.links.length, 0)
  const visitedLinks = boards.reduce((sum, board) => sum + board.links.filter(link => link.visited).length, 0)
  const unvisitedLinks = totalLinks - visitedLinks
  const linksWithDeadline = boards.reduce((sum, board) => sum + board.links.filter(link => link.deadline).length, 0)

  const boardData = {
    labels: boards.map(board => board.name),
    datasets: [
      {
        label: 'Total Links',
        data: boards.map(board => board.links.length),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
      {
        label: 'Visited Links',
        data: boards.map(board => board.links.filter(link => link.visited).length),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  }

  const visitedData = {
    labels: ['Visited', 'Unvisited'],
    datasets: [
      {
        data: [visitedLinks, unvisitedLinks],
        backgroundColor: ['rgba(75, 192, 192, 0.5)', 'rgba(255, 99, 132, 0.5)'],
      },
    ],
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Boards</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{totalBoards}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Links</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{totalLinks}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Visited Links</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{visitedLinks}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Links with Deadline</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{linksWithDeadline}</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Links per Board</CardTitle>
          </CardHeader>
          <CardContent>
            <Bar data={boardData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Visited vs Unvisited Links</CardTitle>
          </CardHeader>
          <CardContent>
            <Pie data={visitedData} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

