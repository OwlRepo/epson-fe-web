import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDivisionData, useDepartmentData, useSectionData, useEmployeeData } from "@/hooks";
import Spinner from "../ui/spinner";

export function SocketHooksExample() {
    // Use local state for tabs instead of relying on URL
    const [activeTab, setActiveTab] = useState("division");

    return (
        <>
            <h2 className="text-2xl font-bold mb-4">Socket Hooks Example</h2>
            <p className="mb-4">
                This example demonstrates how to use socket hooks for real-time data
                updates.
            </p>
            <div className="flex flex-row gap-4 mb-4">
                <p>Add these query parameters in the URL to make it work:</p>
                <code className="text-sm text-muted-black bg-gray-400 p-2 rounded">
                    ?divisionId=%220%22&departmentId=%221%22&sectionId=%220%22
                </code>
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="division">Divisions</TabsTrigger>
                    <TabsTrigger value="department">Departments</TabsTrigger>
                    <TabsTrigger value="section">Sections</TabsTrigger>
                    <TabsTrigger value="employees">Live Employees</TabsTrigger>
                </TabsList>

                <TabsContent value="division">
                    <DivisionExample />
                </TabsContent>

                <TabsContent value="department">
                    <DepartmentExample />
                </TabsContent>

                <TabsContent value="section">
                    <SectionExample />
                </TabsContent>

                <TabsContent value="employees">
                    <EmployeeExample />
                </TabsContent>
            </Tabs>
        </>
    );
}

// Division Tab Content
function DivisionExample() {
    // Using the hooks but don't rely on URL params
    const { data, isLoading, error, isConnected } = useDivisionData();

    return (
        <>
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        Division Data
                        <ConnectionStatus isConnected={isConnected} />
                    </CardTitle>
                    <CardDescription>
                        Data from socket room "Division" showing divisions and their counts
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Spinner />
                        </div>
                    ) : error ? (
                        <div className="p-4 bg-red-100 text-red-800 rounded-md">
                            Error: {error}
                        </div>
                    ) : data.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">No divisions found</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {data.map((division, idx) => (
                                <Card key={division.name || idx} className="bg-muted/40">
                                    <CardContent className="pt-6">
                                        <h3 className="font-bold text-lg">{division.name}</h3>
                                        <div className="flex gap-3 mt-2">
                                            <Badge variant="outline" className="bg-green-100">In: {division.in}</Badge>
                                            <Badge variant="outline" className="bg-amber-100">Out: {division.out}</Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Sample Code Display */}
            <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Example Usage</h3>
                <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
                    <code>{`import { useDivisionData } from '@/hooks';

function DivisionsList() {
  // Simple hook usage - connects to "Division" room
  const { data, isLoading, error, isConnected } = useDivisionData();

  if (isLoading) return <p>Loading divisions...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h2>Divisions {isConnected ? '(Connected)' : '(Disconnected)'}</h2>
      <ul>
        {data.map(division => (
          <li key={division.name}>
            {division.name}: {division.in} in, {division.out} out
          </li>
        ))}
      </ul>
    </div>
  );
}`}</code>
                </pre>
            </div>
        </>
    );
}

