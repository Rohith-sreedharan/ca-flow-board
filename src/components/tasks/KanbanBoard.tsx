
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Task, TaskStatus } from '@/store/slices/tasksSlice';
import TaskColumn from './TaskColumn';

interface KanbanBoardProps {
  tasks: Task[];
  onTaskMove: (taskId: string, newStatus: TaskStatus) => void;
  basePath: string;
}

const KanbanBoard = ({ tasks, onTaskMove, basePath }: KanbanBoardProps) => {
  const columns: { title: string; status: TaskStatus }[] = [
    { title: 'To Do', status: 'todo' },
    { title: 'In Progress', status: 'inprogress' },
    { title: 'Review', status: 'review' },
    { title: 'Completed', status: 'completed' },
  ];

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {columns.map((column) => (
          <TaskColumn
            key={column.status}
            title={column.title}
            status={column.status}
            tasks={tasks.filter((task) => task.status === column.status)}
            onTaskMove={onTaskMove}
            basePath={basePath}
          />
        ))}
      </div>
    </DndProvider>
  );
};

export default KanbanBoard;
