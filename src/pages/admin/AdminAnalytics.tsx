
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { BarChart } from "recharts";

const AdminAnalytics = () => {
  const { tasks } = useSelector((state: RootState) => state.tasks);

  // Calculate task statistics
  const tasksByStatus = tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader className="bg-gradient-to-r from-ca-blue/10 to-transparent">
          <CardTitle className="text-2xl text-ca-blue-dark">Analytics Dashboard</CardTitle>
          <p className="text-sm text-muted-foreground">
            System performance and metrics overview
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Task Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.entries(tasksByStatus).map(([status, count]) => (
                  <div key={status} className="flex justify-between items-center py-1">
                    <span className="capitalize">{status}</span>
                    <span>{count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;
