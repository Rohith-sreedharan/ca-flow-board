
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Users, UserPlus, Heart, TrendingUp } from 'lucide-react';

export const ClientEngagementAnalytics = () => {
  const { clientEngagement } = useAnalytics();

  const clientGrowthData = [
    { month: 'Jan', total: 18, new: 2, retained: 16 },
    { month: 'Feb', total: 20, new: 3, retained: 17 },
    { month: 'Mar', total: 22, new: 2, retained: 20 },
    { month: 'Apr', total: 24, new: 4, retained: 20 },
    { month: 'May', total: 26, new: 3, retained: 23 },
    { month: 'Jun', total: 28, new: 2, retained: 26 },
  ];

  const engagementData = [
    { type: 'High Engagement', count: 12, percentage: 42.9 },
    { type: 'Medium Engagement', count: 10, percentage: 35.7 },
    { type: 'Low Engagement', count: 6, percentage: 21.4 },
  ];

  const getClientInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getEngagementColor = (type: string) => {
    switch (type) {
      case 'High Engagement': return 'bg-green-100 text-green-800';
      case 'Medium Engagement': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Client Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Total Clients</p>
                <p className="text-2xl font-bold">{clientEngagement.totalClients}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Active Clients</p>
                <p className="text-2xl font-bold">{clientEngagement.activeClients}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium">New This Month</p>
                <p className="text-2xl font-bold">{clientEngagement.newClients}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium">Retention Rate</p>
                <p className="text-2xl font-bold">{clientEngagement.clientRetentionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Client Growth Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Client Growth Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={clientGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} name="Total Clients" />
                  <Line type="monotone" dataKey="new" stroke="#10b981" strokeWidth={2} name="New Clients" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Client Engagement Levels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Clients */}
      <Card>
        <CardHeader>
          <CardTitle>Top Clients by Value</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {clientEngagement.topClients.map((client, index) => (
              <div key={client.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-ca-blue text-white rounded-full text-sm font-bold">
                    {index + 1}
                  </div>
                  <Avatar>
                    <AvatarFallback>
                      {getClientInitials(client.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{client.name}</h4>
                    <p className="text-sm text-gray-600">{client.projectCount} projects</p>
                  </div>
                </div>
                <div className="ml-auto text-right">
                  <p className="font-bold text-lg">{formatCurrency(client.totalValue)}</p>
                  <Badge variant="outline">Top Client</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Engagement Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Client Engagement Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {engagementData.map((engagement, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium">{engagement.type}</h4>
                  <p className="text-sm text-gray-600">{engagement.count} clients</p>
                </div>
                <div className="text-right">
                  <Badge className={getEngagementColor(engagement.type)}>
                    {engagement.percentage.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Avg Project Value</p>
              <p className="text-2xl font-bold">{formatCurrency(clientEngagement.averageProjectValue)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Client Satisfaction</p>
              <p className="text-2xl font-bold text-green-600">4.8/5</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Repeat Business</p>
              <p className="text-2xl font-bold text-blue-600">78%</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
