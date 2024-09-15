// components/AdminUserTable.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  username: string;
  email: string;
  sponsoredChannels: number;
  totalSpent: number;
}

type SortColumn = keyof Pick<User, 'username' | 'email' | 'sponsoredChannels' | 'totalSpent'>;

export default function AdminUserTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<SortColumn>('username');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, sortColumn, sortDirection, page]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`/api/admin/users?search=${searchTerm}&sort=${sortColumn}&direction=${sortDirection}&page=${page}`);
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data.users);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSort = (column: SortColumn) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleViewTransactions = (userId: string) => {
    // Implement viewing user transactions
    console.log(`View transactions for user ${userId}`);
    // You might want to navigate to a new page or open a modal here
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Users</h2>
      <Input
        placeholder="Search users"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead onClick={() => handleSort('username')} className="cursor-pointer">Username</TableHead>
            <TableHead onClick={() => handleSort('email')} className="cursor-pointer">Email</TableHead>
            <TableHead onClick={() => handleSort('sponsoredChannels')} className="cursor-pointer">Sponsored Channels</TableHead>
            {/* <TableHead onClick={() => handleSort('totalSpent')} className="cursor-pointer">Total Spent</TableHead> */}
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.sponsoredChannels}</TableCell>
              {/* <TableCell>${user.totalSpent.toFixed(2)}</TableCell> */}
              <TableCell>
                <Button
                  onClick={() => handleViewTransactions(user.id)}
                  className="px-2 py-1 text-xs bg-background border-input border text-gray-800 dark:text-white hover:bg-accent"
                >
                  View Transactions
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mt-4 flex justify-between items-center">
        <Button
          onClick={() => setPage(page - 1)} disabled={page === 1}
          className="px-2 py-1 text-xs bg-background border-input border text-gray-800 dark:text-white hover:bg-accent"
        >
          Previous
        </Button>
        <span>Page {page} of {totalPages}</span>
        <Button
          onClick={() => setPage(page + 1)} disabled={page === totalPages}
          className="px-2 py-1 text-xs bg-background border-input border text-gray-800 dark:text-white hover:bg-accent"
        >
          Next
        </Button>
      </div>
    </div>
  );
}