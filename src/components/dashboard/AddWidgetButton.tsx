
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AddWidgetButtonProps {
  onAddWidget: (widgetType: string) => void;
}

export const AddWidgetButton = ({ onAddWidget }: AddWidgetButtonProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full">
          <Plus className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onAddWidget('revenue')}>
          Revenue Widget
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAddWidget('tasks')}>
          Tasks Widget
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAddWidget('clients')}>
          Clients Widget
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAddWidget('employees')}>
          Employees Widget
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
