import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"

export interface CustomerRow {
  id: string
  name: string
  phoneNumber: string | null
  userCycleCount: number
  userLifetimeEarnings: number
  currentRate: number
  createdAt: Date
}

function getCycleBadge(count: number) {
  if (count === 0) return { label: "Not Active", variant: "secondary" as const }
  if (count === 1) return { label: "Cycle 1 (35%)", variant: "default" as const }
  if (count === 2) return { label: "Cycle 2 (25%)", variant: "default" as const }
  return { label: `Cycle ${count} (15%)`, variant: "outline" as const }
}

export const customerColumns: ColumnDef<CustomerRow>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "phoneNumber",
    header: "Phone Number",
    cell: ({ row }) => {
      const phone = row.getValue("phoneNumber") as string | null
      return <div className="text-muted-foreground">{phone || "—"}</div>
    },
  },
  {
    accessorKey: "userCycleCount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Stage
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const count = row.getValue("userCycleCount") as number
      const { label, variant } = getCycleBadge(count)
      return <Badge variant={variant}>{label}</Badge>
    },
  },
  {
    accessorKey: "userLifetimeEarnings",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Earned (ETB)
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const amount = row.getValue("userLifetimeEarnings") as number
      return <div className="text-right font-medium">{amount.toLocaleString()}</div>
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Registered
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date
      return (
        <div className="text-right text-muted-foreground">
          {new Date(date).toLocaleDateString()}
        </div>
      )
    },
  },
]
