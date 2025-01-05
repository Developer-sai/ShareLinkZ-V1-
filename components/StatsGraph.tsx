'use client'

import React from 'react'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface Board {
  id: string;
  name: string;
  links: { visited: boolean }[];
}

interface StatsGraphProps {
  boards: Board[];
}

export const StatsGraph: React.FC<StatsGraphProps> = ({ boards }) => {
  const data = {
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

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Board Statistics',
      },
    },
  }

  return <Bar options={options} data={data} />
}

