
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type TaskStatus = 'todo' | 'inprogress' | 'review' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskCategory = 'gst' | 'audit' | 'tax' | 'compliance' | 'other';

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
  parentTaskId?: string;
  isRecurring: boolean;
  recurrencePattern?: string;
  attachments?: string[];
  comments?: {
    id: string;
    userId: string;
    userName: string;
    message: string;
    timestamp: string;
  }[];
  price?: number;
}

interface TaskState {
  tasks: Task[];
  taskTemplates: Task[];
  isLoading: boolean;
  error: string | null;
}

const initialState: TaskState = {
  tasks: [],
  taskTemplates: [],
  isLoading: false,
  error: null,
};

// Mock data for development
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Monthly GST Filing',
    description: 'File monthly GST returns for client ABC Corp',
    status: 'todo',
    priority: 'high',
    category: 'gst',
    clientId: '101',
    clientName: 'ABC Corp',
    assignedTo: ['301'],
    createdBy: '201',
    createdAt: '2024-04-15T12:00:00Z',
    dueDate: '2024-04-25T12:00:00Z',
    isTemplate: false,
    isRecurring: true,
    recurrencePattern: 'monthly',
    price: 5000,
  },
  {
    id: '2',
    title: 'Annual Audit',
    description: 'Conduct annual audit for XYZ Industries',
    status: 'inprogress',
    priority: 'high',
    category: 'audit',
    clientId: '102',
    clientName: 'XYZ Industries',
    assignedTo: ['302', '303'],
    createdBy: '201',
    createdAt: '2024-04-10T10:30:00Z',
    dueDate: '2024-05-10T17:00:00Z',
    isTemplate: false,
    isRecurring: false,
    price: 50000,
  },
  {
    id: '3',
    title: 'Tax Planning Session',
    description: 'Quarterly tax planning meeting with client',
    status: 'completed',
    priority: 'medium',
    category: 'tax',
    clientId: '103',
    clientName: 'Smith & Co.',
    assignedTo: ['301'],
    createdBy: '202',
    createdAt: '2024-04-05T09:15:00Z',
    dueDate: '2024-04-12T16:30:00Z',
    completedAt: '2024-04-11T14:20:00Z',
    isTemplate: false,
    isRecurring: true,
    recurrencePattern: 'quarterly',
    price: 7500,
  },
];

const mockTemplates: Task[] = [
  {
    id: 'template1',
    title: 'GST Filing Template',
    description: 'Standard template for monthly GST filing',
    status: 'todo',
    priority: 'high',
    category: 'gst',
    clientId: '',
    clientName: '',
    assignedTo: [],
    createdBy: '201',
    createdAt: '2024-03-01T10:00:00Z',
    dueDate: '',
    isTemplate: true,
    isRecurring: false,
    price: 5000,
  },
  {
    id: 'template2',
    title: 'Annual Audit Template',
    description: 'Comprehensive annual audit checklist',
    status: 'todo',
    priority: 'high',
    category: 'audit',
    clientId: '',
    clientName: '',
    assignedTo: [],
    createdBy: '201',
    createdAt: '2024-03-01T11:30:00Z',
    dueDate: '',
    isTemplate: true,
    isRecurring: false,
    price: 45000,
  },
];

const tasksSlice = createSlice({
  name: 'tasks',
  initialState: {
    ...initialState,
    tasks: mockTasks,
    taskTemplates: mockTemplates,
  },
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
    setTaskTemplates: (state, action: PayloadAction<Task[]>) => {
      state.taskTemplates = action.payload;
    },
    addTaskTemplate: (state, action: PayloadAction<Task>) => {
      state.taskTemplates.push(action.payload);
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
  updateTaskStatus,
  setLoading,
  setError,
} = tasksSlice.actions;

export default tasksSlice.reducer;
