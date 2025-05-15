import { useState } from "react";
import EmpInfoDialog from "@/components/ui/emp-info-dialog";
import { Button } from "@/components/ui/button";
import type { EmployeeData } from "@/routes/_authenticated/attendance-monitoring/employees";

// Define the type for the employee data (can be shared or redefined)

export default function EmpInfoDialogExample() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Example employee data
  const employeeData: EmployeeData = {
    APOAccount: "APO12345",
    Birthdate: "1990-01-01",
    CardNo1: "CARD001",
    Cardno2: "CARD002",
    CostCenterCode: "COST123",
    DateHired: "2015-06-15",
    DepartmentName: "Engineering",
    DivisionName: "Product Development",
    UHF: "EPC123456",
    EmailAddress: "johndoe@example.com",
    EmployeeID: "EMP12345",
    EmployeeNo: "EMP001",
    EmploymentStatus: "Full-Time",
    FirstName: "John",
    Gender: "Male",
    Grade: "A",
    LastName: "Doe",
    MiddleName: "Michael",
    Position: "Software Engineer",
    SectionName: "Frontend Team",
    FullName: "John Michael Doe",
    AC: null,
  };

  // Example employee data when null (for fallback UI)
  const noEmployeeData = null;
  const [isFallbackDialogOpen, setIsFallbackDialogOpen] = useState(false);

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleOpenFallbackDialog = () => {
    setIsFallbackDialogOpen(true);
  };

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold">Employee Info Dialog</h2>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4 mb-4">
          <Button onClick={handleOpenDialog}>Show Employee Info</Button>
          <Button onClick={handleOpenFallbackDialog} variant="outline">
            Show Fallback (No Employee)
          </Button>
        </div>

        {/* Dialog for valid employee data */}
        <EmpInfoDialog
          employee={employeeData}
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />

        {/* Dialog for fallback UI */}
        <EmpInfoDialog
          employee={noEmployeeData}
          isOpen={isFallbackDialogOpen}
          onOpenChange={setIsFallbackDialogOpen}
        />

        <p className="text-sm text-muted-foreground">
          Click the buttons above to open the dialog with employee data or the
          fallback view.
        </p>
      </div>

      <div className="mt-6 rounded-lg bg-muted p-4">
        <pre className="text-sm">
          {`// Basic usage: Pass employee data, open state, and state setter
import { useState } from 'react';
import EmpInfoDialog from '@/components/ui/emp-info-dialog';
import { Button } from '@/components/ui/button';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const employee = { /* ... employee data object ... */ };
  // or const employee = null; for the fallback view

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Dialog</Button>
      <EmpInfoDialog
        employee={employee}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
      />
    </>
  );
}

// Employee data structure
interface Employee {
  id: string;
  name: string;
  section: string;
  avatarUrl?: string;
  skills: string[];
  rfidCard: string;
  cardLinked: boolean;
}`}
        </pre>
      </div>
    </section>
  );
}
