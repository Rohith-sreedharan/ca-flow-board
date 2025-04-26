
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

const AdminTemplates = () => {
  const { taskTemplates } = useSelector((state: RootState) => state.tasks);

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
          <Button className="bg-ca-blue hover:bg-ca-blue-dark">
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
    </div>
  );
};

export default AdminTemplates;
