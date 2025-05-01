import { useState } from 'react';
import EmpInfoDialog from '@/components/ui/emp-info-dialog';
import { Button } from '@/components/ui/button';

// Define the type for the employee data (can be shared or redefined)
interface Employee {
    id: string;
    name: string;
    section: string;
    avatarUrl?: string;
    skills: string[];
    rfidCard: string;
    cardLinked: boolean;
}

export default function EmpInfoDialogExample() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Example employee data
    const employeeData: Employee = {
        id: "000000481",
        name: "Sophia Carter",
        section: "Research & Development",
        avatarUrl: "https://via.placeholder.com/150/0077FF/FFFFFF?text=SC", // Example avatar URL
        skills: [
            "Machine Operation",
            "Welding & Fabrication",
            "Assembly Line Work",
            "CNC Machining",
            "Quality Control & Inspection",
            "Inventory Management",
        ],
        rfidCard: "",
        cardLinked: false,
    };

    // Example employee data when null (for fallback UI)
    const noEmployeeData = null;
    const [isFallbackDialogOpen, setIsFallbackDialogOpen] = useState(false);


    const handleOpenDialog = () => {
        setIsDialogOpen(true);
    };

    const handleOpenFallbackDialog = () => {
        setIsFallbackDialogOpen(true);
    }

    return (
        <section className="space-y-6">
            <h2 className="text-2xl font-semibold">Employee Info Dialog</h2>
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4 mb-4">
                    <Button onClick={handleOpenDialog}>Show Employee Info</Button>
                    <Button onClick={handleOpenFallbackDialog} variant="outline">Show Fallback (No Employee)</Button>
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
                    Click the buttons above to open the dialog with employee data or the fallback view.
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