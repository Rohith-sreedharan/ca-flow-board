
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { usePaymentConfigurations } from '@/hooks/usePayments';
import { Settings, CreditCard } from 'lucide-react';

const configSchema = z.object({
  gateway_type: z.enum(['razorpay', 'stripe']),
  is_active: z.boolean(),
  business_name: z.string().optional(),
  business_email: z.string().email().optional(),
  business_phone: z.string().optional(),
  logo_url: z.string().url().optional(),
});

type ConfigFormData = z.infer<typeof configSchema>;

interface Props {
  configuration?: any;
  onSuccess?: () => void;
}

export const PaymentConfigurationForm: React.FC<Props> = ({ configuration, onSuccess }) => {
  const { updateConfiguration, isUpdating } = usePaymentConfigurations();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ConfigFormData>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      gateway_type: configuration?.gateway_type || 'razorpay',
      is_active: configuration?.is_active ?? true,
      business_name: configuration?.business_name || '',
      business_email: configuration?.business_email || '',
      business_phone: configuration?.business_phone || '',
      logo_url: configuration?.logo_url || '',
    },
  });

  const isActive = watch('is_active');

  const onSubmit = async (data: ConfigFormData) => {
    if (!configuration?.id) return;

    updateConfiguration({
      id: configuration.id,
      ...data,
    });
    onSuccess?.();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Payment Configuration - {configuration?.config_name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center space-x-2">
            <Switch
              checked={isActive}
              onCheckedChange={(checked) => setValue('is_active', checked)}
            />
            <Label>Active Configuration</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gateway_type">Payment Gateway</Label>
            <Select onValueChange={(value) => setValue('gateway_type', value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select gateway" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="razorpay">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Razorpay
                  </div>
                </SelectItem>
                <SelectItem value="stripe">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Stripe
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="business_name">Business Name</Label>
              <Input
                id="business_name"
                {...register('business_name')}
                placeholder="Your Business Name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_email">Business Email</Label>
              <Input
                id="business_email"
                type="email"
                {...register('business_email')}
                placeholder="contact@business.com"
              />
              {errors.business_email && (
                <p className="text-sm text-red-600">{errors.business_email.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="business_phone">Business Phone</Label>
              <Input
                id="business_phone"
                {...register('business_phone')}
                placeholder="+91 9876543210"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo_url">Logo URL</Label>
              <Input
                id="logo_url"
                {...register('logo_url')}
                placeholder="https://example.com/logo.png"
              />
              {errors.logo_url && (
                <p className="text-sm text-red-600">{errors.logo_url.message}</p>
              )}
            </div>
          </div>

          <div className="bg-amber-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Required API Keys</h4>
            <p className="text-sm text-gray-600">
              API keys and secrets need to be configured in the Edge Function secrets:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 mt-2">
              <li>RAZORPAY_KEY_1 & RAZORPAY_SECRET_1 (for payable_task_1)</li>
              <li>RAZORPAY_KEY_2 & RAZORPAY_SECRET_2 (for payable_task_2)</li>
              <li>STRIPE_SECRET_KEY_1 & STRIPE_SECRET_KEY_2 (for Stripe configs)</li>
            </ul>
          </div>

          <Button type="submit" disabled={isUpdating} className="w-full">
            {isUpdating ? 'Updating...' : 'Update Configuration'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
