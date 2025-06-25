import { AutoComplete } from "@/components/BasicInformationForm";
import { CustomAutoComplete } from "@/components/BasicInformationForm/CustomAutoComplete";
import CardSection from "@/components/layouts/CardSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DynamicTable,
  type Column,
  type Filter,
} from "@/components/ui/dynamic-table";
import { Input } from "@/components/ui/input";

import Spinner from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { useGetHostPerson } from "@/hooks/query/useGeHostPersonList";
import { useGetDepartmentList } from "@/hooks/query/useGetDepartmentList";

import { useGetUsers } from "@/hooks/query/useGetUsers";
import { cn } from "@/lib/utils";
import { objToParams } from "@/utils/objToParams";
import { Dialog, DialogPortal, type DialogProps } from "@radix-ui/react-dialog";

import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { Eye, EyeOff, Plus, X } from "lucide-react";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

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

const accessClassMap = {
  AMS: "bg-[#003F981C] text-[#003F98]",
  VMS: "bg-[#0DBC001C] text-[#0DBC00]",
  EVS: "bg-[#BC00031C] text-[#BC0003]",
  DMG: "bg-[#BCA6001C] text-[#BCA600]",
  UMG: "bg-[#7400BC1C] text-[#7400BC]",
};

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

  //userList
  const {
    data: userList,
    isLoading: isuserListLoading,
    refetch,
  } = useGetUsers(objToParams(search) as any);

  //deparment list
  const { data: departments } = useGetDepartmentList();

  useEffect(() => {
    if (Array.isArray(userList?.data)) {
      const data = userList.data.map((item: UserData) => ({
        ...item,
        Access: item.Access?.map((access) => (
          <Badge
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

  const filters: Filter[] = [
    {
      key: "Department",
      label: "Department",
      options: departments ?? [],
      singleSelect: true,
    },
  ];

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
            filters={filters}
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
              // setEmployeeID(row.EmployeeID);
              setIsOpen(true);
            }}
          />
        </div>
      </CardSection>
      {isOpen && <UserInfoDialog open={isOpen} onOpenChange={setIsOpen} />}
      {isOpenAddUser && (
        <AddUserDialog open={isOpenAddUser} onOpenChange={setIsOpenAddUser} />
      )}
    </>
  );
}

interface UserInfoDialogProps extends DialogProps {
  id?: string;
}

const UserInfoDialog = ({ open, onOpenChange }: UserInfoDialogProps) => {
  const isLoading = false;
  const user: UserData = {
    ID: "1",
    Name: "John Doe",
    Access: ["AMS", "VMS"],
    IsActive: true,
    Role: "Admin",
    Email: "john.doe@example.com",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-8 bg-white rounded-lg shadow-xl">
        <DialogHeader className="flex flex-row justify-between items-center mb-6">
          <DialogTitle className="text-xl font-semibold text-gray-800">
            User Information
          </DialogTitle>
        </DialogHeader>
        {isLoading && <Spinner />}
        {!isLoading && (
          <div>
            <p>{`ID: ${user?.ID}`}</p>
            <h2 className="text-2xl font-bold text-primary mt-1">
              {user?.Name}
            </h2>
            <p>{`Email: ${user?.Email}`}</p>

            <div className="border my-8" />

            <h2 className="text-lg font-bold text-primary mt-1">Status:</h2>
            <p className="text-sm">Enable or Disable User Access</p>
            <div className="mt-2 flex items-center gap-4">
              <Switch
                checked={user.IsActive}
                className={cn(
                  "data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
                )}
              />
              <p>Active user</p>
            </div>

            <div className="border my-8" />
            <h2 className="text-lg font-bold text-primary mt-1">
              Assign Modules Accessible to the User
            </h2>
            <p className="text-sm">Enable or Disable User Access</p>

            <div className="mt-2">
              {Object.keys(accessClassMap).map((access) => {
                const hasAccess = user.Access?.includes(access);
                return (
                  <Badge
                    className={cn(
                      "bg-slate-400 text-white  rounded-full ml-1",
                      hasAccess
                        ? `hover:${accessClassMap[access as keyof typeof accessClassMap] || ""} hover:${accessClassMap[access as keyof typeof accessClassMap] || ""} ${
                            accessClassMap[
                              access as keyof typeof accessClassMap
                            ]
                          }`
                        : null
                    )}
                  >
                    {access}{" "}
                    {hasAccess ? (
                      <X size={12} onClick={() => alert(access)} />
                    ) : (
                      <Plus size={12} onClick={() => alert(access)} />
                    )}
                  </Badge>
                );
              })}
            </div>

            <div className="border my-8" />

            <div className="flex gap-2 justify-end">
              <Button>Change Password</Button>
              <Button disabled>Save Changes</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

const AddUserDialog = ({ open, onOpenChange }: DialogProps) => {
  const form = useForm<UserData>();

  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState, setValue, watch, control } = form;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
        {open && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
        )}

        {!showPassword && (
          <DialogContent className="w-auto p-8 bg-white rounded-lg shadow-xl">
            <DialogHeader className="flex flex-row justify-between items-center mb-6">
              <DialogTitle className="text-xl font-semibold text-gray-800">
                Add User
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-8">
              <div className="w-full  flex flex-col">
                <h2 className="text-lg font-bold text-primary mt-1">
                  User Info
                </h2>
                <CustomAutoComplete
                  required={false}
                  withID
                  label="Employee"
                  name={"Name"}
                  id="employee"
                  setValue={setValue}
                  watch={watch}
                  register={register}
                  errors={formState?.errors}
                  readOnly={false}
                  queryHook={useGetHostPerson}
                />
              </div>
              <div className="w-full  flex flex-col">
                <h2 className="text-lg font-bold text-primary mt-1">Status:</h2>
                <p className="text-sm">Enable or Disable User Access</p>

                <div className="mt-auto flex items-center gap-4">
                  <Controller
                    name="IsActive"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
                      />
                    )}
                  />
                  <p>Active user</p>
                </div>
              </div>
            </div>

            <div className="border my-8" />

            <div className="grid grid-cols-2 gap-8">
              <div className="w-full  flex flex-col">
                <h2 className="text-lg font-bold text-primary mt-1">
                  User Role
                </h2>
                <AutoComplete
                  required={false}
                  label="Roles"
                  name={"Roles"}
                  id="roles"
                  setValue={setValue}
                  watch={watch}
                  register={register}
                  errors={formState?.errors}
                  list={[{ label: "sample", value: "sampple" }]}
                />
              </div>
              <div className="w-full  flex flex-col">
                <h2 className="text-lg font-bold text-primary mt-1">
                  Access to Modules:
                </h2>
                <p className="text-sm">Assign Modules Accessible to the User</p>

                <Controller
                  name="Access"
                  control={control}
                  render={({ field }) => (
                    <ModuleSelection
                      value={field?.value ?? []}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
            </div>

            <div className="border my-8" />

            <div className="flex justify-end gap-2">
              <Button onClick={() => setShowPassword(true)}>
                Set Password
              </Button>
              <Button onClick={handleSubmit((data) => console.log(data))}>
                Save User
              </Button>
            </div>
          </DialogContent>
        )}
        {showPassword && (
          <PasswordDialogContent
            onSetPassword={(data) => {
              setValue("Password", data?.Password);
              setShowPassword(false);
            }}
          />
        )}
      </Dialog>
    </>
  );
};

const PasswordDialogContent = ({
  onSetPassword,
}: {
  onSetPassword: (data: any) => void;
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, handleSubmit, formState, watch } = useForm();

  const password = watch("Password");
  return (
    <DialogContent>
      <DialogHeader className="flex flex-row justify-between items-center mb-6">
        <DialogTitle className="text-xl font-semibold text-gray-800">
          Password
        </DialogTitle>
      </DialogHeader>
      <div>
        <div className="relative">
          <Input
            {...register("Password", { required: "Password is required" })}
            type={showPassword ? "text" : "password"}
            id="password"
            placeholder="Password"
            className="h-[44px]"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-500" />
            ) : (
              <Eye className="h-4 w-4 text-gray-500" />
            )}
          </Button>
        </div>
      </div>
      <div className="relative">
        <Input
          {...register("ConfirmPassword", {
            validate: (value) => value === password || "Passwords do not match",
          })}
          type={showConfirmPassword ? "text" : "password"}
          id="password"
          placeholder="Confirm Password"
          className="h-[44px]"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          {showConfirmPassword ? (
            <EyeOff className="h-4 w-4 text-gray-500" />
          ) : (
            <Eye className="h-4 w-4 text-gray-500" />
          )}
        </Button>
      </div>
      {formState.errors.Password && (
        <p className="text-xs text-red-600">
          {String(formState?.errors.Password.message || "")}
        </p>
      )}

      {formState.errors.ConfirmPassword && (
        <p className="text-xs text-red-600">
          {String(formState?.errors.ConfirmPassword.message || "")}
        </p>
      )}
      <Button onClick={handleSubmit((data) => onSetPassword(data))}>
        Set Password
      </Button>
    </DialogContent>
  );
};

type ModuleSelectionProps = {
  value: string[];
  onChange: (value: string[]) => void;
};

const ModuleSelection = ({ value, onChange }: ModuleSelectionProps) => {
  const toggleAccess = (access: string) => {
    if (value.includes(access)) {
      onChange(value.filter((item) => item !== access)); // remove
    } else {
      onChange([...value, access]); // add
    }
  };

  return (
    <div className="mt-2 gap-1 flex flex-wrap">
      {Object.keys(accessClassMap).map((access) => {
        const hasAccess = value.includes(access);
        return (
          <Badge
            key={access}
            className={cn(
              "bg-slate-400 text-white rounded-full ml-1 cursor-pointer",
              hasAccess &&
                accessClassMap[access as keyof typeof accessClassMap],
              hasAccess &&
                `hover:${accessClassMap[access as keyof typeof accessClassMap]}`
            )}
          >
            {access}
            {hasAccess ? (
              <X
                size={12}
                className="ml-1"
                onClick={() => toggleAccess(access)}
              />
            ) : (
              <Plus
                size={12}
                className="ml-1"
                onClick={() => toggleAccess(access)}
              />
            )}
          </Badge>
        );
      })}
    </div>
  );
};
