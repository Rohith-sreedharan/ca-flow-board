
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormDialog } from "@/components/shared/FormDialog";
import { useState } from "react";
import { AddInvoiceForm } from "@/components/forms/AddInvoiceForm";
import { Plus } from "lucide-react";

const AdminInvoices = () => {
  const [showAddInvoice, setShowAddInvoice] = useState(false);

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-ca-blue/10 to-transparent">
          <div>
            <CardTitle className="text-2xl text-ca-blue-dark">Invoices Management</CardTitle>
            <p className="text-sm text-muted-foreground">
              Manage and monitor all invoices
            </p>
          </div>
          <Button 
            className="bg-ca-blue hover:bg-ca-blue-dark"
            onClick={() => setShowAddInvoice(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            No invoices found
          </div>
        </CardContent>
      </Card>

      <FormDialog
        open={showAddInvoice}
        onOpenChange={setShowAddInvoice}
        title="Create New Invoice"
        description="Generate an invoice for your client"
        showFooter={false}
      >
        <AddInvoiceForm onSuccess={() => setShowAddInvoice(false)} />
      </FormDialog>
    </div>
  );
};

export default AdminInvoices;
