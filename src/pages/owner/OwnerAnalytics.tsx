
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const OwnerAnalytics = () => {
  const [timeRange, setTimeRange] = useState('year');
  
  // Sample data for revenue over time
  const revenueData = [
    { month: 'Jan', revenue: 40000, expenses: 25000 },
    { month: 'Feb', revenue: 45000, expenses: 28000 },
    { month: 'Mar', revenue: 35000, expenses: 24000 },
    { month: 'Apr', revenue: 50000, expenses: 30000 },
    { month: 'May', revenue: 48000, expenses: 28000 },
    { month: 'Jun', revenue: 55000, expenses: 32000 },
    { month: 'Jul', revenue: 60000, expenses: 35000 },
    { month: 'Aug', revenue: 65000, expenses: 38000 },
    { month: 'Sep', revenue: 70000, expenses: 40000 },
    { month: 'Oct', revenue: 75000, expenses: 42000 },
    { month: 'Nov', revenue: 80000, expenses: 45000 },
    { month: 'Dec', revenue: 85000, expenses: 48000 },
  ];
  
  // Sample data for client distribution
  const clientDistributionData = [
    { name: 'GST Filing', value: 35 },
    { name: 'Tax Planning', value: 25 },
    { name: 'Audit', value: 20 },
    { name: 'Accounting', value: 15 },
    { name: 'Other Services', value: 5 },
  ];
  
  // Sample data for task completion
  const taskCompletionData = [
    { name: 'On Time', value: 75 },
    { name: 'Delayed', value: 20 },
    { name: 'Overdue', value: 5 },
  ];
  
  // Sample data for employee performance
  const employeePerformanceData = [
    { name: 'Jane Smith', tasks: 25, efficiency: 92 },
    { name: 'Mike Brown', tasks: 18, efficiency: 85 },
    { name: 'Sara Williams', tasks: 30, efficiency: 95 },
    { name: 'Alex Johnson', tasks: 12, efficiency: 78 },
    { name: 'Priya Sharma', tasks: 22, efficiency: 90 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Analytics & Reporting</h1>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Revenue</CardTitle>
            <CardDescription>This {timeRange}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹623,000</div>
            <div className="text-sm text-green-600">+8% from previous {timeRange}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Tasks Completed</CardTitle>
            <CardDescription>This {timeRange}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">142</div>
            <div className="text-sm text-green-600">+12% from previous {timeRange}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Client Acquisition</CardTitle>
            <CardDescription>This {timeRange}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">8</div>
            <div className="text-sm text-green-600">+2 from previous {timeRange}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="revenue">
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
        </TabsList>
        
        <TabsContent value="revenue" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue vs Expenses</CardTitle>
              <CardDescription>Analysis of your firm's financial performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, ""]} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#1e3a8a" strokeWidth={2} name="Revenue" />
                    <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="services" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Distribution</CardTitle>
              <CardDescription>Revenue by service category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={clientDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {clientDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, ""]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tasks" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Task Completion</CardTitle>
              <CardDescription>Performance metrics for task completion</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={taskCompletionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#10b981" /> {/* Green for On Time */}
                      <Cell fill="#f59e0b" /> {/* Yellow for Delayed */}
                      <Cell fill="#ef4444" /> {/* Red for Overdue */}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, ""]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="employees" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Employee Performance</CardTitle>
              <CardDescription>Task completion and efficiency by employee</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={employeePerformanceData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="tasks" name="Tasks Completed" fill="#8884d8" />
                    <Bar yAxisId="right" dataKey="efficiency" name="Efficiency %" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OwnerAnalytics;
