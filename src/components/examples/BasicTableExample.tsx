import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

interface User {
  id: number;
  name: string;
  role: string;
}

const SAMPLE_DATA: User[] = [
  { id: 1, name: "John Doe", role: "Developer" },
  { id: 2, name: "Jane Smith", role: "Designer" },
  { id: 3, name: "Bob Johnson", role: "Manager" },
  { id: 4, name: "Alice Brown", role: "Developer" },
  { id: 5, name: "Charlie Wilson", role: "Designer" },
];

export function BasicTableExample() {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold">Basic Table</h2>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SAMPLE_DATA.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.role}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="mt-6 rounded-lg bg-muted p-4">
        <pre className="text-sm">
          {`<Table>
  <TableHeader>
    <TableRow>
      <TableHead>ID</TableHead>
      <TableHead>Name</TableHead>
      <TableHead>Role</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.map((item) => (
      <TableRow key={item.id}>
        <TableCell>{item.id}</TableCell>
        <TableCell>{item.name}</TableCell>
        <TableCell>{item.role}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>`}
        </pre>
      </div>
    </section>
  );
}
