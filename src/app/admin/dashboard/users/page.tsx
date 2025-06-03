// File: src/app/admin/dashboard/users/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link'; // Untuk tombol kembali ke dashboard utama

// Definisikan tipe User (sesuaikan dengan data yang kamu fetch)
interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: string | null;
  createdAt: string; // Atau Date, lalu format
  // Tambahkan field lain jika ada
}

const ManageUsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/admin/users'); // Panggil API route kita
        if (!response.ok) {
          throw new Error(`Failed to fetch users: ${response.statusText}`);
        }
        const data = await response.json();
        setUsers(data);
      } catch (err: any) {
        setError(err.message || 'An error occurred');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <p>Loading users...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Manage Users</h1>
        <Link href="/admin/dashboard" style={{ padding: '8px 12px', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
          Back to Dashboard
        </Link>
      </div>

      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #ddd', backgroundColor: '#f9f9f9' }}>
              <th style={{ padding: '8px', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Role</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Joined</th>
              {/* Tambahkan header kolom lain jika perlu */}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '8px' }}>{user.name || 'N/A'}</td>
                <td style={{ padding: '8px' }}>{user.email || 'N/A'}</td>
                <td style={{ padding: '8px' }}>{user.role || 'user'}</td>
                <td style={{ padding: '8px' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                {/* Tambahkan data kolom lain jika perlu */}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ManageUsersPage;