
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import TaskBoard from '@/components/tasks/TaskBoard';

const EmployeeTasks = () => {
  // In a real app, you would filter tasks by the current user's ID
  const { tasks } = useSelector((state: RootState) => state.tasks);
  
  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader className="space-y-1 bg-gradient-to-r from-purple-100 to-transparent">
          <CardTitle className="text-2xl text-purple-900">My Tasks</CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage your assigned tasks and deadlines
          </p>
        </CardHeader>
        <CardContent>
          <TaskBoard tasks={tasks} basePath="/employee" />
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeTasks;
