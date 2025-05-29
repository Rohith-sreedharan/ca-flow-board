
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import { useTemplates } from '@/hooks/useTemplates';
import { useEmployees } from '@/hooks/useEmployees';
import { categoryWorkflows } from './CategoryWorkflows';
import { useToast } from '@/hooks/use-toast';

const templateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  category: z.enum(['gst', 'itr', 'roc', 'other']),
  is_recurring: z.boolean(),
  recurrence_pattern: z.enum(['monthly', 'yearly', 'custom']).optional(),
  deadline: z.string().optional(),
  price: z.number().optional(),
  is_payable_task: z.boolean(),
  payable_task_type: z.enum(['payable_task_1', 'payable_task_2']).optional(),
  assigned_employee_id: z.string().optional(),
});

type TemplateFormData = z.infer<typeof templateSchema>;

interface DatabaseCreateTemplateFormProps {
  templateId?: string;
  onSuccess: () => void;
}

export function DatabaseCreateTemplateForm({ templateId, onSuccess }: DatabaseCreateTemplateFormProps) {
  const [subtasks, setSubtasks] = useState<any[]>([]);
  const [newSubtask, setNewSubtask] = useState({ title: '', description: '' });
  
  const { templates, createTemplate, updateTemplate, isCreating, isUpdating } = useTemplates();
  const { employees } = useEmployees();
  const { toast } = useToast();

  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'gst',
      is_recurring: false,
      is_payable_task: false,
    },
  });

  const selectedCategory = form.watch('category');
  const isRecurring = form.watch('is_recurring');
  const isPayableTask = form.watch('is_payable_task');

  // Load template data if editing
  useEffect(() => {
    if (templateId) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        form.reset({
          title: template.title,
          description: template.description || '',
          category: template.category,
          is_recurring: template.is_recurring,
          recurrence_pattern: template.recurrence_pattern,
          deadline: template.deadline,
          price: template.price,
          is_payable_task: template.is_payable_task,
          payable_task_type: template.payable_task_type,
          assigned_employee_id: template.assigned_employee_id,
        });
        setSubtasks(template.subtasks || []);
      }
    }
  }, [templateId, templates, form]);

  // Auto-populate subtasks when category changes
  useEffect(() => {
    if (!templateId) { // Only auto-populate for new templates
      const workflow = categoryWorkflows.find(w => w.category === selectedCategory + '_filing');
      if (workflow && subtasks.length === 0) {
        setSubtasks(workflow.defaultSubtasks.map((subtask, index) => ({
          id: `temp-${index}`,
          ...subtask,
          isCompleted: false
        })));
      }
    }
  }, [selectedCategory, templateId, subtasks.length]);

  const addSubtask = () => {
    if (newSubtask.title.trim()) {
      setSubtasks([...subtasks, {
        id: `temp-${Date.now()}`,
        title: newSubtask.title,
        description: newSubtask.description,
        order: subtasks.length + 1,
        isCompleted: false
      }]);
      setNewSubtask({ title: '', description: '' });
    }
  };

  const removeSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const onSubmit = (data: TemplateFormData) => {
    const templateData = {
      ...data,
      subtasks,
      price: data.is_payable_task ? data.price : undefined,
      payable_task_type: data.is_payable_task ? data.payable_task_type : undefined,
      recurrence_pattern: data.is_recurring ? data.recurrence_pattern : undefined,
    };

    if (templateId) {
      updateTemplate({ id: templateId, ...templateData });
    } else {
      createTemplate(templateData);
    }

    toast({
      title: templateId ? "Template Updated" : "Template Created",
      description: `Template "${data.title}" has been ${templateId ? 'updated' : 'created'} successfully.`,
    });

    onSuccess();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Template Title</Label>
          <Input
            id="title"
            {...form.register('title')}
            placeholder="e.g., Monthly GST Filing"
          />
          {form.formState.errors.title && (
            <p className="text-sm text-red-500 mt-1">{form.formState.errors.title.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={selectedCategory} onValueChange={(value) => form.setValue('category', value as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gst">GST Filing</SelectItem>
              <SelectItem value="itr">ITR Filing</SelectItem>
              <SelectItem value="roc">ROC Filing</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...form.register('description')}
          placeholder="Describe what this template is for..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="assigned_employee">Assign to Employee</Label>
          <Select 
            value={form.watch('assigned_employee_id') || ''} 
            onValueChange={(value) => form.setValue('assigned_employee_id', value || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select employee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Unassigned</SelectItem>
              {employees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.user_id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_recurring"
          checked={isRecurring}
          onCheckedChange={(checked) => form.setValue('is_recurring', checked)}
        />
        <Label htmlFor="is_recurring">Recurring Template</Label>
      </div>

      {isRecurring && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="recurrence_pattern">Recurrence Pattern</Label>
            <Select 
              value={form.watch('recurrence_pattern') || ''} 
              onValueChange={(value) => form.setValue('recurrence_pattern', value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select pattern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {form.watch('recurrence_pattern') === 'custom' && (
            <div>
              <Label htmlFor="deadline">Custom Deadline</Label>
              <Input
                id="deadline"
                {...form.register('deadline')}
                placeholder="e.g., 15th of every month"
              />
            </div>
          )}
        </div>
      )}

      <div className="flex items-center space-x-2">
        <Switch
          id="is_payable_task"
          checked={isPayableTask}
          onCheckedChange={(checked) => form.setValue('is_payable_task', checked)}
        />
        <Label htmlFor="is_payable_task">Payable Task</Label>
      </div>

      {isPayableTask && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price">Price (₹)</Label>
            <Input
              id="price"
              type="number"
              {...form.register('price', { valueAsNumber: true })}
              placeholder="Enter amount"
            />
          </div>

          <div>
            <Label htmlFor="payable_task_type">Payment Configuration</Label>
            <Select 
              value={form.watch('payable_task_type') || ''} 
              onValueChange={(value) => form.setValue('payable_task_type', value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select config" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="payable_task_1">Payment Config 1</SelectItem>
                <SelectItem value="payable_task_2">Payment Config 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Subtasks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Input
              placeholder="Subtask title"
              value={newSubtask.title}
              onChange={(e) => setNewSubtask({ ...newSubtask, title: e.target.value })}
            />
            <div className="flex gap-2">
              <Input
                placeholder="Description (optional)"
                value={newSubtask.description}
                onChange={(e) => setNewSubtask({ ...newSubtask, description: e.target.value })}
              />
              <Button type="button" onClick={addSubtask} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {subtasks.map((subtask, index) => (
              <div key={subtask.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <Badge variant="outline">{index + 1}</Badge>
                <div className="flex-1">
                  <div className="font-medium text-sm">{subtask.title}</div>
                  {subtask.description && (
                    <div className="text-xs text-muted-foreground">{subtask.description}</div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSubtask(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isCreating || isUpdating}
          className="bg-ca-blue hover:bg-ca-blue-dark"
        >
          {isCreating || isUpdating ? 'Saving...' : (templateId ? 'Update Template' : 'Create Template')}
        </Button>
      </div>
    </form>
  );
}
