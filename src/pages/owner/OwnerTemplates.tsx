
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TemplateManager } from '@/components/templates/TemplateManager';

const OwnerTemplates = () => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Task Templates</h1>
      </div>
      
      <Card className="shadow-md">
        <CardHeader className="bg-gradient-to-r from-ca-blue/10 to-transparent pb-6">
          <CardTitle className="text-2xl">Template Management</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage reusable task templates for different categories
          </p>
        </CardHeader>
        <CardContent className="py-6">
          <TemplateManager />
        </CardContent>
      </Card>
    </div>
  );
};

export default OwnerTemplates;
