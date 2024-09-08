'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function AdminDashboard() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="channels">Channel Management</TabsTrigger>
          <TabsTrigger value="moderation">Content Moderation</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <Table>
            <TableCaption>A list of users</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>user123</TableCell>
                <TableCell>user123@example.com</TableCell>
                <TableCell>1000</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">Ban</Button>
                  <Button variant="outline" size="sm" className="ml-2">Reset Credits</Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent value="channels">
          <Table>
            <TableCaption>A list of channels</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Channel Name</TableHead>
                <TableHead>Subscribers</TableHead>
                <TableHead>Sponsorship Level</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>@TechTalks</TableCell>
                <TableCell>1.2M</TableCell>
                <TableCell>Gold</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">Edit</Button>
                  <Button variant="outline" size="sm" className="ml-2">Remove</Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent value="moderation">
          <div className="space-y-4">
            <div>
              <Label htmlFor="flagged-content">Flagged Content</Label>
              <Textarea id="flagged-content" placeholder="Flagged content appears here" className="mt-1" />
            </div>
            <div className="flex space-x-2">
              <Button variant="outline">Approve</Button>
              <Button variant="outline">Delete</Button>
              <Button variant="outline">Escalate</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}