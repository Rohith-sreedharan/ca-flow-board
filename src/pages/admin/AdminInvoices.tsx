
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const AdminInvoices = () => {
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
          <Button className="bg-ca-blue hover:bg-ca-blue-dark">
            Create Invoice
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            No invoices found
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminInvoices;
