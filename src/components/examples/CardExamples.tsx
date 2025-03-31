import { SummaryCard } from "@/components/ui/SummaryCard";
import { DepartmentCard } from "@/components/ui/DepartmentCard";

export function CardExamples() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">Summary Card</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SummaryCard
            title="Employee Statistics"
            items={[
              { label: "Total Employees", value: 150 },
              { label: "Active", value: 120, valueColor: "text-green-600" },
              { label: "On Leave", value: 30, valueColor: "text-yellow-600" },
            ]}
          />
          <SummaryCard
            title="Department Overview"
            items={[
              { label: "IT Department", value: "25 members" },
              { label: "HR Department", value: "15 members" },
              { label: "Finance", value: "20 members" },
            ]}
          />
        </div>

        <div className="mt-6">
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
            <code>{`<SummaryCard
  title="Employee Statistics"
  items={[
    { label: "Total Employees", value: 150 },
    { label: "Active", value: 120, valueColor: "text-green-600" },
    { label: "On Leave", value: 30, valueColor: "text-yellow-600" },
  ]}
/>`}</code>
          </pre>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Department Card</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DepartmentCard title="IT Department" timeIn={85} timeOut={92} />
          <DepartmentCard title="HR Department" timeIn={78} timeOut={88} />
          <DepartmentCard title="Finance" timeIn={92} timeOut={95} />
        </div>

        <div className="mt-6">
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
            <code>{`<DepartmentCard
  title="IT Department"
  timeIn={85}
  timeOut={92}
/>`}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
