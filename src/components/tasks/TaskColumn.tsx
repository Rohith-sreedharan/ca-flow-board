
import { useDrop } from 'react-dnd';
import { Task, TaskStatus } from '@/store/slices/tasksSlice';
import TaskCard from './TaskCard';

interface TaskColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  onTaskMove: (taskId: string, newStatus: TaskStatus) => void;
  basePath: string;
}

interface DragItem {
  type: string;
  taskId: string;
  status: TaskStatus;
  originalStatus: TaskStatus;
}

const TaskColumn = ({ title, status, tasks, onTaskMove, basePath }: TaskColumnProps) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'TASK',
    drop: (item: DragItem) => {
      if (item.status !== status) {
        onTaskMove(item.taskId, status);
      }
      return { status };
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));
  
  // Get appropriate header color based on status
  const getHeaderColor = () => {
    switch (status) {
      case 'todo':
        return 'bg-gray-100';
      case 'inprogress':
        return 'bg-ca-blue-light text-white';
      case 'review':
        return 'bg-ca-yellow text-gray-800';
      case 'completed':
        return 'bg-ca-green text-white';
      default:
        return 'bg-gray-100';
    }
  };
  
  return (
    <div
      ref={drop}
      className={`bg-card rounded-md border ${isOver ? 'border-dashed border-ca-blue' : ''}`}
    >
      <div className={`${getHeaderColor()} p-3 rounded-t-md flex justify-between items-center`}>
        <h3 className="font-medium">{title}</h3>
        <span className="bg-white bg-opacity-30 rounded-full px-2 py-0.5 text-xs">
          {tasks.length}
        </span>
      </div>
      <div className="p-3 space-y-3 h-[calc(100vh-260px)] overflow-y-auto">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} basePath={basePath} />
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed rounded-md">
            No tasks in this column
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskColumn;
