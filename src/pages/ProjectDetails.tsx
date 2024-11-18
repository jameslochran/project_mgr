import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlusCircle, ArrowLeft, Edit2, Calendar, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { Project, Milestone } from '../types';
import { calculateMilestoneBurn } from '../utils/calculations';
import { formatCurrency } from '../utils/formatters';
import ResourceHoursChart from '../components/ResourceHoursChart';
import MilestoneForm from '../components/MilestoneForm';
import ProjectForm from '../components/ProjectForm';
import DeleteConfirmation from '../components/DeleteConfirmation';
import { getProject, addMilestoneToProject, updateMilestone, deleteMilestone, deleteProject, updateProject } from '../db';

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [showMilestoneForm, setShowMilestoneForm] = useState<{ type: 'new' | 'edit', milestone?: Milestone } | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<{ type: 'project' | 'milestone'; id: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadProject(id);
    }
  }, [id]);

  const loadProject = async (projectId: string) => {
    try {
      const loadedProject = await getProject(projectId);
      if (loadedProject) {
        setProject(loadedProject);
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project');
    }
  };

  const handleProjectUpdate = async (projectData: Omit<Project, 'id' | 'milestones'>) => {
    if (!project) return;

    try {
      await updateProject(project.id, projectData);
      await loadProject(project.id);
      setShowProjectForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project');
    }
  };

  const handleMilestoneSubmit = async (milestoneData: Omit<Milestone, 'id'>) => {
    if (!project) return;

    try {
      if (showMilestoneForm?.type === 'new') {
        const milestone = {
          ...milestoneData,
          id: crypto.randomUUID(),
        };
        await addMilestoneToProject(project.id, milestone);
      } else if (showMilestoneForm?.type === 'edit' && showMilestoneForm.milestone) {
        await updateMilestone(project.id, showMilestoneForm.milestone.id, {
          ...milestoneData,
          id: showMilestoneForm.milestone.id,
        });
      }
      await loadProject(project.id);
      setShowMilestoneForm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to manage milestone');
    }
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    if (project) {
      try {
        await deleteMilestone(project.id, milestoneId);
        await loadProject(project.id);
        setShowDeleteConfirmation(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete milestone');
      }
    }
  };

  const handleDeleteProject = async () => {
    if (project) {
      try {
        await deleteProject(project.id);
        navigate('/');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete project');
      }
    }
  };

  if (!project) {
    return null;
  }

  const sortedMilestones = project.milestones.slice().sort((a, b) => 
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  const totalBurn = sortedMilestones.reduce((total, milestone) => 
    total + calculateMilestoneBurn(milestone.resources, project.hourlyRate), 0
  );

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        {project.isOwner && (
          <div className="ml-auto flex items-center gap-4">
            <button
              onClick={() => setShowProjectForm(true)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <Edit2 size={20} />
              Edit Project
            </button>
            <button
              onClick={() => setShowDeleteConfirmation({ type: 'project', id: project.id })}
              className="text-red-600 hover:text-red-700"
            >
              Delete Project
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold">{project.title}</h2>
            <p className="text-gray-600 mt-1">{project.description}</p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <DollarSign className="w-4 h-4 mr-2" />
                <span>Budget: {formatCurrency(project.budget)}</span>
                <span className="mx-2">•</span>
                <span>Burn: {formatCurrency(totalBurn)}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                <span>{formatCurrency(project.hourlyRate)}/hour</span>
              </div>
            </div>
          </div>
          {project.isOwner && (
            <button
              onClick={() => setShowMilestoneForm({ type: 'new' })}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              <PlusCircle size={20} />
              Add Milestone
            </button>
          )}
        </div>

        <div className="space-y-4">
          {sortedMilestones.map(milestone => {
            const milestoneBurn = calculateMilestoneBurn(milestone.resources, project.hourlyRate);
            const isOverBudget = milestoneBurn > milestone.budget;
            const storyProgress = Math.min(
              (milestone.totalStories ? (milestone.completedStories / milestone.totalStories) * 100 : 0),
              100
            );

            return (
              <div
                key={milestone.id}
                className={`bg-white p-4 rounded-lg border ${
                  isOverBudget ? 'border-red-500' : milestone.isDone ? 'border-green-500' : 'border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{milestone.title}</h3>
                    {milestone.isDone && (
                      <CheckCircle className="text-green-500" size={20} />
                    )}
                  </div>
                  {project.isOwner && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowMilestoneForm({ type: 'edit', milestone })}
                        className="text-gray-600 hover:text-blue-600"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirmation({ type: 'milestone', id: milestone.id })}
                        className="text-gray-600 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-sm text-gray-600 mt-1">Due: {new Date(milestone.dueDate).toLocaleDateString()}</p>

                <div className="mt-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Budget: {formatCurrency(milestone.budget)}</span>
                    <span>Burn: {formatCurrency(milestoneBurn)}</span>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Stories: {milestone.completedStories}/{milestone.totalStories}</span>
                      <span>{Math.round(storyProgress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`rounded-full h-2 ${milestone.isDone ? 'bg-green-600' : 'bg-blue-600'}`}
                        style={{ width: `${storyProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {sortedMilestones.length > 0 && (
          <div className="mt-8">
            <ResourceHoursChart 
              milestones={sortedMilestones} 
              hourlyRate={project.hourlyRate}
            />
          </div>
        )}
      </div>

      {/* Modal Forms */}
      {showProjectForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-xl w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Edit Project</h2>
            <ProjectForm
              initialData={project}
              onSubmit={handleProjectUpdate}
              onCancel={() => setShowProjectForm(false)}
            />
          </div>
        </div>
      )}

      {showMilestoneForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-xl w-full mx-4">
            <h2 className="text-xl font-bold mb-4">
              {showMilestoneForm.type === 'new' ? 'Add New' : 'Edit'} Milestone
            </h2>
            <MilestoneForm
              initialData={showMilestoneForm.milestone}
              onSubmit={handleMilestoneSubmit}
              onCancel={() => setShowMilestoneForm(null)}
            />
          </div>
        </div>
      )}

      {showDeleteConfirmation && (
        <DeleteConfirmation
          type={showDeleteConfirmation.type}
          onConfirm={() => {
            if (showDeleteConfirmation.type === 'project') {
              handleDeleteProject();
            } else {
              handleDeleteMilestone(showDeleteConfirmation.id);
            }
          }}
          onCancel={() => setShowDeleteConfirmation(null)}
        />
      )}
    </div>
  );
};

export default ProjectDetails;