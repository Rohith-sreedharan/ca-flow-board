
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormDialog } from "@/components/shared/FormDialog";
import { useState } from "react";
import { AddEmployeeForm } from "@/components/forms/AddEmployeeForm";
import { useEmployees } from "@/hooks/useEmployees";

const AdminEmployees = () => {
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const { employees, isLoading } = useEmployees();

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-ca-blue"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-ca-blue/10 to-transparent">
          <div>
            <CardTitle className="text-2xl text-ca-blue-dark">Employee Management</CardTitle>
            <p className="text-sm text-muted-foreground">
              Manage employee accounts and permissions
            </p>
          </div>
          <Button 
            onClick={() => setShowAddEmployee(true)}
            className="bg-ca-blue hover:bg-ca-blue-dark"
          >
            Add Employee
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            {employees.length === 0 ? 'No employees found' : `${employees.length} employees found`}
          </div>
        </CardContent>
      </Card>

      <FormDialog
        open={showAddEmployee}
        onOpenChange={setShowAddEmployee}
        title="Add New Employee"
        description="Create a new employee account"
        showFooter={false}
      >
        <AddEmployeeForm onSuccess={() => setShowAddEmployee(false)} />
      </FormDialog>
    </div>
  );
};

export default AdminEmployees;
