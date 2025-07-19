import { accessClassMap } from "@/components/dialogs/accessClassMap";
import AddUserDialog from "@/components/dialogs/AddUserDialog";
import UserInfoDialog from "@/components/dialogs/UserInfoDialog";

import CardSection from "@/components/layouts/CardSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { DynamicTable, type Column } from "@/components/ui/dynamic-table";

import { Switch } from "@/components/ui/switch";

import { useGetUserbyId } from "@/hooks/query/useGetUserById";

import { useGetUsers } from "@/hooks/query/useGetUsers";

import { cn } from "@/lib/utils";
import { objToParams } from "@/utils/objToParams";

import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";

import { useEffect, useState } from "react";

export const Route = createFileRoute(
  "/_authenticated/user-management/list-of-users"
)({
  component: RouteComponent,
});

const tableId = "employee-table";

export interface UserData {
  ID?: string;
  Name?: string;
  Access?: string[];
  IsActive?: boolean;
  Role?: string;
  Email?: string;
  Password?: string;
}

// Column definitions
const columns: Column[] = [
  { key: "ID", label: "ID" },
  { key: "Name", label: "Name" },
  { key: "Access", label: "Access" },
  { key: "IsActive", label: "Active" },
];

function RouteComponent() {
  const search = useSearch({
    from: "/_authenticated/user-management/list-of-users",
  });
  const navigate = useNavigate({
    from: "/user-management/list-of-users",
  });
  const [data, setData] = useState<UserData[]>([]);
  const [totalPages, setTotalPages] = useState(10);
  const [totalItems, setTotalItems] = useState(10);

  const [isOpen, setIsOpen] = useState(false);
  const [isOpenAddUser, setIsOpenAddUser] = useState(false);

  const currentPage = parseInt(search.page || "1");
  const pageSize = parseInt(search.limit || "10");

  //user data
  const [employeeID, setEmployeeID] = useState("");
  const { data: user, isFetching: isLoadingUser } = useGetUserbyId(employeeID);

  //userList
  const {
    data: userList,
    isLoading: isuserListLoading,
    refetch,
  } = useGetUsers(objToParams(search) as any);

  useEffect(() => {
    if (Array.isArray(userList?.data)) {
      const data = userList.data.map((item: UserData) => ({
        ...item,
        Access: item.Access?.map((access) => (
          <Badge
            key={access + item.ID}
            className={cn(
              "bg-slate-400 text-white  rounded-full ml-1",
              accessClassMap[access as keyof typeof accessClassMap] || "",
              `hover:${accessClassMap[access as keyof typeof accessClassMap] || ""} hover:${accessClassMap[access as keyof typeof accessClassMap] || ""}`
            )}
          >
            {access}
          </Badge>
        )),
        IsActive: (
          <Switch
            checked={item.IsActive}
            className={cn(
              "data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
            )}
          />
        ),
      }));
      setData(data);
      setTotalPages(userList.pagination.totalPages ?? 10);
      setTotalItems(userList.pagination.totalItems ?? 10);
    }
  }, [userList]);

  useEffect(() => {
    refetch();
  }, [search]);

  // Handlers for table interactions
  const handlePageChange = (page: number) => {
    const parsedPage = parseInt(String(page));
    if (!isNaN(parsedPage) && parsedPage > 0) {
      navigate({
        search: (prev) => ({
          ...prev,
          page: String(parsedPage),
        }),
        replace: true,
      });
    }
  };

  const handlePageSizeChange = (size: number) => {
    const parsedSize = parseInt(String(size));
    if (!isNaN(parsedSize) && parsedSize > 0) {
      navigate({
        search: (prev) => ({
          ...prev,
          limit: String(parsedSize),
          page: "1",
        }),
        replace: true,
      });
    }
  };

  const handleSearch = (searchTerm: string) => {
    console.log("handleSearch", searchTerm);
    navigate({
      search: (prev) => ({
        ...prev,
        search: searchTerm,
      }),
      replace: true,
    });
  };

  const handleFilter = (key: string, value: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        [key]: value || undefined,
        page: "1",
      }),
      replace: true,
    });
  };

  return (
    <>
      <CardSection>
        <div className="relative">
          <Button
            className="absolute right-0 top-2"
            onClick={() => setIsOpenAddUser(true)}
          >
            Add User
          </Button>
          <DynamicTable
            columns={columns}
            data={data}
            pagination={{
              currentPage,
              pageSize,
              totalPages,
              totalItems,
            }}
            routeSearch={search}
            onSearch={handleSearch}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onFilter={handleFilter}
            isLoading={isuserListLoading}
            tableId={tableId}
            onRowClick={(row) => {
              setEmployeeID(row.EmployeeID);
              setIsOpen(true);
            }}
          />
        </div>
      </CardSection>
      {isOpen && (
        <UserInfoDialog
          open={isOpen}
          onOpenChange={setIsOpen}
          user={user}
          isLoading={isLoadingUser}
        />
      )}
      {isOpenAddUser && (
        <AddUserDialog open={isOpenAddUser} onOpenChange={setIsOpenAddUser} />
      )}
    </>
  );
}
