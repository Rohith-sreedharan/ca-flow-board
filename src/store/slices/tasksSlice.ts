
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { mockTaskTemplates } from '@/data/mockTaskTemplates';
import { mockTasks } from '@/data/mockTasks';

export type TaskStatus = 'todo' | 'inprogress' | 'review' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskCategory = 'gst_filing' | 'itr_filing' | 'roc_filing' | 'other';

export interface TaskTemplate {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  isRecurring: boolean;
  recurrencePattern?: 'monthly' | 'yearly' | 'custom';
  deadline?: string;
  subtasks: SubTask[];
  price?: number;
  isPayableTask: boolean;
  payableTaskType?: 'payable_task_1' | 'payable_task_2';
  assignedEmployeeId?: string;
  createdBy: string;
  createdAt: string;
}

export interface SubTask {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  isCompleted?: boolean;
  completed?: boolean;
  order?: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  clientId: string;
  clientName: string;
  assignedTo: string[];
  createdBy: string;
  createdAt: string;
  dueDate: string;
  completedAt?: string;
  isTemplate: boolean;
  templateId?: string;
  parentTaskId?: string;
  isRecurring: boolean;
  recurrencePattern?: string;
  attachments?: string[];
  subtasks?: SubTask[];
  comments?: {
    id: string;
    userId: string;
    userName: string;
    message: string;
    timestamp: string;
  }[];
  price?: number;
  isPayableTask: boolean;
  payableTaskType?: 'payable_task_1' | 'payable_task_2';
  quotationSent?: boolean;
  paymentStatus?: 'pending' | 'paid' | 'failed';
  quotationNumber?: string;
}

interface TaskState {
  tasks: Task[];
  taskTemplates: TaskTemplate[];
  isLoading: boolean;
  error: string | null;
}

const initialState: TaskState = {
  tasks: mockTasks,
  taskTemplates: mockTaskTemplates,
  isLoading: false,
  error: null,
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload;
    },
    addTask: (state, action: PayloadAction<Task>) => {
      state.tasks.push(action.payload);
    },
    updateTask: (state, action: PayloadAction<Task>) => {
      const index = state.tasks.findIndex((task) => task.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    },
    deleteTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter((task) => task.id !== action.payload);
    },
    setTaskTemplates: (state, action: PayloadAction<TaskTemplate[]>) => {
      state.taskTemplates = action.payload;
    },
    addTaskTemplate: (state, action: PayloadAction<TaskTemplate>) => {
      state.taskTemplates.push(action.payload);
    },
    updateTaskTemplate: (state, action: PayloadAction<TaskTemplate>) => {
      const index = state.taskTemplates.findIndex((template) => template.id === action.payload.id);
      if (index !== -1) {
        state.taskTemplates[index] = action.payload;
      }
    },
    deleteTaskTemplate: (state, action: PayloadAction<string>) => {
      state.taskTemplates = state.taskTemplates.filter((template) => template.id !== action.payload);
    },
    updateTaskStatus: (
      state,
      action: PayloadAction<{ taskId: string; status: TaskStatus }>
    ) => {
      const { taskId, status } = action.payload;
      const task = state.tasks.find((t) => t.id === taskId);
      if (task) {
        task.status = status;
        if (status === 'completed') {
          task.completedAt = new Date().toISOString();
        } else {
          delete task.completedAt;
        }
      }
    },
    updateSubtaskStatus: (
      state,
      action: PayloadAction<{ taskId: string; subtaskId: string; isCompleted: boolean }>
    ) => {
      const { taskId, subtaskId, isCompleted } = action.payload;
      const task = state.tasks.find((t) => t.id === taskId);
      if (task && task.subtasks) {
        const subtask = task.subtasks.find((s) => s.id === subtaskId);
        if (subtask) {
          subtask.isCompleted = isCompleted;
        }
      }
    },
    generateQuotation: (
      state,
      action: PayloadAction<{ taskId: string; quotationNumber: string }>
    ) => {
      const { taskId, quotationNumber } = action.payload;
      const task = state.tasks.find((t) => t.id === taskId);
      if (task) {
        task.quotationSent = true;
        task.quotationNumber = quotationNumber;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setTasks,
  addTask,
  updateTask,
  deleteTask,
  setTaskTemplates,
  addTaskTemplate,
  updateTaskTemplate,
  deleteTaskTemplate,
  updateTaskStatus,
  updateSubtaskStatus,
  generateQuotation,
  setLoading,
  setError,
} = tasksSlice.actions;

export default tasksSlice.reducer;
