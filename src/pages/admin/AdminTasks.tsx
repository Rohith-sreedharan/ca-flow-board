
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import TaskBoard from '@/components/tasks/TaskBoard';

const AdminTasks = () => {
  const { tasks } = useSelector((state: RootState) => state.tasks);
  
  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader className="space-y-1 bg-gradient-to-r from-ca-blue/10 to-transparent">
          <CardTitle className="text-2xl text-ca-blue-dark">Task Management</CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage and monitor employee tasks
          </p>
        </CardHeader>
        <CardContent>
          <TaskBoard tasks={tasks} basePath="/admin" />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminTasks;
