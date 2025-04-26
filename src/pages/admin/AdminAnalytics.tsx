
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminAnalytics = () => {
  const { tasks } = useSelector((state: RootState) => state.tasks);
  const { invoices } = useSelector((state: RootState) => state.invoices);

  // Calculate task statistics
  const tasksByStatus = tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Format for charts
  const taskStatusData = Object.entries(tasksByStatus).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count
  }));
  
  // Calculate task priority distribution
  const tasksByPriority = tasks.reduce((acc, task) => {
    acc[task.priority] = (acc[task.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const taskPriorityData = Object.entries(tasksByPriority).map(([priority, count]) => ({
    name: priority.charAt(0).toUpperCase() + priority.slice(1),
    value: count
  }));
  
  // Invoice data for the past 6 months
  const currentDate = new Date();
  const monthsData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(currentDate.getMonth() - 5 + i);
    return {
      month: d.toLocaleString('default', { month: 'short' }),
      revenue: Math.round(Math.random() * 100000),
      invoices: Math.round(Math.random() * 20)
    };
  });
  
  // Colors for pie charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

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
          <Tabs defaultValue="tasks" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="financial">Financial</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </TabsList>
            
            <TabsContent value="tasks" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Task Status Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={taskStatusData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {taskStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Task Priority Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={taskPriorityData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" name="Tasks" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="financial" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Monthly Revenue</CardTitle>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                      <Legend />
                      <Bar dataKey="revenue" name="Revenue (₹)" fill="#82ca9d" />
                      <Bar dataKey="invoices" name="Invoices" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="system" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="bg-green-50">
                  <CardHeader>
                    <CardTitle className="text-lg">Server Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className="text-green-600 font-medium">Online</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Uptime:</span>
                        <span>99.98%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>CPU Usage:</span>
                        <span>24%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Memory Usage:</span>
                        <span>42%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-lg">Database Health</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className="text-green-600 font-medium">Good</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Query Performance:</span>
                        <span>Optimal</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Storage Used:</span>
                        <span>36%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Backup:</span>
                        <span>2 hours ago</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-yellow-50">
                  <CardHeader>
                    <CardTitle className="text-lg">System Alerts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-center text-muted-foreground py-4">
                        No active alerts
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;
