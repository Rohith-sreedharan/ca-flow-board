
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardWidget } from "@/components/dashboard/DashboardWidget";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

const AdminDashboard = () => {
  const { tasks } = useSelector((state: RootState) => state.tasks);
  
  const widgets = [
    {
      id: "task-overview",
      content: (
        <Card className="h-full">
          <CardHeader className="bg-gradient-to-r from-ca-blue/10 to-transparent">
            <CardTitle>Task Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>Total Tasks: {tasks.length}</div>
              <div>Active Tasks: {tasks.filter(t => t.status !== 'completed').length}</div>
              <div>Completed Tasks: {tasks.filter(t => t.status === 'completed').length}</div>
            </div>
          </CardContent>
        </Card>
      ),
    },
    {
      id: "recent-activity",
      content: (
        <Card className="h-full">
          <CardHeader className="bg-gradient-to-r from-ca-blue/10 to-transparent">
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              No recent activity
            </div>
          </CardContent>
        </Card>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader className="bg-gradient-to-r from-ca-blue/10 to-transparent">
          <CardTitle className="text-2xl text-ca-blue-dark">Admin Dashboard</CardTitle>
          <p className="text-sm text-muted-foreground">
            Overview of system performance and recent activities
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {widgets.map((widget, index) => (
              <DashboardWidget
                key={widget.id}
                id={widget.id}
                index={index}
                moveWidget={() => {}}
              >
                {widget.content}
              </DashboardWidget>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
