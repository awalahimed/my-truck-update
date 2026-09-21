import { Button } from "@/components/ui/button";
import { IconDots, IconEye } from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
}

interface UserColumnProps {
  onEdit: (data: UserFormData) => void;
  onDelete: (id: string) => void;
  onBanToggle: (data: UserFormData) => void;
  onView: (data: UserFormData) => void;
  onRestore: (data: UserFormData) => void;
}

export const createUserColumns = ({ onEdit, onDelete, onBanToggle, onView, onRestore }: UserColumnProps) => [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "phoneNumber", header: "Phone Number" },
  {
    accessorKey: "role",
    header: "Role",
    cell: (value: string) => (
      <span className="capitalize font-medium">{value}</span>
    )
  },
  {
    accessorKey: "accountStatus",
    header: "Account Status",
    cell: (_value: any, row: UserFormData) => {
      const status = row.accountStatus || "pending";
      const isBanned = row.banned;
      const isActive = status === "active" && !isBanned;
      const isPending = status === "pending";
      const isFlagged = status === "flagged";
      const isSuspended = status === "suspended";
      const isDeleted = status === "deleted";
      const isRejected = status === "rejected";

      let bgClass = "bg-green-100 text-green-700";
      let label = "Active";

      if (isDeleted) {
        bgClass = "bg-gray-400 text-white";
        label = "Deleted";
      } else if (isRejected) {
        bgClass = "bg-red-100 text-red-700";
        label = "Rejected";
      } else if (isBanned) {
        bgClass = "bg-red-100 text-red-700";
        label = "Banned";
      } else if (isPending) {
        bgClass = "bg-yellow-100 text-yellow-700";
        label = "Pending";
      } else if (isFlagged) {
        bgClass = "bg-orange-100 text-orange-700";
        label = "Flagged";
      } else if (isSuspended) {
        bgClass = "bg-gray-100 text-gray-700";
        label = "Suspended";
      }

      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgClass}`}>
          {label}
        </span>
      );
    }
  },
  {
    accessorKey: "phoneNumberVerified",
    header: "Phone Verified",
    cell: (value: boolean) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        value
          ? "bg-green-100 text-green-700"
          : "bg-yellow-100 text-yellow-700"
      }`}>
        {value ? "Verified" : "Pending"}
      </span>
    )
  },
  {
    accessorKey: "banned",
    header: "Banned",
    cell: (value: boolean) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        value
          ? "bg-red-100 text-red-700"
          : "bg-gray-100 text-gray-700"
      }`}>
        {value ? "Yes" : "No"}
      </span>
    )
  },
  {
    accessorKey: "actions",
    header: "Actions",
    cell: (value: any, row: UserFormData) => {
      const isDeleted = row.accountStatus === 'deleted';
      
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <IconDots className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>User Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onView(row)} className="cursor-pointer">
              <span>View</span>
            </DropdownMenuItem>
            {!isDeleted && (
              <>
                <DropdownMenuItem onClick={() => onBanToggle(row)} className="cursor-pointer">
                  <span>{row.banned ? "Unban User" : "Ban User"}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(row.id!)}
                  className="text-red-600 focus:text-red-600 cursor-pointer"
                >
                  <span>Delete User</span>
                </DropdownMenuItem>
              </>
            )}
            {isDeleted && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onRestore(row)}
                  className="text-green-600 focus:text-green-600 cursor-pointer"
                >
                  <span>Restore User</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  },
];