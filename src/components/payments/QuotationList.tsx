
import React from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useQuotations } from '@/hooks/usePayments';
import { Send, Download, Eye, MessageCircle } from 'lucide-react';

export const QuotationList = () => {
  const { quotations, isLoading, sendWhatsAppQuotation } = useQuotations();

  const getStatusBadge = (status: string) => {
    const statusColors = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      expired: 'bg-orange-100 text-orange-800',
    };

    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleWhatsAppSend = (quotation: any) => {
    const clientPhone = quotation.clients?.phone;
    if (clientPhone) {
      sendWhatsAppQuotation({ quotationId: quotation.id, phoneNumber: clientPhone });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ca-blue"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Quotations ({quotations.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {quotations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No quotations found. Create your first quotation to get started.
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quotation #</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotations.map((quotation: any) => (
                  <TableRow key={quotation.id}>
                    <TableCell className="font-medium">
                      {quotation.quotation_number}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{quotation.clients?.name || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{quotation.clients?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">₹{quotation.total_amount?.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">
                          Base: ₹{quotation.amount?.toLocaleString()} + Tax: ₹{quotation.tax_amount?.toLocaleString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(quotation.status)}
                    </TableCell>
                    <TableCell>
                      {quotation.valid_until ? format(new Date(quotation.valid_until), 'dd/MM/yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {format(new Date(quotation.created_at), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        {quotation.clients?.phone && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleWhatsAppSend(quotation)}
                            title="Send via WhatsApp"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
