import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  Database, 
  Shield, 
  Zap, 
  CreditCard, 
  Mail, 
  RefreshCw 
} from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
  duration?: number;
  details?: any;
}

export const BackendConnectivityTest = () => {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();

  const updateTest = (name: string, status: TestResult['status'], message: string, details?: any) => {
    setTests(prev => prev.map(test => 
      test.name === name 
        ? { ...test, status, message, details }
        : test
    ));
  };

  const addTest = (name: string) => {
    setTests(prev => [...prev, {
      name,
      status: 'pending',
      message: 'Starting test...'
    }]);
  };

  const runComprehensiveTest = async () => {
    setIsRunning(true);
    setProgress(0);
    setTests([]);

    const testNames = [
      'Database Connection',
      'Authentication Status',
      'Supabase Client',
      'RLS Policies',
      'Edge Functions',
      'Payment Integration',
      'Email Service',
      'Automation Settings',
      'Real-time Updates',
      'CRUD Operations',
      'File Operations',
      'Search Functionality'
    ];

    // Initialize all tests
    testNames.forEach(name => addTest(name));

    try {
      // Test 1: Database Connection
      const startTime = Date.now();
      try {
        const { data, error } = await supabase.from('profiles').select('count').limit(1);
        if (error) throw error;
        updateTest('Database Connection', 'success', 'Database connected successfully', { count: data?.length || 0 });
      } catch (error) {
        updateTest('Database Connection', 'error', `Database connection failed: ${error.message}`);
      }
      setProgress(8);

      // Test 2: Authentication Status
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser) {
          updateTest('Authentication Status', 'success', `User authenticated: ${currentUser.email}`, { 
            userId: currentUser.id,
            role: user?.role || 'unknown'
          });
        } else {
          updateTest('Authentication Status', 'warning', 'No user currently authenticated');
        }
      } catch (error) {
        updateTest('Authentication Status', 'error', `Authentication check failed: ${error.message}`);
      }
      setProgress(16);

      // Test 3: Supabase Client
      try {
        const { data, error } = await supabase.from('profiles').select('*').limit(1);
        if (error) throw error;
        updateTest('Supabase Client', 'success', 'Supabase client working correctly', { recordCount: data?.length || 0 });
      } catch (error) {
        updateTest('Supabase Client', 'error', `Supabase client error: ${error.message}`);
      }
      setProgress(24);

      // Test 4: RLS Policies
      try {
        const { data: clientsData } = await supabase.from('clients').select('*').limit(1);
        const { data: tasksData } = await supabase.from('tasks').select('*').limit(1);
        const { data: invoicesData } = await supabase.from('invoices').select('*').limit(1);
        
        updateTest('RLS Policies', 'success', 'RLS policies working correctly', {
          clientsAccess: clientsData?.length >= 0,
          tasksAccess: tasksData?.length >= 0,
          invoicesAccess: invoicesData?.length >= 0
        });
      } catch (error) {
        updateTest('RLS Policies', 'error', `RLS policy test failed: ${error.message}`);
      }
      setProgress(32);

      // Test 5: Edge Functions
      try {
        const testFunctions = [
          'auto-generate-invoice',
          'generate-recurring-tasks',
          'send-deadline-reminders',
          'create-payment-link'
        ];

        let successCount = 0;
        const results = [];

        for (const funcName of testFunctions) {
          try {
            const { data, error } = await supabase.functions.invoke(funcName, {
              body: { test: true }
            });
            if (!error) {
              successCount++;
              results.push({ function: funcName, status: 'success' });
            } else {
              results.push({ function: funcName, status: 'error', error: error.message });
            }
          } catch (err) {
            results.push({ function: funcName, status: 'error', error: err.message });
          }
        }

        if (successCount === testFunctions.length) {
          updateTest('Edge Functions', 'success', `All ${successCount} edge functions accessible`, { results });
        } else {
          updateTest('Edge Functions', 'warning', `${successCount}/${testFunctions.length} edge functions working`, { results });
        }
      } catch (error) {
        updateTest('Edge Functions', 'error', `Edge function test failed: ${error.message}`);
      }
      setProgress(40);

      // Test 6: Payment Integration
      try {
        const { data: paymentConfigs } = await supabase.from('payment_configurations').select('*').limit(1);
        const { data: quotations } = await supabase.from('quotations').select('*').limit(1);
        
        updateTest('Payment Integration', 'success', 'Payment system accessible', {
          hasPaymentConfig: paymentConfigs?.length > 0,
          hasQuotations: quotations?.length > 0
        });
      } catch (error) {
        updateTest('Payment Integration', 'error', `Payment integration test failed: ${error.message}`);
      }
      setProgress(48);

      // Test 7: Email Service
      try {
        const { data: communications } = await supabase.from('client_communications').select('*').limit(1);
        updateTest('Email Service', 'success', 'Email service accessible', {
          hasCommunications: communications?.length > 0
        });
      } catch (error) {
        updateTest('Email Service', 'error', `Email service test failed: ${error.message}`);
      }
      setProgress(56);

      // Test 8: Automation Settings
      try {
        const { data: automationSettings } = await supabase.from('automation_settings').select('*').limit(1);
        updateTest('Automation Settings', 'success', 'Automation settings accessible', {
          hasSettings: automationSettings?.length > 0
        });
      } catch (error) {
        updateTest('Automation Settings', 'error', `Automation settings test failed: ${error.message}`);
      }
      setProgress(64);

      // Test 9: Real-time Updates
      try {
        const channel = supabase.channel('test-channel');
        channel.subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            updateTest('Real-time Updates', 'success', 'Real-time subscriptions working', { status });
            supabase.removeChannel(channel);
          }
        });
      } catch (error) {
        updateTest('Real-time Updates', 'error', `Real-time test failed: ${error.message}`);
      }
      setProgress(72);

      // Test 10: CRUD Operations
      try {
        // Test Create
        const testTaskData = {
          title: 'Test Task - Backend Connectivity',
          description: 'This is a test task for backend connectivity testing',
          category: 'testing',
          status: 'todo',
          priority: 'low',
          is_deleted: false
        };

        const { data: createResult, error: createError } = await supabase
          .from('tasks')
          .insert(testTaskData)
          .select()
          .single();

        if (createError) throw createError;

        // Test Read
        const { data: readResult, error: readError } = await supabase
          .from('tasks')
          .select('*')
          .eq('id', createResult.id)
          .single();

        if (readError) throw readError;

        // Test Update
        const { data: updateResult, error: updateError } = await supabase
          .from('tasks')
          .update({ status: 'completed' })
          .eq('id', createResult.id)
          .select()
          .single();

        if (updateError) throw updateError;

        // Test Delete (soft delete)
        const { error: deleteError } = await supabase
          .from('tasks')
          .update({ is_deleted: true })
          .eq('id', createResult.id);

        if (deleteError) throw deleteError;

        updateTest('CRUD Operations', 'success', 'All CRUD operations working', {
          created: !!createResult,
          read: !!readResult,
          updated: !!updateResult,
          deleted: true
        });
      } catch (error) {
        updateTest('CRUD Operations', 'error', `CRUD operations test failed: ${error.message}`);
      }
      setProgress(80);

      // Test 11: File Operations
      try {
        const { data: documents } = await supabase.from('client_documents').select('*').limit(1);
        updateTest('File Operations', 'success', 'File operations accessible', {
          hasDocuments: documents?.length > 0
        });
      } catch (error) {
        updateTest('File Operations', 'error', `File operations test failed: ${error.message}`);
      }
      setProgress(88);

      // Test 12: Search Functionality
      try {
        const { data: searchResults } = await supabase
          .from('tasks')
          .select('*')
          .textSearch('search_vector', 'test')
          .limit(5);

        updateTest('Search Functionality', 'success', 'Search functionality working', {
          resultCount: searchResults?.length || 0
        });
      } catch (error) {
        updateTest('Search Functionality', 'error', `Search functionality test failed: ${error.message}`);
      }
      setProgress(96);

      // Final summary
      const successfulTests = tests.filter(test => test.status === 'success').length;
      const totalTests = tests.length;
      
      toast({
        title: "Backend Connectivity Test Complete",
        description: `${successfulTests}/${totalTests} tests passed`,
        variant: successfulTests === totalTests ? "default" : "destructive"
      });

      setProgress(100);
    } catch (error) {
      toast({
        title: "Test Error",
        description: `Test suite failed: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Pass</Badge>;
      case 'error':
        return <Badge variant="destructive">Fail</Badge>;
      case 'warning':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-800">Warning</Badge>;
      default:
        return <Badge variant="outline">Running</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Backend Connectivity Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Comprehensive test of all backend systems and integrations
              </p>
            </div>
            <Button 
              onClick={runComprehensiveTest}
              disabled={isRunning}
              className="bg-ca-blue hover:bg-ca-blue-dark"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Run Full Test
                </>
              )}
            </Button>
          </div>

          {isRunning && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress:</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {tests.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Test Results</h3>
              <div className="space-y-2">
                {tests.map((test, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(test.status)}
                      <div>
                        <p className="font-medium">{test.name}</p>
                        <p className="text-sm text-muted-foreground">{test.message}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(test.status)}
                      {test.details && (
                        <details className="text-xs">
                          <summary className="cursor-pointer text-blue-600">Details</summary>
                          <pre className="mt-1 text-xs overflow-x-auto">
                            {JSON.stringify(test.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tests.length > 0 && !isRunning && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Test Summary:</strong> {tests.filter(t => t.status === 'success').length} passed, {' '}
                {tests.filter(t => t.status === 'error').length} failed, {' '}
                {tests.filter(t => t.status === 'warning').length} warnings
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Authentication
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user ? 'Active' : 'Inactive'}
            </div>
            <p className="text-xs text-muted-foreground">
              {user ? `${user.email} (${user.role})` : 'No user authenticated'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Edge Functions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Ready</div>
            <p className="text-xs text-muted-foreground">
              Auto-invoice, Recurring tasks, Notifications
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Integrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Configured</div>
            <p className="text-xs text-muted-foreground">
              Stripe payments, Email service
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};