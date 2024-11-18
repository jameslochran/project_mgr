import React, { useState, useEffect } from 'react';
import type { Milestone, Resource } from '../types';

interface MilestoneFormProps {
  onSubmit: (milestone: Omit<Milestone, 'id'>) => void;
  onCancel: () => void;
  initialData?: Milestone;
}

const resourceTypes = ['Developer', 'PM', 'QA', 'Design', 'Devops', 'Content'] as const;

const defaultFormData = {
  title: '',
  dueDate: '',
  budget: 0,
  resources: resourceTypes.map(type => ({ type, quantity: 0 })),
  totalStories: 0,
  completedStories: 0,
  isDone: false
};

const MilestoneForm: React.FC<MilestoneFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    if (initialData) {
      const resources = resourceTypes.map(type => {
        const existingResource = initialData.resources.find(r => r.type === type);
        return existingResource || { type, quantity: 0 };
      });

      setFormData({
        title: initialData.title || '',
        dueDate: initialData.dueDate || '',
        budget: initialData.budget || 0,
        resources,
        totalStories: initialData.totalStories || 0,
        completedStories: initialData.completedStories || 0,
        isDone: initialData.isDone || false
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleResourceChange = (type: Resource['type'], value: string) => {
    const quantity = value === '' ? 0 : parseFloat(value);
    setFormData(prev => ({
      ...prev,
      resources: prev.resources.map(resource =>
        resource.type === type ? { ...resource, quantity } : resource
      ),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Due Date</label>
        <input
          type="date"
          value={formData.dueDate}
          onChange={e => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Budget</label>
        <input
          type="number"
          value={formData.budget}
          onChange={e => setFormData(prev => ({ ...prev, budget: Number(e.target.value) }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
          min="0"
          step="0.01"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Resources</label>
        <div className="grid grid-cols-2 gap-4">
          {resourceTypes.map(type => {
            const resource = formData.resources.find(r => r.type === type);
            return (
              <div key={type}>
                <label className="block text-sm text-gray-600">{type}</label>
                <input
                  type="number"
                  value={resource?.quantity ?? 0}
                  onChange={e => handleResourceChange(type, e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min="0"
                  step="0.1"
                  placeholder="0.0"
                />
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Total Stories</label>
        <input
          type="number"
          value={formData.totalStories}
          onChange={e => setFormData(prev => ({ ...prev, totalStories: Number(e.target.value) }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
          min="0"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Completed Stories</label>
        <input
          type="number"
          value={formData.completedStories}
          onChange={e => setFormData(prev => ({ ...prev, completedStories: Number(e.target.value) }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
          min="0"
        />
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.isDone}
            onChange={e => setFormData(prev => ({ ...prev, isDone: e.target.checked }))}
            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">Mark as Done</span>
        </label>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {initialData ? 'Update' : 'Create'} Milestone
        </button>
      </div>
    </form>
  );
};

export default MilestoneForm;