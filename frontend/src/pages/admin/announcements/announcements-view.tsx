"use client";

import { useState, useEffect } from "react";
import { orpc } from "@/lib/oprc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IconPlus, IconSearch, IconEdit, IconTrash, IconEye, IconEyeOff } from "@tabler/icons-react";
import { EnhancedDataTable } from "@/components/enhanced-data-table";
import { TimeDisplay } from "@/components/ui/time-display";

interface Announcement {
  id: string;
  title: string;
  message: string;
  targetType: 'all' | 'user' | 'driver';
  isActive: boolean;
  createdAt: string;
  expiresAt?: string | null;
  creator?: { id: string; name: string };
}

export function AnnouncementsView() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Form state
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetType, setTargetType] = useState<'all' | 'user' | 'driver'>('all');
  const [expiresAt, setExpiresAt] = useState("");

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await orpc.announcement.getAll({ includeInactive: true });
      setAnnouncements(data.announcements.map((a: any) => ({
        id: a.announcement.id,
        title: a.announcement.title,
        message: a.announcement.message,
        targetType: a.announcement.targetType,
        isActive: a.announcement.isActive,
        createdAt: a.announcement.createdAt,
        expiresAt: a.announcement.expiresAt,
        creator: a.creator,
      })));
    } catch (error) {
      toast.error('Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSubmit = async () => {
    if (!title || !message) {
      toast.error('Title and message are required');
      return;
    }

    try {
      if (editingAnnouncement) {
        await orpc.announcement.update({
          id: editingAnnouncement.id,
          title,
          message,
          targetType,
          expiresAt: expiresAt || null,
        });
        toast.success('Announcement updated');
      } else {
        await orpc.announcement.create({
          title,
          message,
          targetType,
          expiresAt: expiresAt || undefined,
        });
        toast.success('Announcement created');
      }
      fetchAnnouncements();
      handleCloseForm();
    } catch (error) {
      toast.error('Failed to save announcement');
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await orpc.announcement.toggleActive({ id });
      toast.success('Status updated');
      fetchAnnouncements();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      await orpc.announcement.delete({ id: deletingId });
      toast.success('Announcement deleted');
      fetchAnnouncements();
      setIsDeleteOpen(false);
      setDeletingId(null);
    } catch (error) {
      toast.error('Failed to delete announcement');
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setTitle(announcement.title);
    setMessage(announcement.message);
    setTargetType(announcement.targetType);
    setExpiresAt(announcement.expiresAt ? new Date(announcement.expiresAt).toISOString().split('T')[0] : '');
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingAnnouncement(null);
    setTitle('');
    setMessage('');
    setTargetType('all');
    setExpiresAt('');
  };

  const openDeleteDialog = (id: string) => {
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  const filteredAnnouncements = announcements.filter(a =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      accessorKey: "title",
      header: "Title",
      cell: (value: string) => <span className="font-medium">{value}</span>,
    },
    {
      accessorKey: "targetType",
      header: "Target",
      cell: (value: string) => {
        const labels: Record<string, string> = {
          all: 'All Users',
          user: 'Customers',
          driver: 'Drivers',
        };
        return <Badge variant="outline">{labels[value] || value}</Badge>;
      },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: (value: boolean) => (
        <Badge variant={value ? "default" : "secondary"}>
          {value ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: (_value: any, row: Announcement) => (
        <TimeDisplay createdAt={row.createdAt} expiresAt={row.expiresAt} />
      ),
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: (_value: any, row: Announcement) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEdit(row)}
            title="Edit"
          >
            <IconEdit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleToggleActive(row.id)}
            title={row.isActive ? "Deactivate" : "Activate"}
          >
            {row.isActive ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => openDeleteDialog(row.id)}
            title="Delete"
          >
            <IconTrash className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Announcements</h2>
        <Button onClick={() => setIsFormOpen(true)}>
          <IconPlus className="h-4 w-4 mr-2" />
          Create Announcement
        </Button>
      </div>

      <div className="relative">
        <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search announcements..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>

      <EnhancedDataTable
        columns={columns}
        data={filteredAnnouncements}
        onAdd={() => setIsFormOpen(true)}
        loading={loading}
        pagination
        pageSize={10}
      />

      {/* Form Sheet */}
      <Sheet open={isFormOpen} onOpenChange={handleCloseForm}>
        <SheetContent className="sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>{editingAnnouncement ? 'Edit' : 'Create'} Announcement</SheetTitle>
            <SheetDescription>
              {editingAnnouncement ? 'Update the announcement details' : 'Create a new announcement for users'}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4 px-6 overflow-y-auto max-h-[calc(100vh-200px)]">
            <div>
              <label className="text-sm font-medium block mb-2">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Announcement title"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Message</label>
              <RichTextEditor
                value={message}
                onChange={setMessage}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use the toolbar to format your message with bold, italic, headings, and lists
              </p>
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Target Audience</label>
              <Select value={targetType} onValueChange={(v: any) => setTargetType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="user">Customers</SelectItem>
                  <SelectItem value="driver">Drivers</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Expires At (Optional)</label>
              <Input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Leave empty for permanent announcement
              </p>
            </div>
            <div className="flex gap-2 pt-4 pb-6">
              <Button onClick={handleSubmit} className="flex-1">
                {editingAnnouncement ? 'Update' : 'Create'}
              </Button>
              <Button onClick={handleCloseForm} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Announcement</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this announcement? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
