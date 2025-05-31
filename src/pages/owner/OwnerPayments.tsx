
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FormDialog } from '@/components/shared/FormDialog';
import { QuotationForm } from '@/components/payments/QuotationForm';
import { QuotationList } from '@/components/payments/QuotationList';
import { PaymentConfigurationForm } from '@/components/payments/PaymentConfigurationForm';
import { usePaymentConfigurations } from '@/hooks/usePayments';
import { Plus, Settings, CreditCard, Send } from 'lucide-react';

const OwnerPayments = () => {
  const [showQuotationForm, setShowQuotationForm] = useState(false);
  const { configurations, isLoading } = usePaymentConfigurations();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Payment Management</h1>
        <Button 
          className="bg-ca-blue hover:bg-ca-blue-dark"
          onClick={() => setShowQuotationForm(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Quotation
        </Button>
      </div>

      <Tabs defaultValue="quotations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="quotations" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Quotations
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="configurations" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quotations">
          <QuotationList />
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Payment history will be displayed here once payments are processed.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configurations">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Gateway Configurations</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configure your Razorpay and Stripe accounts for payable tasks
                </p>
              </CardHeader>
            </Card>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ca-blue"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {configurations.map((config) => (
                  <PaymentConfigurationForm
                    key={config.id}
                    configuration={config}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <FormDialog
        open={showQuotationForm}
        onOpenChange={setShowQuotationForm}
        title="Create New Quotation"
        description="Generate a quotation for your client with payment integration"
        showFooter={false}
      >
        <QuotationForm onSuccess={() => setShowQuotationForm(false)} />
      </FormDialog>
    </div>
  );
};

export default OwnerPayments;
