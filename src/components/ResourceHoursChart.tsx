import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Milestone } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ResourceHoursChartProps {
  milestones: Milestone[];
  hourlyRate: number;
}

const ResourceHoursChart: React.FC<ResourceHoursChartProps> = ({ milestones, hourlyRate }) => {
  const resourceTypes = ['Developer', 'PM', 'QA', 'Design', 'Devops', 'Content'] as const;
  const colors = {
    Developer: 'rgba(59, 130, 246, 0.8)',
    PM: 'rgba(16, 185, 129, 0.8)',
    QA: 'rgba(245, 158, 11, 0.8)',
    Design: 'rgba(236, 72, 153, 0.8)',
    Devops: 'rgba(139, 92, 246, 0.8)',
    Content: 'rgba(239, 68, 68, 0.8)',
  };

  const sortedMilestones = [...milestones].sort((a, b) => 
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        ticks: {
          callback: (value: number) => `$${value.toLocaleString()}`,
        },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Resource Cost by Milestone',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            return `${context.dataset.label}: $${value.toLocaleString()}`;
          },
        },
      },
    },
  };

  const data = {
    labels: sortedMilestones.map(m => m.title),
    datasets: resourceTypes.map(type => ({
      label: type,
      data: sortedMilestones.map(milestone => {
        const resource = milestone.resources.find(r => r.type === type);
        return resource ? resource.quantity * hourlyRate : 0;
      }),
      backgroundColor: colors[type],
      borderColor: colors[type],
      borderWidth: 1,
    })),
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="h-[400px]">
        <Bar options={options} data={data} />
      </div>
      <div className="mt-4 text-sm text-gray-500 text-center">
        Cost breakdown by resource type and milestone
      </div>
    </div>
  );
};

export default ResourceHoursChart;