import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useClients } from '@/hooks/useClients';
import { useEmployees } from '@/hooks/useEmployees';
import { supabase } from '@/integrations/supabase/client';
import { TemplateSelector } from '@/components/templates/TemplateSelector';
import { getWorkflowByCategory } from '@/components/templates/CategoryWorkflows';
import { TaskTemplate } from '@/store/slices/tasksSlice';

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional(),
  category: z.enum(['gst_filing', 'itr_filing', 'roc_filing', 'other'], {
    required_error: "Please select a category",
  }),
  priority: z.enum(['low', 'medium', 'high', 'urgent'], {
    required_error: "Please select a priority",
  }),
  client_id: z.string().optional(),
  assigned_to: z.array(z.string()).optional(),
  due_date: z.string().optional(),
  is_payable_task: z.boolean().default(false),
  price: z.number().optional(),
  payable_task_type: z.string().optional(),
  template_id: z.string().optional(),
  is_recurring: z.boolean().default(false),
  recurrence_pattern: z.string().optional(),
});

export function AddTaskForm({ onSuccess }: { onSuccess: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null);
  const [creationMode, setCreationMode] = useState<'manual' | 'template'>('manual');
  const { clients } = useClients();
  const { employees } = useEmployees();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'other',
      priority: 'medium',
      client_id: '',
      assigned_to: [],
      due_date: '',
      is_payable_task: false,
      price: undefined,
      payable_task_type: '',
      template_id: '',
      is_recurring: false,
      recurrence_pattern: '',
    },
  });

  const selectedCategory = form.watch('category');
  const isPayableTask = form.watch('is_payable_task');
  const isRecurring = form.watch('is_recurring');

  const handleTemplateSelect = (template: TaskTemplate) => {
    setSelectedTemplate(template);
    form.setValue('title', template.title);
    form.setValue('description', template.description);
    form.setValue('category', template.category);
    form.setValue('is_payable_task', template.isPayableTask);
    form.setValue('price', template.price);
    form.setValue('payable_task_type', template.payableTaskType || '');
    form.setValue('template_id', template.id);
    form.setValue('is_recurring', template.isRecurring);
    form.setValue('recurrence_pattern', template.recurrencePattern || '');
    
    if (template.assignedEmployeeId) {
      form.setValue('assigned_to', [template.assignedEmployeeId]);
    }
  };

  const handleCategoryChange = (category: string) => {
    form.setValue('category', category as any);
    
    // Auto-populate based on category workflow
    const workflow = getWorkflowByCategory(category);
    if (workflow && creationMode === 'manual') {
      form.setValue('description', workflow.description);
      if (workflow.defaultRecurrence) {
        form.setValue('is_recurring', true);
        form.setValue('recurrence_pattern', workflow.defaultRecurrence);
      }
      if (workflow.typicalPrice) {
        form.setValue('is_payable_task', true);
        form.setValue('price', workflow.typicalPrice);
      }
    }
  };
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      console.log('Creating task with values:', values);
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User not authenticated');
      }

      // Prepare subtasks from template if using template
      let subtasksData = [];
      if (selectedTemplate && selectedTemplate.subtasks) {
        subtasksData = selectedTemplate.subtasks.map(subtask => ({
          id: `subtask_${Date.now()}_${subtask.order}`,
          title: subtask.title,
          description: subtask.description,
          dueDate: subtask.dueDate,
          isCompleted: false,
          order: subtask.order,
        }));
      }

      const taskData = {
        title: values.title,
        description: values.description || '',
        category: values.category === 'gst_filing' ? 'gst' : 
                 values.category === 'itr_filing' ? 'itr' : 
                 values.category === 'roc_filing' ? 'roc' : 'other',
        priority: values.priority,
        status: 'todo',
        client_id: values.client_id || null,
        assigned_to: values.assigned_to || [],
        due_date: values.due_date ? new Date(values.due_date).toISOString() : null,
        created_by: userData.user.id,
        is_payable_task: values.is_payable_task,
        price: values.price || null,
        payable_task_type: values.payable_task_type || null,
        template_id: values.template_id || null,
        is_recurring: values.is_recurring,
        recurrence_pattern: values.recurrence_pattern || null,
        subtasks: subtasksData,
        is_deleted: false,
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert(taskData)
        .select()
        .single();

      if (error) {
        console.error('Error creating task:', error);
        throw error;
      }

      console.log('Task created successfully:', data);
      toast.success("Task created successfully");
      form.reset();
      setSelectedTemplate(null);
      onSuccess();
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error("Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Tabs value={creationMode} onValueChange={(value) => setCreationMode(value as 'manual' | 'template')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">Manual Creation</TabsTrigger>
          <TabsTrigger value="template">From Template</TabsTrigger>
        </TabsList>
        
        <TabsContent value="template" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select Template</CardTitle>
            </CardHeader>
            <CardContent>
              <TemplateSelector 
                onSelectTemplate={handleTemplateSelect}
                selectedCategory={selectedCategory === 'other' ? '' : selectedCategory}
                onCategoryChange={(category) => handleCategoryChange(category)}
              />
            </CardContent>
          </Card>
          
          {selectedTemplate && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800 font-medium">Template Selected: {selectedTemplate.title}</p>
              <p className="text-green-600 text-sm">The form below has been pre-filled with template data. You can modify as needed.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="manual">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-blue-800 font-medium">Manual Task Creation</p>
            <p className="text-blue-600 text-sm">Create a custom task or select a category to auto-populate common settings.</p>
          </div>
        </TabsContent>
      </Tabs>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Task Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter task title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter task description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={handleCategoryChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="gst_filing">GST Filing</SelectItem>
                      <SelectItem value="itr_filing">ITR Filing</SelectItem>
                      <SelectItem value="roc_filing">ROC Filing</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="client_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client (Optional)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {clients.map(client => (
                      <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="assigned_to"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assign To (Optional)</FormLabel>
                <FormControl>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {employees.map(employee => (
                      <div key={employee.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={employee.id}
                          checked={field.value?.includes(employee.id) || false}
                          onCheckedChange={(checked) => {
                            const currentValue = field.value || [];
                            if (checked) {
                              field.onChange([...currentValue, employee.id]);
                            } else {
                              field.onChange(currentValue.filter(id => id !== employee.id));
                            }
                          }}
                        />
                        <label htmlFor={employee.id} className="text-sm">
                          {employee.profiles?.full_name || employee.employee_id}
                        </label>
                      </div>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="due_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due Date (Optional)</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_payable_task"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Payable Task
                  </FormLabel>
                  <p className="text-xs text-muted-foreground">
                    This task requires payment from client
                  </p>
                </div>
              </FormItem>
            )}
          />

          {isPayableTask && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (₹)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="payable_task_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="payable_task_1">Account 1</SelectItem>
                        <SelectItem value="payable_task_2">Account 2</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="is_recurring"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Recurring Task</FormLabel>
                    <p className="text-xs text-muted-foreground">
                      This task will repeat based on the pattern
                    </p>
                  </div>
                </FormItem>
              )}
            />

            {isRecurring && (
              <FormField
                control={form.control}
                name="recurrence_pattern"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recurrence Pattern</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select pattern" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
          
          <div className="pt-4 space-x-2 flex justify-end">
            <Button 
              type="submit" 
              className="bg-ca-blue hover:bg-ca-blue-dark"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
