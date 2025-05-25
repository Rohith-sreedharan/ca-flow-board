
import { Button } from '@/components/ui/button';
import { ListFilter, Plus } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { setBoardView } from '@/store/slices/uiSlice';

interface TaskBoardHeaderProps {
  showFilters: boolean;
  onToggleFilters: () => void;
  onCreateTask: () => void;
  activeFiltersCount: number;
}

const TaskBoardHeader = ({ 
  showFilters, 
  onToggleFilters, 
  onCreateTask, 
  activeFiltersCount 
}: TaskBoardHeaderProps) => {
  const dispatch = useDispatch();
  const { boardView } = useSelector((state: RootState) => state.ui);

  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">Task Board</h2>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleFilters}
        >
          <ListFilter className="h-4 w-4 mr-2" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="ml-1 w-5 h-5 rounded-full bg-ca-blue text-white text-xs flex items-center justify-center">
              !
            </span>
          )}
        </Button>
        
        <div className="flex items-center border rounded-md overflow-hidden">
          <Button
            variant={boardView === 'kanban' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => dispatch(setBoardView('kanban'))}
            className="rounded-none"
          >
            Kanban
          </Button>
          <Button
            variant={boardView === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => dispatch(setBoardView('list'))}
            className="rounded-none"
          >
            List
          </Button>
        </div>
        
        <Button 
          className="bg-ca-blue hover:bg-ca-blue-dark"
          onClick={onCreateTask}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>
    </div>
  );
};

export default TaskBoardHeader;