// Department Tab Content
function DepartmentExample() {
    // For the example, we'll use a hardcoded division ID instead of URL params
    const { data, isLoading, error, isConnected, joinRoom } = useDepartmentData({
        useSearchFrom: '/components'
    });
    const [selectedDivision, setSelectedDivision] = useState("Division1");

    // Demo divisions to select from
    const demoDivisions = ["Division1", "Division2", "Division3"];

    // Handle division selection
    const handleDivisionChange = (division: string) => {
        setSelectedDivision(division);
        joinRoom(division);
    };

    return (
        <>
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        Department Data
                        <ConnectionStatus isConnected={isConnected} />
                    </CardTitle>
                    <CardDescription>
                        Data from socket room based on selected division (demo)
                    </CardDescription>
                    <div className="flex gap-2 mt-4">
                        {demoDivisions.map(div => (
                            <Button
                                key={div}
                                variant={selectedDivision === div ? "default" : "outline"}
                                onClick={() => handleDivisionChange(div)}
                                className="text-sm px-4 py-2"
                            >
                                {div}
                            </Button>
                        ))}
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Spinner />
                        </div>
                    ) : error ? (
                        <div className="p-4 bg-red-100 text-red-800 rounded-md">
                            Error: {error}
                        </div>
                    ) : data.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">
                            No departments found for {selectedDivision}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {data.map((department, idx) => (
                                <Card key={department.name || idx} className="bg-muted/40">
                                    <CardContent className="pt-6">
                                        <h3 className="font-bold text-lg">{department.name}</h3>
                                        <div className="flex gap-3 mt-2">
                                            <Badge variant="outline" className="bg-green-100">In: {department.in}</Badge>
                                            <Badge variant="outline" className="bg-amber-100">Out: {department.out}</Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Sample Code Display */}
            <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Example Usage</h3>
                <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
                    <code>{`import { useDepartmentData } from '@/hooks';

function DepartmentsList() {
  // The hook will automatically get divisionId from URL params
  const { data, isLoading, error, joinRoom } = useDepartmentData();

  // Or you can specify a custom route for the search params
  // const { data, isLoading, error } = useDepartmentData({
  //   useSearchFrom: '/_authenticated/attendance-monitoring/dashboard/divisions'
  // });

  // You can manually join a room if needed
  const switchToDivision = (divisionId) => {
    joinRoom(divisionId);
  };

  return (
    <div>
      <h2>Departments for Division</h2>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {data.map(dept => (
            <li key={dept.name}>
              {dept.name}: {dept.in} in, {dept.out} out
            </li>
          ))}
        </ul>
      )}
      <button onClick={() => switchToDivision('Division1')}>
        Switch to Division 1
      </button>
    </div>
  );
}`}</code>
                </pre>
            </div>
        </>
    );
}

// Section Tab Content
function SectionExample() {
    // For the example, we'll use a hardcoded department ID instead of URL params
    const { data, isLoading, error, isConnected, joinRoom } = useSectionData({
        useSearchFrom: '/components'
    });
    const [selectedDepartment, setSelectedDepartment] = useState("Department1");

    // Demo departments to select from
    const demoDepartments = ["Department1", "Department2", "Department3"];

    // Handle department selection
    const handleDepartmentChange = (department: string) => {
        setSelectedDepartment(department);
        joinRoom(department);
    };

    return (
        <>
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        Section Data
                        <ConnectionStatus isConnected={isConnected} />
                    </CardTitle>
                    <CardDescription>
                        Data from socket room based on selected department (demo)
                    </CardDescription>
                    <div className="flex gap-2 mt-4">
                        {demoDepartments.map(dept => (
                            <Button
                                key={dept}
                                variant={selectedDepartment === dept ? "default" : "outline"}
                                onClick={() => handleDepartmentChange(dept)}
                                className="text-sm px-4 py-2"
                            >
                                {dept}
                            </Button>
                        ))}
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Spinner />
                        </div>
                    ) : error ? (
                        <div className="p-4 bg-red-100 text-red-800 rounded-md">
                            Error: {error}
                        </div>
                    ) : data.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">
                            No sections found for {selectedDepartment}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {data.map((section, idx) => (
                                <Card key={section.name || idx} className="bg-muted/40">
                                    <CardContent className="pt-6">
                                        <h3 className="font-bold text-lg">{section.name}</h3>
                                        <div className="flex gap-3 mt-2">
                                            <Badge variant="outline" className="bg-green-100">In: {section.in}</Badge>
                                            <Badge variant="outline" className="bg-amber-100">Out: {section.out}</Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Sample Code Display */}
            <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Example Usage</h3>
                <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
                    <code>{`import { useSectionData } from '@/hooks';

function SectionsList() {
  // The hook will automatically get departmentId from URL params
  // using the default path '/_authenticated/attendance-monitoring/dashboard/departments'
  const { 
    data, 
    isLoading, 
    error, 
    isConnected, 
    joinRoom 
  } = useSectionData();

  return (
    <div>
      <h2>
        Sections {isConnected ? '(Connected)' : '(Disconnected)'}
      </h2>
      {isLoading ? (
        <p>Loading sections...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>In</th>
              <th>Out</th>
            </tr>
          </thead>
          <tbody>
            {data.map(section => (
              <tr key={section.name}>
                <td>{section.name}</td>
                <td>{section.in}</td>
                <td>{section.out}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}`}</code>
                </pre>
            </div>
        </>
    );
}

// Employee Tab Content
function EmployeeExample() {
    // For the example, we'll use hardcoded IDs instead of URL params
    const { data, isLoading, error, isConnected, joinRoom } = useEmployeeData({
        useSearchFrom: '/components'
    });
    const [roomId, setRoomId] = useState("Div1Dept1Sec1");

    // Demo room combinations
    const demoRooms = [
        { id: "Div1Dept1Sec1", label: "Division 1 - Dept 1 - Section 1" },
        { id: "Div2Dept2Sec2", label: "Division 2 - Dept 2 - Section 2" }
    ];

    // Handle room selection
    const handleRoomChange = (room: string) => {
        setRoomId(room);
        joinRoom(room);
    };

    return (
        <>
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        Live Employee Data
                        <ConnectionStatus isConnected={isConnected} />
                    </CardTitle>
                    <CardDescription>
                        Data from socket room with live employee statuses (demo)
                    </CardDescription>
                    <div className="flex gap-2 mt-4 flex-wrap">
                        {demoRooms.map(room => (
                            <Button
                                key={room.id}
                                variant={roomId === room.id ? "default" : "outline"}
                                onClick={() => handleRoomChange(room.id)}
                                className="text-sm px-4 py-2"
                            >
                                {room.label}
                            </Button>
                        ))}
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Spinner />
                        </div>
                    ) : error ? (
                        <div className="p-4 bg-red-100 text-red-800 rounded-md">
                            Error: {error}
                        </div>
                    ) : data.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">
                            No employee data for the selected section
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-muted">
                                        <th className="p-2 text-left">Employee ID</th>
                                        <th className="p-2 text-left">Name</th>
                                        <th className="p-2 text-left">Division</th>
                                        <th className="p-2 text-left">Department</th>
                                        <th className="p-2 text-left">Section</th>
                                        <th className="p-2 text-left">Tag ID</th>
                                        <th className="p-2 text-left">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((employee, idx) => (
                                        <tr key={employee.employee_id || idx} className="border-b hover:bg-muted/50">
                                            <td className="p-2">{employee.employee_id}</td>
                                            <td className="p-2">{employee.full_name}</td>
                                            <td className="p-2">{employee.division}</td>
                                            <td className="p-2">{employee.department}</td>
                                            <td className="p-2">{employee.section}</td>
                                            <td className="p-2">{employee.tag_id}</td>
                                            <td className="p-2">
                                                {parseInt(employee.in) > 0 ? (
                                                    <Badge variant="outline" className="bg-green-100">In</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="bg-amber-100">Out</Badge>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Sample Code Display */}
            <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Example Usage</h3>
                <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
                    <code>{`import { useEmployeeData } from '@/hooks';

function EmployeeList() {
  // This hook combines divisionId, departmentId, and sectionId from URL params
  const { 
    data, 
    isLoading, 
    error, 
    isConnected 
  } = useEmployeeData();

  return (
    <div>
      <h2>Live Employee Data</h2>
      {isLoading ? (
        <p>Loading employee data...</p>
      ) : data.length === 0 ? (
        <p>No employees found</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Division</th>
              <th>Department</th>
              <th>Section</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map(employee => (
              <tr key={employee.employee_id}>
                <td>{employee.employee_id}</td>
                <td>{employee.full_name}</td>
                <td>{employee.division}</td>
                <td>{employee.department}</td>
                <td>{employee.section}</td>
                <td>
                  {parseInt(employee.in) > 0 ? 'In' : 'Out'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}`}</code>
                </pre>
            </div>
        </>
    );
}

// Helper component for socket connection status
function ConnectionStatus({ isConnected }: { isConnected: boolean }) {
    return isConnected ? (
        <Badge variant="outline" className="bg-green-100">Connected</Badge>
    ) : (
        <Badge variant="outline" className="bg-red-100">Disconnected</Badge>
    );
}
