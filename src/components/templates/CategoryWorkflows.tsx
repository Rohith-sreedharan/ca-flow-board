
import { SubTask } from '@/store/slices/tasksSlice';

export interface CategoryWorkflow {
  category: 'gst_filing' | 'itr_filing' | 'roc_filing' | 'other';
  name: string;
  description: string;
  defaultSubtasks: Omit<SubTask, 'id' | 'isCompleted'>[];
  defaultRecurrence?: 'monthly' | 'yearly';
  estimatedDuration?: string;
  typicalPrice?: number;
}

export const categoryWorkflows: CategoryWorkflow[] = [
  {
    category: 'gst_filing',
    name: 'GST Filing Workflow',
    description: 'Monthly GST filing process including data collection and returns',
    defaultRecurrence: 'monthly',
    estimatedDuration: '15-20 days',
    typicalPrice: 5000,
    defaultSubtasks: [
      {
        title: 'Collection of data from clients',
        description: 'Gather all necessary documents and data from client including invoices, receipts, and previous month GST data',
        dueDate: '5th of every month',
        order: 1,
      },
      {
        title: 'GSTR1 Filing',
        description: 'File GSTR1 return by 10th of every month - upload sales data and invoice details',
        dueDate: '10th of every month',
        order: 2,
      },
      {
        title: 'GST 3B Filing & Tax Payment',
        description: 'File GST 3B return and make tax payment by 20th of every month',
        dueDate: '20th of every month',
        order: 3,
      },
    ],
  },
  {
    category: 'itr_filing',
    name: 'ITR Filing Workflow',
    description: 'Annual ITR filing process with custom deadlines',
    defaultRecurrence: 'yearly',
    estimatedDuration: '30-45 days',
    typicalPrice: 15000,
    defaultSubtasks: [
      {
        title: 'Collection of data from clients',
        description: 'Gather annual financial data including Form 16, bank statements, investment proofs, and previous year ITR',
        order: 1,
      },
      {
        title: 'Finalization of accounts',
        description: 'Review and finalize all account statements, calculate income from all sources',
        order: 2,
      },
      {
        title: 'Tax calculation and planning',
        description: 'Calculate tax liability, identify tax-saving opportunities, and plan advance tax if needed',
        order: 3,
      },
      {
        title: 'ITR filing',
        description: 'Submit ITR forms online before the due date and obtain acknowledgment',
        order: 4,
      },
    ],
  },
  {
    category: 'roc_filing',
    name: 'ROC Filing Workflow',
    description: 'Annual ROC filing including all required forms',
    defaultRecurrence: 'yearly',
    estimatedDuration: '20-30 days',
    typicalPrice: 8000,
    defaultSubtasks: [
      {
        title: 'Form AOC-4 Filing',
        description: 'Prepare and submit Annual Return (Form AOC-4) with financial statements',
        order: 1,
      },
      {
        title: 'Form MGT-7 Filing',
        description: 'Prepare and submit Annual Return of the company (Form MGT-7)',
        order: 2,
      },
      {
        title: 'Form ADT-1 Filing',
        description: 'File auditor appointment/resignation form if applicable',
        order: 3,
      },
    ],
  },
];

export const getWorkflowByCategory = (category: string): CategoryWorkflow | undefined => {
  return categoryWorkflows.find(workflow => workflow.category === category);
};

export const getCategoryOptions = () => {
  return categoryWorkflows.map(workflow => ({
    value: workflow.category,
    label: workflow.name,
    description: workflow.description,
  }));
};
