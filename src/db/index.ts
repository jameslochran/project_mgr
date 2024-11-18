import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where
} from 'firebase/firestore';
import type { Project, Milestone } from '../types';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const db = getFirestore(app);

export async function getAllProjects(showAllProjects: boolean = false): Promise<Project[]> {
  const userId = auth.currentUser?.uid;
  if (!userId) return [];

  try {
    const projectsRef = collection(db, 'projects');
    let baseQuery;
    
    if (showAllProjects) {
      baseQuery = query(projectsRef);
    } else {
      baseQuery = query(projectsRef, where('userId', '==', userId));
    }

    try {
      const orderedQuery = query(baseQuery, orderBy('startDate', 'desc'));
      const snapshot = await getDocs(orderedQuery);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          isOwner: data.userId === userId
        } as Project & { isOwner: boolean };
      });
    } catch (error) {
      console.warn('Using fallback query without ordering due to missing index');
      const snapshot = await getDocs(baseQuery);
      const projects = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          isOwner: data.userId === userId
        } as Project & { isOwner: boolean };
      });
      
      return projects.sort((a, b) => 
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      );
    }
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw new Error('Failed to fetch projects. Please try again later.');
  }
}

export async function getProject(id: string): Promise<Project | undefined> {
  try {
    const docRef = doc(db, 'projects', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        id: docSnap.id,
        isOwner: data.userId === auth.currentUser?.uid
      } as Project;
    }
    return undefined;
  } catch (error) {
    console.error('Error fetching project:', error);
    throw new Error('Failed to fetch project details.');
  }
}

export async function addProject(project: Omit<Project, 'id' | 'milestones'>): Promise<string> {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User must be authenticated to create a project');

    const projectData = {
      ...project,
      userId,
      milestones: [],
      createdAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'projects'), projectData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating project:', error);
    throw new Error('Failed to create project.');
  }
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<void> {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User must be authenticated to update a project');

    const project = await getProject(id);
    if (!project) throw new Error('Project not found');
    if (project.userId !== userId) throw new Error('Unauthorized to update this project');

    const docRef = doc(db, 'projects', id);
    await updateDoc(docRef, updates);
  } catch (error) {
    console.error('Error updating project:', error);
    throw new Error('Failed to update project.');
  }
}

export async function deleteProject(id: string): Promise<void> {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User must be authenticated to delete a project');

    const project = await getProject(id);
    if (!project) throw new Error('Project not found');
    if (project.userId !== userId) throw new Error('Unauthorized to delete this project');

    const docRef = doc(db, 'projects', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting project:', error);
    throw new Error('Failed to delete project.');
  }
}

export async function addMilestoneToProject(projectId: string, milestone: Milestone): Promise<void> {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User must be authenticated to add a milestone');

    const project = await getProject(projectId);
    if (!project) throw new Error('Project not found');
    if (project.userId !== userId) throw new Error('Unauthorized to modify this project');

    const docRef = doc(db, 'projects', projectId);
    await updateDoc(docRef, {
      milestones: [...project.milestones, milestone]
    });
  } catch (error) {
    console.error('Error adding milestone:', error);
    throw new Error('Failed to add milestone.');
  }
}

export async function updateMilestone(projectId: string, milestoneId: string, milestone: Milestone): Promise<void> {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User must be authenticated to update a milestone');

    const project = await getProject(projectId);
    if (!project) throw new Error('Project not found');
    if (project.userId !== userId) throw new Error('Unauthorized to modify this project');

    const updatedMilestones = project.milestones.map(m =>
      m.id === milestoneId ? milestone : m
    );

    const docRef = doc(db, 'projects', projectId);
    await updateDoc(docRef, {
      milestones: updatedMilestones
    });
  } catch (error) {
    console.error('Error updating milestone:', error);
    throw new Error('Failed to update milestone.');
  }
}

export async function deleteMilestone(projectId: string, milestoneId: string): Promise<void> {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User must be authenticated to delete a milestone');

    const project = await getProject(projectId);
    if (!project) throw new Error('Project not found');
    if (project.userId !== userId) throw new Error('Unauthorized to modify this project');

    const updatedMilestones = project.milestones.filter(m => m.id !== milestoneId);

    const docRef = doc(db, 'projects', projectId);
    await updateDoc(docRef, {
      milestones: updatedMilestones
    });
  } catch (error) {
    console.error('Error deleting milestone:', error);
    throw new Error('Failed to delete milestone.');
  }
}