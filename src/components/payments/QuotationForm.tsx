
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClientSelector } from '@/components/clients/ClientSelector';
import { useQuotations } from '@/hooks/usePayments';
import { CalendarIcon, Send } from 'lucide-react';

const quotationSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  tax_rate: z.number().min(0).max(100).default(18),
  payment_terms: z.string().optional(),
  notes: z.string().optional(),
  valid_until: z.string().optional(),
  payment_type: z.enum(['payable_task_1', 'payable_task_2']),
});

type QuotationFormData = z.infer<typeof quotationSchema>;

interface Props {
  taskId?: string;
  onSuccess?: () => void;
}

export const QuotationForm: React.FC<Props> = ({ taskId, onSuccess }) => {
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const { createQuotation, sendWhatsAppQuotation, isCreating, isSending } = useQuotations();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<QuotationFormData>({
    resolver: zodResolver(quotationSchema),
    defaultValues: {
      tax_rate: 18,
      payment_type: 'payable_task_1',
    },
  });

  const amount = watch('amount');
  const taxRate = watch('tax_rate');

  const calculateTotals = () => {
    const baseAmount = amount || 0;
    const tax = (baseAmount * (taxRate || 0)) / 100;
    const total = baseAmount + tax;
    return { tax, total };
  };

  const { tax, total } = calculateTotals();

  const onSubmit = async (data: QuotationFormData) => {
    if (!selectedClient) {
      return;
    }

    const quotationData = {
      ...data,
      task_id: taskId,
      client_id: selectedClient.id,
      tax_amount: tax,
      total_amount: total,
      status: 'draft' as const,
      sent_via_whatsapp: false,
      valid_until: data.valid_until || null,
    };

    createQuotation(quotationData);
    onSuccess?.();
  };

  const handleSendWhatsApp = () => {
    if (selectedClient?.phone) {
      // This would be called after quotation is created
      // For now, we'll show a placeholder
      console.log('Send WhatsApp to:', selectedClient.phone);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Create Quotation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label>Client *</Label>
            <ClientSelector
              onClientSelect={setSelectedClient}
              selectedClientId={selectedClient?.id}
              placeholder="Select a client for this quotation"
            />
            {!selectedClient && (
              <p className="text-sm text-red-600">Please select a client</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                {...register('amount', { valueAsNumber: true })}
                placeholder="Enter base amount"
              />
              {errors.amount && (
                <p className="text-sm text-red-600">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax_rate">Tax Rate (%)</Label>
              <Input
                id="tax_rate"
                type="number"
                step="0.01"
                {...register('tax_rate', { valueAsNumber: true })}
                placeholder="18"
              />
            </div>
          </div>

          {amount > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Base Amount:</span>
                <span>₹{amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax ({taxRate}%):</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total Amount:</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="payment_type">Payment Configuration</Label>
            <Select onValueChange={(value) => setValue('payment_type', value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment configuration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="payable_task_1">Payment Config 1</SelectItem>
                <SelectItem value="payable_task_2">Payment Config 2</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="valid_until">Valid Until</Label>
            <Input
              id="valid_until"
              type="date"
              {...register('valid_until')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_terms">Payment Terms</Label>
            <Textarea
              id="payment_terms"
              {...register('payment_terms')}
              placeholder="e.g., Payment due within 30 days"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Additional notes for the quotation"
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button 
              type="submit" 
              disabled={isCreating || !selectedClient} 
              className="flex-1"
            >
              {isCreating ? 'Creating...' : 'Create Quotation'}
            </Button>
            
            {selectedClient?.phone && (
              <Button
                type="button"
                variant="outline"
                onClick={handleSendWhatsApp}
                disabled={isSending}
                className="flex items-center gap-2"
              >
                📱 WhatsApp
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
