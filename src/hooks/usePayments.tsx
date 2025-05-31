
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Quotation {
  id: string;
  quotation_number: string;
  task_id?: string;
  client_id?: string;
  amount: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  valid_until?: string;
  payment_terms?: string;
  notes?: string;
  payment_type?: 'payable_task_1' | 'payable_task_2';
  payment_link_id?: string;
  payment_link_url?: string;
  sent_via_whatsapp: boolean;
  whatsapp_sent_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

interface Payment {
  id: string;
  payment_id: string;
  quotation_id?: string;
  task_id?: string;
  client_id?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed' | 'cancelled' | 'refunded';
  payment_method?: string;
  payment_gateway?: 'razorpay_1' | 'razorpay_2' | 'stripe_1' | 'stripe_2';
  gateway_response?: any;
  transaction_fee: number;
  receipt_url?: string;
  receipt_sent: boolean;
  receipt_sent_at?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

interface PaymentConfiguration {
  id: string;
  config_name: 'payable_task_1' | 'payable_task_2';
  gateway_type: 'razorpay' | 'stripe';
  is_active: boolean;
  webhook_secret?: string;
  business_name?: string;
  business_email?: string;
  business_phone?: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

export const useQuotations = () => {
  const queryClient = useQueryClient();

  const { data: quotations = [], isLoading, error } = useQuery({
    queryKey: ['quotations'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('quotations')
          .select(`
            *,
            clients(name, email, phone),
            tasks(title, description)
          `)
          .eq('is_deleted', false)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
      } catch (err) {
        console.error('Quotations fetch error:', err);
        return [];
      }
    },
  });

  const createQuotation = useMutation({
    mutationFn: async (quotationData: Omit<Quotation, 'id' | 'quotation_number' | 'created_at' | 'updated_at'>) => {
      try {
        const { data, error } = await supabase
          .from('quotations')
          .insert([quotationData])
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (err) {
        console.error('Quotation creation error:', err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      toast.success('Quotation created successfully');
    },
    onError: () => {
      toast.error('Failed to create quotation');
    },
  });

  const updateQuotation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Quotation> & { id: string }) => {
      try {
        const { data, error } = await supabase
          .from('quotations')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (err) {
        console.error('Quotation update error:', err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      toast.success('Quotation updated successfully');
    },
    onError: () => {
      toast.error('Failed to update quotation');
    },
  });

  const sendWhatsAppQuotation = useMutation({
    mutationFn: async ({ quotationId, phoneNumber }: { quotationId: string; phoneNumber: string }) => {
      try {
        // Get quotation details
        const { data: quotation, error } = await supabase
          .from('quotations')
          .select('*')
          .eq('id', quotationId)
          .single();

        if (error) throw error;

        // Create WhatsApp deep link
        const message = `Hi! Please find your quotation ${quotation.quotation_number} for ₹${quotation.total_amount}. Payment link: ${quotation.payment_link_url || 'Will be shared shortly'}`;
        const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^\d]/g, '')}?text=${encodeURIComponent(message)}`;

        // Update quotation as sent via WhatsApp
        await supabase
          .from('quotations')
          .update({ 
            sent_via_whatsapp: true, 
            whatsapp_sent_at: new Date().toISOString() 
          })
          .eq('id', quotationId);

        // Open WhatsApp
        window.open(whatsappUrl, '_blank');

        return { success: true };
      } catch (err) {
        console.error('WhatsApp send error:', err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      toast.success('WhatsApp quotation sent successfully');
    },
    onError: () => {
      toast.error('Failed to send WhatsApp quotation');
    },
  });

  return {
    quotations,
    isLoading,
    error,
    createQuotation: createQuotation.mutate,
    updateQuotation: updateQuotation.mutate,
    sendWhatsAppQuotation: sendWhatsAppQuotation.mutate,
    isCreating: createQuotation.isPending,
    isUpdating: updateQuotation.isPending,
    isSending: sendWhatsAppQuotation.isPending,
  };
};

export const usePayments = () => {
  const queryClient = useQueryClient();

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('payments')
          .select(`
            *,
            clients(name, email, phone),
            quotations(quotation_number, amount),
            tasks(title)
          `)
          .eq('is_deleted', false)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
      } catch (err) {
        console.error('Payments fetch error:', err);
        return [];
      }
    },
  });

  const createPayment = useMutation({
    mutationFn: async (paymentData: Omit<Payment, 'id' | 'created_at' | 'updated_at'>) => {
      try {
        const { data, error } = await supabase
          .from('payments')
          .insert([paymentData])
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (err) {
        console.error('Payment creation error:', err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success('Payment recorded successfully');
    },
    onError: () => {
      toast.error('Failed to record payment');
    },
  });

  return {
    payments,
    isLoading,
    createPayment: createPayment.mutate,
    isCreating: createPayment.isPending,
  };
};

export const usePaymentConfigurations = () => {
  const queryClient = useQueryClient();

  const { data: configurations = [], isLoading } = useQuery({
    queryKey: ['payment-configurations'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('payment_configurations')
          .select('*')
          .eq('is_deleted', false)
          .order('config_name');

        if (error) throw error;
        return data || [];
      } catch (err) {
        console.error('Payment configurations fetch error:', err);
        return [];
      }
    },
  });

  const updateConfiguration = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PaymentConfiguration> & { id: string }) => {
      try {
        const { data, error } = await supabase
          .from('payment_configurations')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (err) {
        console.error('Configuration update error:', err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-configurations'] });
      toast.success('Payment configuration updated successfully');
    },
    onError: () => {
      toast.error('Failed to update payment configuration');
    },
  });

  return {
    configurations,
    isLoading,
    updateConfiguration: updateConfiguration.mutate,
    isUpdating: updateConfiguration.isPending,
  };
};
