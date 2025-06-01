
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAnalytics } from '@/hooks/useAnalytics';
import { DollarSign, TrendingUp, CreditCard, Clock } from 'lucide-react';

export const RevenueTracker = () => {
  const { revenueMetrics, realTimeData } = useAnalytics();

  const monthlyData = [
    { month: 'Jan', revenue: 45000, expenses: 28000 },
    { month: 'Feb', revenue: 52000, expenses: 30000 },
    { month: 'Mar', revenue: 48000, expenses: 29000 },
    { month: 'Apr', revenue: 61000, expenses: 32000 },
    { month: 'May', revenue: 55000, expenses: 31000 },
    { month: 'Jun', revenue: 67000, expenses: 35000 },
  ];

  const paymentStatusData = [
    { name: 'Paid', value: revenueMetrics.paidInvoices, color: '#10b981' },
    { name: 'Pending', value: revenueMetrics.pendingPayments, color: '#f59e0b' },
    { name: 'Overdue', value: 3, color: '#ef4444' },
  ];

  const revenueByService = [
    { service: 'GST Filing', revenue: 125000, percentage: 35 },
    { service: 'ITR Filing', revenue: 89000, percentage: 25 },
    { service: 'ROC Filing', revenue: 67000, percentage: 18 },
    { service: 'Audit Services', revenue: 45000, percentage: 12 },
    { service: 'Others', revenue: 36000, percentage: 10 },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(revenueMetrics.totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Monthly Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(revenueMetrics.monthlyRevenue)}</p>
                <p className="text-xs text-green-600">+{revenueMetrics.revenueGrowth}% growth</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Paid Invoices</p>
                <p className="text-2xl font-bold">{revenueMetrics.paidInvoices}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Pending Payments</p>
                <p className="text-2xl font-bold">{revenueMetrics.pendingPayments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), ""]} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue" />
                  <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {paymentStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Service */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Service Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {revenueByService.map((service, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium">{service.service}</h4>
                  <p className="text-sm text-gray-600">{service.percentage}% of total revenue</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{formatCurrency(service.revenue)}</p>
                  <Badge variant="outline">{service.percentage}%</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Payment Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payment Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {realTimeData?.recentPayments?.slice(0, 8).map((payment: any) => (
              <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium">Payment #{payment.payment_id}</h4>
                  <p className="text-sm text-gray-600">{new Date(payment.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatCurrency(payment.amount)}</p>
                  <Badge 
                    className={
                      payment.status === 'paid' 
                        ? 'bg-green-100 text-green-800' 
                        : payment.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }
                  >
                    {payment.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Average Invoice Value</p>
              <p className="text-2xl font-bold">{formatCurrency(revenueMetrics.averageInvoiceValue)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Revenue Growth</p>
              <p className="text-2xl font-bold text-green-600">+{revenueMetrics.revenueGrowth}%</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Collection Rate</p>
              <p className="text-2xl font-bold text-blue-600">94.2%</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
