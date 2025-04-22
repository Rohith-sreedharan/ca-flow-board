
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { ChevronRight, Calendar, FileText, MessageSquare, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

const EmployeeDashboard = () => {
  const { name } = useSelector((state: RootState) => state.auth);
  const { tasks } = useSelector((state: RootState) => state.tasks);
  const { invoices } = useSelector((state: RootState) => state.invoices);
  
  // Filter tasks assigned to the current user (in a real app, you would filter by user ID)
  const myTasks = tasks;
  const completedTasks = myTasks.filter(task => task.status === 'completed');
  const completionRate = myTasks.length > 0 
    ? Math.round((completedTasks.length / myTasks.length) * 100) 
    : 0;
  
  // Tasks due today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  const tasksDueToday = myTasks.filter(task => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() === today.getTime() && task.status !== 'completed';
  });
  
  // Overdue tasks
  const overdueTasks = myTasks.filter(task => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    return dueDate < today && task.status !== 'completed';
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Welcome back, {name}</h1>
        <p className="text-muted-foreground">
          Here's what's happening with your tasks today.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Tasks Progress
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedTasks.length}/{myTasks.length}
            </div>
            <p className="text-xs text-muted-foreground mb-1">
              Tasks completed
            </p>
            <Progress value={completionRate} className="h-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Due Today
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasksDueToday.length}</div>
            <p className="text-xs text-muted-foreground">
              Tasks due today - {format(today, 'MMM dd, yyyy')}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Overdue Tasks
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-ca-red" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-ca-red">{overdueTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              Tasks past due date
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Tasks</CardTitle>
              <CardDescription>Your most recent assigned tasks</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="h-8">
              View All
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myTasks.slice(0, 3).map((task) => (
                <div key={task.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-10 rounded-full ${
                      task.priority === 'urgent' ? 'bg-ca-red' :
                      task.priority === 'high' ? 'bg-ca-yellow' :
                      task.priority === 'medium' ? 'bg-ca-green' : 'bg-gray-300'
                    }`} />
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-sm text-muted-foreground">Client: {task.clientName}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm">
                      {task.dueDate ? format(new Date(task.dueDate), 'MMM dd') : 'No due date'}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      task.status === 'todo' ? 'bg-gray-100' :
                      task.status === 'inprogress' ? 'bg-blue-100 text-blue-800' :
                      task.status === 'review' ? 'bg-amber-100 text-amber-800' : 
                      'bg-green-100 text-green-800'
                    }`}>
                      {task.status === 'inprogress' ? 'In Progress' : 
                       task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Upcoming</CardTitle>
            <CardDescription>Events and deadlines</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-6 w-6 text-ca-blue" />
                <div>
                  <p className="font-medium">Team Meeting</p>
                  <p className="text-sm text-muted-foreground">Today, 2:00 PM</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-ca-green" />
                <div>
                  <p className="font-medium">GST Filing Deadline</p>
                  <p className="text-sm text-muted-foreground">Apr 25, 2024</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <MessageSquare className="h-6 w-6 text-ca-yellow" />
                <div>
                  <p className="font-medium">Client Call: ABC Corp</p>
                  <p className="text-sm text-muted-foreground">Tomorrow, 11:00 AM</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
