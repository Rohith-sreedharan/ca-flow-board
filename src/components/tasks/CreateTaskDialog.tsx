
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { FormDialog } from '@/components/shared/FormDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, DollarSign, FileText, Users } from 'lucide-react';
import { toast } from 'sonner';

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreated?: () => void;
}

type TaskFormData = {
  title: string;
  description: string;
  category: 'gst_filing' | 'itr_filing' | 'roc_filing' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  clientId: string;
  dueDate: string;
  price?: number;
  isPayableTask: boolean;
};

const taskCategories = [
  { 
    value: 'gst_filing', 
    label: 'GST Filing', 
    icon: FileText,
    description: 'GST return filing and compliance'
  },
  { 
    value: 'itr_filing', 
    label: 'ITR Filing', 
    icon: Calendar,
    description: 'Income Tax Return filing'
  },
  { 
    value: 'roc_filing', 
    label: 'ROC Filing', 
    icon: DollarSign,
    description: 'Registrar of Companies filing'
  },
  { 
    value: 'other', 
    label: 'Other Tasks', 
    icon: Users,
    description: 'General accounting and compliance tasks'
  },
];

export function CreateTaskDialog({ open, onOpenChange, onTaskCreated }: CreateTaskDialogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [clients, setClients] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<TaskFormData>();

  // Load clients when dialog opens
  useState(() => {
    if (open) {
      loadClients();
    }
  });

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
      toast.error('Failed to load clients');
    }
  };

  const onSubmit = async (data: TaskFormData) => {
    if (!selectedCategory) {
      toast.error('Please select a task category');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedClient = clients.find(c => c.id === data.clientId);
      
      const taskData = {
        title: data.title,
        description: data.description,
        category: selectedCategory,
        priority: data.priority,
        client_id: data.clientId,
        client_name: selectedClient?.name,
        due_date: data.dueDate,
        price: data.price,
        is_payable_task: data.isPayableTask,
        created_by: user.id,
        status: 'todo',
        assigned_to: [user.id], // Assign to current user by default
      };

      const { error } = await supabase
        .from('tasks')
        .insert([taskData]);

      if (error) throw error;

      toast.success('Task created successfully');
      reset();
      setSelectedCategory('');
      onOpenChange(false);
      onTaskCreated?.();
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Create New Task"
      description="Choose a category and fill in the task details"
      showFooter={false}
      className="sm:max-w-[600px]"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Category Selection */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Task Category</Label>
          <div className="grid grid-cols-2 gap-3">
            {taskCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Card 
                  key={category.value}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedCategory === category.value 
                      ? 'ring-2 ring-ca-blue bg-ca-blue/5' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    setSelectedCategory(category.value);
                    setValue('category', category.value as any);
                  }}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <IconComponent className="h-4 w-4" />
                      {category.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-xs">
                      {category.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {selectedCategory && (
          <>
            {/* Task Details */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  placeholder="Enter task title"
                  {...register("title", { required: "Title is required" })}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter task description"
                  rows={3}
                  {...register("description")}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select onValueChange={(value) => setValue('priority', value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    {...register("dueDate", { required: "Due date is required" })}
                  />
                  {errors.dueDate && (
                    <p className="text-sm text-destructive">{errors.dueDate.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientId">Client</Label>
                <Select onValueChange={(value) => setValue('clientId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0.00"
                    {...register("price", { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="isPayableTask">Payable Task</Label>
                  <Select onValueChange={(value) => setValue('isPayableTask', value === 'true')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">No</SelectItem>
                      <SelectItem value="true">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-ca-blue hover:bg-ca-blue-dark"
              >
                {isSubmitting ? "Creating..." : "Create Task"}
              </Button>
            </div>
          </>
        )}
      </form>
    </FormDialog>
  );
}
