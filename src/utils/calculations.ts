import { Milestone, Resource } from '../types';

export const calculateMilestoneBurn = (resources: Resource[], hourlyRate: number): number => {
  return resources.reduce((total, resource) => total + resource.quantity * hourlyRate, 0);
};

export const calculateProjectBurn = (milestones: Milestone[], hourlyRate: number): number => {
  return milestones.reduce((total, milestone) => total + calculateMilestoneBurn(milestone.resources, hourlyRate), 0);
};