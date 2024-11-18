import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Users, User } from 'lucide-react';
import ProjectCard from '../components/ProjectCard';
import ProjectForm from '../components/ProjectForm';
import { getAllProjects, addProject } from '../db';
import type { Project } from '../types';

const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, [showAllProjects]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedProjects = await getAllProjects(showAllProjects);
      // Sort projects by start date (oldest first)
      const sortedProjects = loadedProjects.sort((a, b) => 
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );
      setProjects(sortedProjects);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (projectData: Omit<Project, 'id' | 'milestones'>) => {
    try {
      setError(null);
      const id = await addProject(projectData);
      await loadProjects();
      setShowNewProjectForm(false);
      navigate(`/project/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Projects Dashboard</h1>
          <button
            onClick={() => setShowAllProjects(!showAllProjects)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
              showAllProjects 
                ? 'bg-blue-50 border-blue-200 text-blue-700' 
                : 'bg-gray-50 border-gray-200 text-gray-700'
            }`}
          >
            {showAllProjects ? (
              <>
                <Users size={20} />
                All Projects
              </>
            ) : (
              <>
                <User size={20} />
                My Projects
              </>
            )}
          </button>
        </div>
        <button
          onClick={() => setShowNewProjectForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <PlusCircle size={20} />
          New Project
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {projects.length === 0 && !error ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {showAllProjects ? 'No projects available' : 'No projects yet'}
          </h3>
          <p className="text-gray-600">
            {showAllProjects 
              ? 'There are no projects to display at the moment.'
              : 'Create your first project to get started!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onSelect={() => navigate(`/project/${project.id}`)}
              showOwnership={showAllProjects}
            />
          ))}
        </div>
      )}

      {showNewProjectForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-xl w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Create New Project</h2>
            <ProjectForm
              onSubmit={handleCreateProject}
              onCancel={() => setShowNewProjectForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;