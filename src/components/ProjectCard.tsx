import React from 'react';
import { Calendar, DollarSign, Clock, TrendingUp, User } from 'lucide-react';
import type { Project } from '../types';
import { calculateMilestoneBurn } from '../utils/calculations';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../utils/formatters';

interface ProjectCardProps {
  project: Project & { isOwner?: boolean };
  onSelect: (id: string) => void;
  showOwnership?: boolean;
}

export default function ProjectCard({ project, onSelect, showOwnership }: ProjectCardProps) {
  const { user } = useAuth();

  const totalBurn = project.milestones.reduce((total, milestone) => 
    total + calculateMilestoneBurn(milestone.resources, project.hourlyRate), 0
  );

  const totalStories = project.milestones.reduce((total, milestone) => 
    total + milestone.totalStories, 0
  );
  
  const completedStories = project.milestones.reduce((total, milestone) => 
    total + milestone.completedStories, 0
  );

  const storyProgress = Math.min((totalStories ? (completedStories / totalStories) * 100 : 0), 100);
  const isOverBudget = totalBurn > project.budget;

  return (
    <div 
      onClick={() => onSelect(project.id)}
      className={`bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all hover:shadow-lg overflow-hidden
        ${isOverBudget ? 'border-2 border-red-500' : ''}`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xl font-semibold text-gray-900">{project.title}</h3>
        {showOwnership && (
          <span className={`text-sm px-2 py-1 rounded ${
            project.isOwner 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            <User size={16} className="inline mr-1" />
            {project.isOwner ? 'Owner' : 'Shared'}
          </span>
        )}
      </div>
      
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>
      
      <div className="space-y-3">
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="w-4 h-4 mr-2" />
          <span>{new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <DollarSign className="w-4 h-4 mr-2" />
            <span>Budget: {formatCurrency(project.budget)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <TrendingUp className="w-4 h-4 mr-2" />
            <span>Burn: {formatCurrency(totalBurn)}</span>
          </div>
        </div>
        
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="w-4 h-4 mr-2" />
          <span>{formatCurrency(project.hourlyRate)}/hour</span>
        </div>

        <div className="pt-2">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Stories Progress</span>
            <span className="font-medium">
              {completedStories}/{totalStories}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${storyProgress}%` }}
            />
          </div>
        </div>

        {isOverBudget && (
          <div className="text-red-600 text-sm font-medium mt-2">
            Warning: Project is over budget
          </div>
        )}
      </div>
    </div>
  );
}