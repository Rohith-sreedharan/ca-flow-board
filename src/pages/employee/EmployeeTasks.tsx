
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import TaskBoard from '@/components/tasks/TaskBoard';

const EmployeeTasks = () => {
  // In a real app, you would filter tasks by the current user's ID
  const { tasks } = useSelector((state: RootState) => state.tasks);
  
  return (
    <div>
      <TaskBoard tasks={tasks} basePath="/employee" />
    </div>
  );
};

export default EmployeeTasks;
