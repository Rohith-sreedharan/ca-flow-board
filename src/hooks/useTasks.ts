
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Task, TaskStatus, SubTask } from '@/store/slices/tasksSlice';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedTasks: Task[] = (data || []).map(task => {
        // Parse subtasks safely
        let subtasks: SubTask[] = [];
        try {
          if (task.subtasks && typeof task.subtasks === 'string') {
            const parsed = JSON.parse(task.subtasks);
            subtasks = Array.isArray(parsed) ? parsed.map((st: any) => ({
              id: st.id || '',
              title: st.title || '',
              description: st.description || '',
              dueDate: st.dueDate,
              isCompleted: st.isCompleted || st.completed || false,
              completed: st.completed || st.isCompleted || false,
              order: st.order || 0,
            })) : [];
          } else if (Array.isArray(task.subtasks)) {
            subtasks = (task.subtasks as any[]).map((st: any) => ({
              id: st.id || '',
              title: st.title || '',
              description: st.description || '',
              dueDate: st.dueDate,
              isCompleted: st.isCompleted || st.completed || false,
              completed: st.completed || st.isCompleted || false,
              order: st.order || 0,
            }));
          }
        } catch (e) {
          console.warn('Failed to parse subtasks:', e);
          subtasks = [];
        }

        return {
          id: task.id,
          title: task.title,
          description: task.description || '',
          status: task.status as TaskStatus,
          priority: task.priority as 'low' | 'medium' | 'high' | 'urgent',
          category: task.category as 'gst_filing' | 'itr_filing' | 'roc_filing' | 'other',
          clientId: task.client_id || '',
          clientName: task.client_name || '',
          assignedTo: task.assigned_to || [],
          createdBy: task.created_by || '',
          createdAt: task.created_at || '',
          dueDate: task.due_date || '',
          completedAt: task.completed_at,
          isTemplate: task.is_template || false,
          templateId: task.template_id,
          isRecurring: task.is_recurring || false,
          recurrencePattern: task.recurrence_pattern,
          subtasks: subtasks,
          price: task.price,
          isPayableTask: task.is_payable_task || false,
          payableTaskType: task.payable_task_type as 'payable_task_1' | 'payable_task_2' | undefined,
          quotationSent: task.quotation_sent || false,
          paymentStatus: task.payment_status as 'pending' | 'paid' | 'failed' | undefined,
          quotationNumber: task.quotation_number,
        };
      });

      setTasks(formattedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskMove = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const updateData: any = { status: newStatus };
      if (newStatus === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId);

      if (error) throw error;

      // Update local state
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { 
              ...task, 
              status: newStatus,
              completedAt: newStatus === 'completed' ? new Date().toISOString() : task.completedAt
            }
          : task
      ));

      toast.success('Task status updated');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task status');
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  return {
    tasks,
    loading,
    loadTasks,
    handleTaskMove,
  };
};
