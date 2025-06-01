
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DashboardWidget } from "@/components/dashboard/DashboardWidget";
import { AddWidgetButton } from "@/components/dashboard/AddWidgetButton";
import { RealTimeTaskMonitor } from "@/components/dashboard/RealTimeTaskMonitor";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button } from "@/components/ui/button";
import { Plus, BarChart, Users } from "lucide-react";

const OwnerDashboard = () => {
  const { tasks } = useSelector((state: RootState) => state.tasks);
  
  // Define initial widgets with enhanced dashboard content
  const initialWidgets = [
    {
      id: "task-overview",
      content: (
        <Card className="h-full">
          <CardHeader className="bg-gradient-to-r from-ca-blue/10 to-transparent">
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Task Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Total Tasks:</span>
                <span className="font-bold">{tasks.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Active Tasks:</span>
                <span className="font-bold text-blue-600">{tasks.filter(t => t.status !== 'completed').length}</span>
              </div>
              <div className="flex justify-between">
                <span>Completed Tasks:</span>
                <span className="font-bold text-green-600">{tasks.filter(t => t.status === 'completed').length}</span>
              </div>
              <div className="flex justify-between">
                <span>Overdue Tasks:</span>
                <span className="font-bold text-red-600">
                  {tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'completed').length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ),
    },
    {
      id: "real-time-monitor",
      content: (
        <Card className="h-full">
          <CardHeader className="bg-gradient-to-r from-ca-green/10 to-transparent">
            <CardTitle>Real-Time Monitoring</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <RealTimeTaskMonitor />
          </CardContent>
        </Card>
      ),
    },
    {
      id: "performance-metrics",
      content: (
        <Card className="h-full">
          <CardHeader className="bg-gradient-to-r from-ca-green/10 to-transparent">
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Average Completion Time:</span>
                <span className="font-bold">3.2 days</span>
              </div>
              <div className="flex justify-between">
                <span>Tasks Completed This Week:</span>
                <span className="font-bold text-green-600">12</span>
              </div>
              <div className="flex justify-between">
                <span>On-time Delivery Rate:</span>
                <span className="font-bold text-blue-600">94%</span>
              </div>
              <div className="flex justify-between">
                <span>Employee Efficiency:</span>
                <span className="font-bold text-purple-600">87%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ),
    },
    {
      id: "revenue-summary",
      content: (
        <Card className="h-full">
          <CardHeader className="bg-gradient-to-r from-ca-yellow/10 to-transparent">
            <CardTitle>Revenue Summary</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Monthly Revenue:</span>
                <span className="font-bold text-green-600">₹65,000</span>
              </div>
              <div className="flex justify-between">
                <span>Pending Payments:</span>
                <span className="font-bold text-orange-600">₹12,000</span>
              </div>
              <div className="flex justify-between">
                <span>Growth Rate:</span>
                <span className="font-bold text-blue-600">+12%</span>
              </div>
              <div className="flex justify-between">
                <span>Active Quotations:</span>
                <span className="font-bold">8</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ),
    },
  ];

  const initialPinnedClients = [
    {
      id: "client-abc",
      name: "ABC Corp",
      industry: "Technology",
      contact: "John Doe",
      activeProjects: 3,
      totalValue: 45000,
    },
    {
      id: "client-xyz",
      name: "XYZ Industries",
      industry: "Manufacturing",
      contact: "Jane Smith",
      activeProjects: 2,
      totalValue: 32000,
    },
    {
      id: "client-def",
      name: "DEF Enterprises",
      industry: "Retail",
      contact: "Mike Johnson",
      activeProjects: 1,
      totalValue: 18000,
    },
  ];
  
  // State to manage widgets
  const [widgets, setWidgets] = useState(initialWidgets);
  const [pinnedClients, setPinnedClients] = useState(initialPinnedClients);
  
  // Function to move widgets
  const moveWidget = (dragIndex: number, hoverIndex: number) => {
    const newWidgets = [...widgets];
    const draggedWidget = newWidgets.splice(dragIndex, 1)[0];
    newWidgets.splice(hoverIndex, 0, draggedWidget);
    setWidgets(newWidgets);
  };
  
  // Function to remove a widget
  const handleRemoveWidget = (widgetId: string) => {
    setWidgets(widgets.filter(widget => widget.id !== widgetId));
  };
  
  // Function to add a new widget
  const handleAddWidget = (widgetType: string) => {
    // Create different widget content based on type
    let newWidget;
    
    switch (widgetType) {
      case 'revenue':
        newWidget = {
          id: `revenue-${Date.now()}`,
          content: (
            <Card className="h-full">
              <CardHeader className="bg-gradient-to-r from-ca-blue/10 to-transparent">
                <CardTitle>Revenue Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>Total Revenue: ₹125,000</div>
                  <div>Monthly Growth: +12%</div>
                  <div>Projected Q4: ₹180,000</div>
                </div>
              </CardContent>
            </Card>
          )
        };
        break;
      
      case 'tasks':
        newWidget = {
          id: `tasks-${Date.now()}`,
          content: (
            <Card className="h-full">
              <CardHeader className="bg-gradient-to-r from-ca-green/10 to-transparent">
                <CardTitle>Task Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>High Priority: {tasks.filter(t => t.priority === 'high').length}</div>
                  <div>Medium Priority: {tasks.filter(t => t.priority === 'medium').length}</div>
                  <div>Low Priority: {tasks.filter(t => t.priority === 'low').length}</div>
                </div>
              </CardContent>
            </Card>
          )
        };
        break;
      
      case 'clients':
        newWidget = {
          id: `clients-${Date.now()}`,
          content: (
            <Card className="h-full">
              <CardHeader className="bg-gradient-to-r from-ca-yellow/10 to-transparent">
                <CardTitle>Client Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>Total Clients: 24</div>
                  <div>Active Projects: 18</div>
                  <div>Client Satisfaction: 4.8/5</div>
                </div>
              </CardContent>
            </Card>
          )
        };
        break;
        
      case 'employees':
        newWidget = {
          id: `employees-${Date.now()}`,
          content: (
            <Card className="h-full">
              <CardHeader className="bg-gradient-to-r from-ca-blue/10 to-transparent">
                <CardTitle>Employee Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>Total Employees: 42</div>
                  <div>Active: 38</div>
                  <div>On Leave: 4</div>
                  <div>Avg. Workload: 87%</div>
                </div>
              </CardContent>
            </Card>
          )
        };
        break;
        
      default:
        return;
    }
    
    setWidgets([...widgets, newWidget]);
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-ca-blue/10 to-transparent pb-6">
          <div>
            <CardTitle className="text-2xl text-ca-blue-dark flex items-center gap-2">
              <BarChart className="h-6 w-6" />
              Owner Dashboard
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              Real-time overview of business metrics and analytics
            </CardDescription>
          </div>
          <AddWidgetButton onAddWidget={handleAddWidget} />
        </CardHeader>
        <CardContent className="py-6">
          <DndProvider backend={HTML5Backend}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
              {widgets.map((widget, index) => (
                <DashboardWidget
                  key={widget.id}
                  id={widget.id}
                  index={index}
                  moveWidget={moveWidget}
                  onRemove={handleRemoveWidget}
                >
                  {widget.content}
                </DashboardWidget>
              ))}
            </div>
          </DndProvider>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-ca-yellow/10 to-transparent pb-6">
          <div>
            <CardTitle className="text-2xl text-ca-yellow-dark flex items-center gap-2">
              <Users className="h-6 w-6" />
              Key Clients
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              Quick access to your most important client relationships
            </CardDescription>
          </div>
          <Button className="bg-ca-yellow hover:bg-ca-yellow-dark">
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        </CardHeader>
        <CardContent className="py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
            {pinnedClients.map((client) => (
              <Card key={client.id} className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{client.name}</CardTitle>
                  <p className="text-sm text-gray-600">{client.industry}</p>
                </CardHeader>
                <CardContent className="pt-3">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Contact:</span>
                      <span className="font-medium">{client.contact}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Projects:</span>
                      <span className="font-bold text-blue-600">{client.activeProjects}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Value:</span>
                      <span className="font-bold text-green-600">₹{client.totalValue.toLocaleString()}</span>
                    </div>
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

export default OwnerDashboard;
