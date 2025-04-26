
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useState } from "react";
import { FormDialog } from "@/components/shared/FormDialog";
import { Plus } from "lucide-react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

const templateFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(5, "Description is required"),
  price: z.coerce.number().min(0, "Price must be a positive number"),
});

const TemplateForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof templateFormSchema>>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
    },
  });
  
  const onSubmit = async (values: z.infer<typeof templateFormSchema>) => {
    try {
      setIsSubmitting(true);
      console.log('Creating template:', values);
      
      // Simulate API call
      setTimeout(() => {
        toast.success("Template created successfully");
        setIsSubmitting(false);
        form.reset();
        onSuccess();
      }, 1000);
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error("Failed to create template");
      setIsSubmitting(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Template Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter template title" {...field} />
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
                <Textarea 
                  placeholder="Enter template description" 
                  className="min-h-20" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price (₹)</FormLabel>
              <FormControl>
                <Input type="number" min="0" step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="pt-4 space-x-2 flex justify-end">
          <Button 
            type="submit" 
            className="bg-ca-blue hover:bg-ca-blue-dark"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Template"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

const AdminTemplates = () => {
  const { taskTemplates } = useSelector((state: RootState) => state.tasks);
  const [showAddTemplate, setShowAddTemplate] = useState(false);

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-ca-blue/10 to-transparent">
          <div>
            <CardTitle className="text-2xl text-ca-blue-dark">Task Templates</CardTitle>
            <p className="text-sm text-muted-foreground">
              Manage reusable task templates
            </p>
          </div>
          <Button 
            className="bg-ca-blue hover:bg-ca-blue-dark"
            onClick={() => setShowAddTemplate(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Create Template
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {taskTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{template.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                  <div className="mt-2 text-sm">
                    Price: ₹{template.price}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <FormDialog
        open={showAddTemplate}
        onOpenChange={setShowAddTemplate}
        title="Create New Template"
        description="Create a reusable task template"
        showFooter={false}
      >
        <TemplateForm onSuccess={() => setShowAddTemplate(false)} />
      </FormDialog>
    </div>
  );
};

export default AdminTemplates;
