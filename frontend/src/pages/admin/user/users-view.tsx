"use client";

import { useState, useEffect } from "react";
import { createUserColumns } from "./user-columns";
import { EnhancedDataTable } from "@/components/enhanced-data-table";
import { authClient } from "@/hooks/auth/auth-client";
import { orpc } from "@/lib/oprc";
import { URL } from "@/config";
import { toast } from "sonner";
import { z } from "zod";

const userFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  phoneNumber: z.string().min(1, "Phone number is required").regex(/^[\+]?[1-9][\d]{0,15}$/, "Invalid phone number format"),
  banned: z.boolean().default(false)
});

interface UserFormData {
  id?: string;
  name: string;
  phoneNumber: string;
  role: string;
  accountStatus?: string;
  banned: boolean;
  emailVerified?: boolean;
  phoneNumberVerified?: boolean;
  driverLicense?: string;
  createdAt?: string;
  updatedAt?: string;
  image?: string;
  email?: string;
  vehicleImage?: string;
  licenseFrontImage?: string;
  licenseBackImage?: string;
  password?: string;
  confirmPassword?: string;
  townName?: string;
  cityName?: string;
  region?: string;
  assignedCityIds?: string[];
}
import { UserForm } from "./user-form";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IconPlus, IconSearch, IconFilter } from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function UsersView() {
  const [userData, setUserData] = useState<UserFormData[]>([]);
  const [driverData, setDriverData] = useState<UserFormData[]>([]);
  const [managerData, setManagerData] = useState<UserFormData[]>([]);
  const [editingUser, setEditingUser] = useState<UserFormData | null>(null);
  const [viewingUser, setViewingUser] = useState<UserFormData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("users");

  const fetchUsers = async (search?: string, _status?: string, _role?: string) => {
    try {
      setLoading(true);
      const query: any = {};

      // Fetch all users - we'll filter client-side to ensure
      // both active and banned users are shown

      if (search) {
        query.searchValue = search;
        query.searchField = "name";
        query.searchOperator = "contains";
      }

      const response = await authClient.admin.listUsers({ query });
      if (response.data) {
        const users = response.data.users.map((user: any) => ({
          id: user.id,
          name: user.name || '',
          phoneNumber: user.phoneNumber || '',
          email: user.email || '',
          role: user.role || 'user',
          accountStatus: user.accountStatus,
          banned: user.banned || false,
          emailVerified: user.emailVerified || false,
          phoneNumberVerified: user.phoneNumberVerified || false,
          driverLicense: user.driverLicense || '',
          createdAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '',
          updatedAt: user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : '',
          image: user.image || '',
        }));

        // Define role arrays
        const userRoles = ['unknown', 'user', 'agent_delala', 'call_center'];

        // Filter client-side for status and role
        // Show both active and banned users by default
        const filteredUsers = users.filter((u: UserFormData) => {
          // Filter by role
          const matchesRole = userRoles.includes(u.role);
          // Status filter (default: show all)
          const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'banned' && u.banned) ||
            (statusFilter === 'active' && !u.banned);
          return matchesRole && matchesStatus;
        });

        const filteredDrivers = users.filter((u: UserFormData) => {
          // Filter by role (driver only)
          const matchesRole = u.role === 'driver';
          // Status filter (default: show all)
          const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'banned' && u.banned) ||
            (statusFilter === 'active' && !u.banned);
          return matchesRole && matchesStatus;
        });

        const filteredManagers = users.filter((u: UserFormData) => {
          const matchesRole = u.role === 'town_manager';
          const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'banned' && u.banned) ||
            (statusFilter === 'active' && !u.banned);
          return matchesRole && matchesStatus;
        });

        setUserData(filteredUsers);
        setDriverData(filteredDrivers);
        setManagerData(filteredManagers);
      }
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch - fetch all users
    fetchUsers(searchTerm, statusFilter);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Fetch all users and filter client-side
      fetchUsers(searchTerm, statusFilter);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter, activeTab]);

  const handleCreate = async (newRecord: Omit<UserFormData, "id">) => {
    try {
      userFormSchema.omit({ id: true }).parse(newRecord);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.issues[0].message);
        return;
      }
    }

    try {
      if (newRecord.role === 'town_manager') {
        const response = await (orpc as any).admin.user.createManager({
          name: newRecord.name,
          phoneNumber: newRecord.phoneNumber,
          password: newRecord.password || 'defaultPassword123',
          townName: newRecord.townName || '',
          cityName: newRecord.cityName || '',
          region: newRecord.region || '',
          assignedCityIds: (newRecord as any).assignedCityIds || [],
        });

        if (response.error) {
          toast.error(response.error.message || 'Failed to create manager');
        } else {
          fetchUsers();
          setIsDialogOpen(false);
          toast.success(`Manager ${newRecord.name} created successfully`);
        }
      } else {
        const response = await authClient.admin.createUser({
          email: `${newRecord.name.toLowerCase().replace(/\s+/g, '.')}@temp.com`,
          password: newRecord.password || 'defaultPassword123',
          name: newRecord.name,
          role: newRecord.role as any,
          data: { 
            phoneNumber: newRecord.phoneNumber,
            phoneNumberVerified: true,
            emailVerified: true,
            accountStatus: 'approved',
          }
        });

        if (response.error) {
          toast.error(response.error.message || 'Failed to create user');
        } else {
          fetchUsers();
          setIsDialogOpen(false);
          toast.success(`User ${newRecord.name} created successfully`);
        }
      }
    } catch (error: any) {
      toast.error(error?.message || error?.body?.message || 'Failed to create user');
    }
  };

  const handleUpdate = async (updatedUser: UserFormData) => {
    try {
      userFormSchema.parse(updatedUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.issues[0].message);
        return;
      }
    }

    try {
      const updateRes = await authClient.admin.updateUser({
        userId: updatedUser.id!,
        data: {
          name: updatedUser.name,
          phoneNumber: updatedUser.phoneNumber
        }
      });

      if (updateRes.error) {
        toast.error(updateRes.error.message || 'Failed to update user');
        return;
      }

      const roleRes = await authClient.admin.setRole({
        userId: updatedUser.id!,
        role: updatedUser.role as any
      });

      if (roleRes.error) {
        toast.error(roleRes.error.message || 'Failed to update user role');
        return;
      }

      if (updatedUser.role === 'town_manager' && (updatedUser as any).assignedCityIds) {
        await (orpc as any).admin.user.updateManagerCities({
          userId: updatedUser.id!,
          cityIds: (updatedUser as any).assignedCityIds,
        });
      }

      await fetchUsers();
      setIsDialogOpen(false);
      setEditingUser(null);
      toast.success('User updated successfully');
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const handleDelete = async (id: string) => {
    const allData = activeTab === "users" ? userData : driverData;
    const user = allData.find(u => u.id === id);
    try {
      // Use custom soft delete instead of Better Auth removeUser
      await orpc.admin.user.softDeleteUser({ userId: id });
      fetchUsers();
      toast.success(`User ${user?.name || 'Unknown'} deleted successfully`);
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleMultiDelete = async (users: UserFormData[]) => {
    try {
      // Use custom soft delete instead of Better Auth removeUser
      await Promise.all(
        users.map(user => orpc.admin.user.softDeleteUser({ userId: user.id! }))
      );
      fetchUsers();
      toast.success(`${users.length} users deleted successfully`);
    } catch (error) {
      toast.error('Failed to delete users');
    }
  };

  const handleEdit = (record: UserFormData) => {
    setEditingUser(record);
    setIsDialogOpen(true);
  };

  const handleView = async (record: UserFormData) => {
    setViewingUser(record);
    setIsViewOpen(true);
    
    // If viewing a driver, fetch vehicle image
    if (record.role === 'driver' && record.id) {
      try {
        const data = await orpc.admin.driver.getDriverDetails({ driverId: record.id });
        if (data.driver) {
          setViewingUser({ 
            ...record,
            image: data.driver.image || record.image,
            vehicleImage: data.driver.vehicleImage || undefined,
            licenseFrontImage: data.driver.licenseFrontImage || undefined,
            licenseBackImage: data.driver.licenseBackImage || undefined,
          });
        }
      } catch (error) {
        console.error('Failed to fetch driver details:', error);
      }
    }
  };

  const handleBanToggle = async (user: UserFormData) => {
    try {
      if (user.banned) {
        const response = await authClient.admin.unbanUser({ userId: user.id! });
        if (response.error) {
          toast.error(response.error.message || 'Failed to unban user');
        } else {
          toast.success('User unbanned successfully');
          await fetchUsers();
        }
      } else {
        const response = await authClient.admin.banUser({
          userId: user.id!,
          banReason: 'Banned by admin'
        });
        if (response.error) {
          toast.error(response.error.message || 'Failed to ban user');
        } else {
          toast.success('User banned successfully');
          await fetchUsers();
        }
      }
    } catch (error) {
      toast.error('Failed to update user ban status');
    }
  };

  const openCreateDialog = () => {
    setEditingUser(null);
    setIsDialogOpen(true);
  };

  const handleRestore = async (user: UserFormData) => {
    try {
      await orpc.admin.user.restoreUser({ userId: user.id! });
      fetchUsers();
      toast.success(`User ${user.name} restored successfully`);
    } catch (error) {
      toast.error('Failed to restore user');
    }
  };

  const columns = createUserColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onBanToggle: handleBanToggle,
    onView: handleView,
    onRestore: handleRestore,
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };


  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl font-bold">User Management</h2>
        <Button onClick={openCreateDialog} className="w-full sm:w-auto">
          <IconPlus className="h-4 w-4 mr-2" />
          Create User
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-[600px]">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="managers">Managers</TabsTrigger>
          <TabsTrigger value="drivers">Drivers</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4 mt-4">
          <UserTableContent
            data={userData}
            columns={columns}
            loading={loading}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            setSearchTerm={setSearchTerm}
            setStatusFilter={setStatusFilter}
            onMultiDelete={handleMultiDelete}
            onEdit={handleEdit}
            onView={handleView}
            onBanToggle={handleBanToggle}
            openCreateDialog={openCreateDialog}
          />
        </TabsContent>

        <TabsContent value="managers" className="space-y-4 mt-4">
          <UserTableContent
            data={managerData}
            columns={columns}
            loading={loading}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            setSearchTerm={setSearchTerm}
            setStatusFilter={setStatusFilter}
            onMultiDelete={handleMultiDelete}
            onEdit={handleEdit}
            onView={handleView}
            onBanToggle={handleBanToggle}
            openCreateDialog={openCreateDialog}
          />
        </TabsContent>

        <TabsContent value="drivers" className="space-y-4 mt-4">
          <UserTableContent
            data={driverData}
            columns={columns}
            loading={loading}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            setSearchTerm={setSearchTerm}
            setStatusFilter={setStatusFilter}
            onMultiDelete={handleMultiDelete}
            onEdit={handleEdit}
            onView={handleView}
            onBanToggle={handleBanToggle}
            openCreateDialog={openCreateDialog}
          />
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Sheet open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{editingUser ? "Edit User" : "Create New User"}</SheetTitle>
            <SheetDescription>
              Please fill out the form below to {editingUser ? "update the user" : "create a new user"}.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 px-4 sm:px-6 overflow-y-auto max-h-[calc(100vh-200px)]">
            <UserForm
              onSubmit={editingUser ? handleUpdate : handleCreate}
              initialData={editingUser}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* View Side Panel */}
      <Sheet open={isViewOpen} onOpenChange={setIsViewOpen}>
        <SheetContent side="right" className="p-0 flex flex-col">
          <SheetHeader className="px-6 pt-6 pb-4">
            <SheetTitle>User Details</SheetTitle>
          </SheetHeader>
          {viewingUser && (
            <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6">
              {/* Profile Section */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 text-2xl">
                  {viewingUser.image && <AvatarImage src={`${URL.IMAGE}${viewingUser.image}`} alt={viewingUser.name} />}
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(viewingUser.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{viewingUser.name}</h3>
                  <p className="text-muted-foreground capitalize">{viewingUser.role}</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                    viewingUser.banned
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}>
                    {viewingUser.banned ? "Banned" : "Active"}
                  </span>
                </div>
              </div>

              {/* Contact Information */}
              <div className="border-t pt-6">
                <h4 className="font-medium mb-4 text-lg">Contact Information</h4>
                <dl className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <dt className="text-muted-foreground">Phone Number</dt>
                    <dd className="font-medium">{viewingUser.phoneNumber}</dd>
                  </div>
                  {viewingUser.email && viewingUser.email !== 'N/A' && (
                    <div className="flex justify-between py-2 border-b">
                      <dt className="text-muted-foreground">Email</dt>
                      <dd className="font-medium">{viewingUser.email}</dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Verification Status */}
              <div className="border-t pt-6">
                <h4 className="font-medium mb-4 text-lg">Verification Status</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border bg-muted/30">
                    <p className="text-sm text-muted-foreground">Phone Verified</p>
                    <p className={`font-medium text-lg ${
                      viewingUser.phoneNumberVerified ? "text-green-600" : "text-yellow-600"
                    }`}>
                      {viewingUser.phoneNumberVerified ? "Verified" : "Pending"}
                    </p>
                  </div>
                  {viewingUser.email && (
                    <div className="p-4 rounded-lg border bg-muted/30">
                      <p className="text-sm text-muted-foreground">Email Verified</p>
                      <p className={`font-medium text-lg ${
                        viewingUser.emailVerified ? "text-green-600" : "text-yellow-600"
                      }`}>
                        {viewingUser.emailVerified ? "Verified" : "Pending"}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Driver License - Only show for drivers */}
              {viewingUser.role === 'driver' && (viewingUser.licenseFrontImage || viewingUser.licenseBackImage || viewingUser.vehicleImage) && (
                <div className="border-t pt-6">
                  <h4 className="font-medium mb-4 text-lg">Driver Information</h4>
                  
                  {/* License Images */}
                  {(viewingUser.licenseFrontImage || viewingUser.licenseBackImage) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {viewingUser.licenseFrontImage && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">License Front</p>
                          <img
                            src={`${URL.IMAGE}/uploads/${viewingUser.licenseFrontImage}`}
                            alt="License Front"
                            className="w-full h-auto rounded-lg border"
                          />
                        </div>
                      )}
                      {viewingUser.licenseBackImage && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">License Back</p>
                          <img
                            src={`${URL.IMAGE}/uploads/${viewingUser.licenseBackImage}`}
                            alt="License Back"
                            className="w-full h-auto rounded-lg border"
                          />
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Vehicle Image */}
                  {viewingUser.vehicleImage && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Vehicle Photo</p>
                      <img
                        src={`${URL.IMAGE}/uploads/${viewingUser.vehicleImage}`}
                        alt="Vehicle"
                        className="w-full h-auto rounded-lg border"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Account Info */}
              <div className="border-t pt-6">
                <h4 className="font-medium mb-4 text-lg">Account Information</h4>
                <dl className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <dt className="text-muted-foreground">Created At</dt>
                    <dd className="font-medium">{viewingUser.createdAt || 'N/A'}</dd>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <dt className="text-muted-foreground">Updated At</dt>
                    <dd className="font-medium">{viewingUser.updatedAt || 'N/A'}</dd>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <dt className="text-muted-foreground">User ID</dt>
                    <dd className="font-medium text-xs truncate max-w-[250px]">{viewingUser.id}</dd>
                  </div>
                </dl>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// Reusable table content component
function UserTableContent({
  data,
  columns,
  loading,
  searchTerm,
  statusFilter,
  setSearchTerm,
  setStatusFilter,
  onMultiDelete,
  onEdit: _onEdit,
  onView: _onView,
  onBanToggle: _onBanToggle,
  openCreateDialog,
}: {
  data: UserFormData[];
  columns: any[];
  loading: boolean;
  searchTerm: string;
  statusFilter: string;
  setSearchTerm: (v: string) => void;
  setStatusFilter: (v: string) => void;
  onMultiDelete: (users: UserFormData[]) => void;
  onEdit: (data: UserFormData) => void;
  onView: (data: UserFormData) => void;
  onBanToggle: (data: UserFormData) => void;
  openCreateDialog: () => void;
}) {
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // Filter users client-side based on role selection
  const filteredData = data.filter((user) => {
    if (roleFilter === "all") return true;
    return user.role === roleFilter;
  });

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex gap-2">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="unknown">Unknown</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="agent_delala">Agent</SelectItem>
              <SelectItem value="town_manager">Town Manager</SelectItem>
              <SelectItem value="call_center">Call Center</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <IconFilter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="banned">Banned</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <EnhancedDataTable
        columns={columns}
        data={filteredData}
        onAdd={openCreateDialog}
        onMultiDelete={onMultiDelete}
        loading={loading}
        pagination
        pageSize={10}
      />
    </>
  );
}
