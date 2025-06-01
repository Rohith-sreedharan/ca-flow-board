
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTasks } from '@/hooks/useTasks';
import { useEmployees } from '@/hooks/useEmployees';
import { usePayments } from '@/hooks/usePayments';
import { useClients } from '@/hooks/useClients';

interface TaskMetrics {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completionRate: number;
  averageCompletionTime: number;
}

interface EmployeePerformance {
  employeeId: string;
  employeeName: string;
  totalTasks: number;
  completedTasks: number;
  onTimeTasks: number;
  efficiency: number;
  workload: number;
}

interface RevenueMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  paidInvoices: number;
  pendingPayments: number;
  revenueGrowth: number;
  averageInvoiceValue: number;
}

interface ClientEngagement {
  totalClients: number;
  activeClients: number;
  newClients: number;
  clientRetentionRate: number;
  averageProjectValue: number;
  topClients: Array<{
    id: string;
    name: string;
    totalValue: number;
    projectCount: number;
  }>;
}

export const useAnalytics = () => {
  const { tasks } = useTasks();
  const { employees } = useEmployees();
  const { payments, quotations } = usePayments();
  const { clients } = useClients();

  const taskMetrics: TaskMetrics = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(task => task.status === 'completed').length,
    pendingTasks: tasks.filter(task => task.status !== 'completed').length,
    overdueTasks: tasks.filter(task => 
      new Date(task.dueDate) < new Date() && task.status !== 'completed'
    ).length,
    completionRate: tasks.length > 0 ? 
      (tasks.filter(task => task.status === 'completed').length / tasks.length) * 100 : 0,
    averageCompletionTime: 3.2, // Mock value - would be calculated from actual completion data
  };

  const employeePerformance: EmployeePerformance[] = employees.map(employee => {
    const employeeTasks = tasks.filter(task => 
      task.assignedTo.includes(employee.id)
    );
    const completedTasks = employeeTasks.filter(task => task.status === 'completed');
    const onTimeTasks = completedTasks.filter(task => 
      task.completedAt && new Date(task.completedAt) <= new Date(task.dueDate)
    );

    return {
      employeeId: employee.id,
      employeeName: employee.profiles?.full_name || employee.employee_id,
      totalTasks: employeeTasks.length,
      completedTasks: completedTasks.length,
      onTimeTasks: onTimeTasks.length,
      efficiency: completedTasks.length > 0 ? 
        (onTimeTasks.length / completedTasks.length) * 100 : 0,
      workload: employeeTasks.filter(task => task.status !== 'completed').length,
    };
  });

  const revenueMetrics: RevenueMetrics = {
    totalRevenue: payments
      .filter(payment => payment.status === 'paid')
      .reduce((sum, payment) => sum + payment.amount, 0),
    monthlyRevenue: payments
      .filter(payment => 
        payment.status === 'paid' && 
        new Date(payment.paid_at || '').getMonth() === new Date().getMonth()
      )
      .reduce((sum, payment) => sum + payment.amount, 0),
    paidInvoices: payments.filter(payment => payment.status === 'paid').length,
    pendingPayments: payments.filter(payment => payment.status === 'pending').length,
    revenueGrowth: 12.5, // Mock value - would be calculated from historical data
    averageInvoiceValue: payments.length > 0 ? 
      payments.reduce((sum, payment) => sum + payment.amount, 0) / payments.length : 0,
  };

  const clientEngagement: ClientEngagement = {
    totalClients: clients.length,
    activeClients: clients.filter(client => 
      tasks.some(task => task.clientId === client.id && task.status !== 'completed')
    ).length,
    newClients: clients.filter(client => 
      new Date(client.created_at).getMonth() === new Date().getMonth()
    ).length,
    clientRetentionRate: 85.7, // Mock value
    averageProjectValue: quotations.length > 0 ? 
      quotations.reduce((sum, quote) => sum + quote.total_amount, 0) / quotations.length : 0,
    topClients: clients
      .map(client => ({
        id: client.id,
        name: client.name,
        totalValue: quotations
          .filter(quote => quote.client_id === client.id)
          .reduce((sum, quote) => sum + quote.total_amount, 0),
        projectCount: tasks.filter(task => task.clientId === client.id).length,
      }))
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 5),
  };

  // Real-time data fetching for live updates
  const { data: realTimeData, isLoading: isLoadingRealTime } = useQuery({
    queryKey: ['real-time-analytics'],
    queryFn: async () => {
      // Fetch latest data for real-time updates
      const [tasksData, paymentsData] = await Promise.all([
        supabase.from('tasks').select('*').eq('is_deleted', false),
        supabase.from('payments').select('*').eq('is_deleted', false),
      ]);

      return {
        recentTasks: tasksData.data?.slice(0, 10) || [],
        recentPayments: paymentsData.data?.slice(0, 10) || [],
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  return {
    taskMetrics,
    employeePerformance,
    revenueMetrics,
    clientEngagement,
    realTimeData,
    isLoadingRealTime,
  };
};
