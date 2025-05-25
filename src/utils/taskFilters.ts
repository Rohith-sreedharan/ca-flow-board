
import { Task } from '@/store/slices/tasksSlice';

export interface TaskFilters {
  status?: string[];
  priority?: string[];
  category?: string[];
  assignedTo?: string[];
  dueDate?: string;
}

export const filterTasks = (tasks: Task[], activeFilters: TaskFilters): Task[] => {
  return tasks.filter(task => {
    if (activeFilters.status && activeFilters.status.length > 0) {
      if (!activeFilters.status.includes(task.status)) return false;
    }
    
    if (activeFilters.priority && activeFilters.priority.length > 0) {
      if (!activeFilters.priority.includes(task.priority)) return false;
    }
    
    if (activeFilters.category && activeFilters.category.length > 0) {
      if (!activeFilters.category.includes(task.category)) return false;
    }
    
    if (activeFilters.assignedTo && activeFilters.assignedTo.length > 0) {
      if (!task.assignedTo.some(userId => activeFilters.assignedTo?.includes(userId))) return false;
    }
    
    if (activeFilters.dueDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Check for tasks due today
      if (activeFilters.dueDate === 'today') {
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        
        if (dueDate.getTime() !== today.getTime()) return false;
      }
      
      // Check for overdue tasks
      if (activeFilters.dueDate === 'overdue') {
        const dueDate = new Date(task.dueDate);
        if (!(dueDate < today && task.status !== 'completed')) return false;
      }
      
      // Check for tasks due this week
      if (activeFilters.dueDate === 'thisWeek') {
        const dueDate = new Date(task.dueDate);
        const dayOfWeek = today.getDay();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - dayOfWeek);
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        
        if (!(dueDate >= startOfWeek && dueDate <= endOfWeek)) return false;
      }
    }
    
    return true;
  });
};
