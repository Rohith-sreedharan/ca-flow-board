
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import TaskBoardHeader from './TaskBoardHeader';
import KanbanBoard from './KanbanBoard';
import TaskFilters from './TaskFilters';
import { CreateTaskDialog } from './CreateTaskDialog';
import { useTasks } from '@/hooks/useTasks';
import { filterTasks } from '@/utils/taskFilters';

interface TaskBoardProps {
  basePath: string;
}

const TaskBoard = ({ basePath }: TaskBoardProps) => {
  const { boardView, activeFilters } = useSelector((state: RootState) => state.ui);
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  const { tasks, loading, loadTasks, handleTaskMove } = useTasks();

  // Filter tasks based on active filters
  const filteredTasks = filterTasks(tasks, activeFilters);

  // Count active filters
  const activeFiltersCount = Object.values(activeFilters).reduce((count, filter) => {
    if (Array.isArray(filter)) {
      return count + (filter.length > 0 ? 1 : 0);
    }
    return count + (filter ? 1 : 0);
  }, 0);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading tasks...</div>;
  }

  return (
    <div className="space-y-4">
      <TaskBoardHeader
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        onCreateTask={() => setShowCreateDialog(true)}
        activeFiltersCount={activeFiltersCount}
      />
      
      {showFilters && <TaskFilters />}
      
      {boardView === 'kanban' ? (
        <KanbanBoard
          tasks={filteredTasks}
          onTaskMove={handleTaskMove}
          basePath={basePath}
        />
      ) : (
        <div className="mt-6">
          <p className="text-center py-6 text-muted-foreground">
            List view would display tasks in a table format with sorting and filtering options.
          </p>
        </div>
      )}

      <CreateTaskDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onTaskCreated={loadTasks}
      />
    </div>
  );
};

export default TaskBoard;
