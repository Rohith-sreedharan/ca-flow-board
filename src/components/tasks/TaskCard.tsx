
import { useDrag } from 'react-dnd';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Clock, Edit, User } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Task, TaskPriority, TaskStatus } from '@/store/slices/tasksSlice';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  basePath: string;
}

interface DragItem {
  type: string;
  taskId: string;
  status: TaskStatus;
  originalStatus: TaskStatus;
}

const getPriorityStyles = (priority: TaskPriority) => {
  switch (priority) {
    case 'urgent':
      return 'bg-ca-red text-white';
    case 'high':
      return 'bg-ca-yellow-dark text-white';
    case 'medium':
      return 'bg-ca-yellow-light text-ca-gray-dark';
    case 'low':
      return 'bg-ca-green-light text-ca-gray-dark';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

const getCategoryBadgeStyles = (category: string) => {
  switch (category) {
    case 'gst':
      return 'bg-blue-100 text-blue-800';
    case 'tax':
      return 'bg-purple-100 text-purple-800';
    case 'audit':
      return 'bg-green-100 text-green-800';
    case 'compliance':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

const TaskCard = ({ task, basePath }: TaskCardProps) => {
  const navigate = useNavigate();
  
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TASK',
    item: { 
      type: 'TASK',
      taskId: task.id, 
      status: task.status,
      originalStatus: task.status
    } as DragItem,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));
  
  const handleClick = () => {
    navigate(`${basePath}/tasks/${task.id}`);
  };
  
  // Format the due date
  const formattedDate = task.dueDate ? format(new Date(task.dueDate), 'MMM dd, yyyy') : 'No due date';
  const isPastDue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
  
  return (
    <div
      ref={drag}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className="cursor-grab"
    >
      <Card 
        className={cn(
          "h-full transition-all hover:border-ca-blue-light",
          isDragging && "shadow-lg"
        )}
      >
        <CardContent className="p-4 space-y-3" onClick={handleClick}>
          <div className="flex justify-between items-start gap-2">
            <Badge className={getCategoryBadgeStyles(task.category)}>
              {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
            </Badge>
            <Badge className={getPriorityStyles(task.priority)}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </Badge>
          </div>
          
          <h3 className="font-medium text-base line-clamp-2">{task.title}</h3>
          
          <p className="text-sm text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <User className="h-3 w-3" />
            <span className="truncate">{task.clientName}</span>
          </div>
        </CardContent>
        
        <CardFooter className="px-4 py-2 border-t flex justify-between items-center bg-muted/50">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span className={cn(
              "text-xs", 
              isPastDue ? "text-destructive font-medium" : "text-muted-foreground"
            )}>
              {isPastDue ? 'Overdue: ' : ''}{formattedDate}
            </span>
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex -space-x-2">
                  {task.assignedTo.slice(0, 3).map((userId, index) => (
                    <Avatar key={userId} className="h-5 w-5 border border-background">
                      <AvatarFallback className="text-[10px] bg-ca-blue text-white">
                        {`U${index+1}`}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {task.assignedTo.length > 3 && (
                    <Avatar className="h-5 w-5 border border-background">
                      <AvatarFallback className="text-[10px] bg-gray-400 text-white">
                        +{task.assignedTo.length - 3}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Assigned team members</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <div 
            className="p-1 rounded-full hover:bg-gray-200 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`${basePath}/tasks/${task.id}/edit`);
            }}
          >
            <Edit className="h-3 w-3 text-muted-foreground" />
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TaskCard;
