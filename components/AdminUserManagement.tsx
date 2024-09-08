'use client'

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"

export function AdminUserManagement() {
  return (
    <Table>
      <TableCaption>A list of users on the platform.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">User ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium">001</TableCell>
          <TableCell>John Doe</TableCell>
          <TableCell>john@example.com</TableCell>
          <TableCell className="text-right">
            <Button variant="outline" size="sm">Edit</Button>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}