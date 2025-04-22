
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import TaskBoard from '@/components/tasks/TaskBoard';

const OwnerTasks = () => {
  const { tasks } = useSelector((state: RootState) => state.tasks);
  
  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Task Management</CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage all tasks across your organization
          </p>
        </CardHeader>
        <CardContent>
          <TaskBoard tasks={tasks} basePath="/owner" />
        </CardContent>
      </Card>
    </div>
  );
};

export default OwnerTasks;
