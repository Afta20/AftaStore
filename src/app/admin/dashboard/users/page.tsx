// File: src/app/admin/dashboard/users/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiUsers, FiArrowLeft } from 'react-icons/fi'; // Contoh ikon, pastikan react-icons terinstal

// Definisikan tipe User (sesuaikan dengan data yang kamu fetch)
interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: string | null; // Misalnya: 'admin', 'user'
  createdAt: string; // Atau Date, lalu format
  image?: string | null; // Opsional: URL gambar profil pengguna
  // Tambahkan field lain jika ada, misal: status, lastLogin, dll.
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
        // const response = await fetch('/api/admin/users', {credentials: 'include'}); // Panggil API route Anda
        // if (!response.ok) {
        //   throw new Error(`Failed to fetch users: ${response.statusText}`);
        // }
        // const data = await response.json();
        // setUsers(data);

        // --- MOCK DATA PENGGANTI SEMENTARA API ---
        // Hapus atau ganti ini saat API Anda siap
        const mockUsers: User[] = [
          { id: 'user1', name: 'Afta Fauzan', email: 'afta.fauzan@example.com', role: 'admin', createdAt: new Date().toISOString(), image: 'https://placehold.co/100x100/EBF4FF/76A9FA?text=AF' },
          { id: 'user2', name: 'Budi Santoso', email: 'budi.santoso@example.com', role: 'user', createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), image: 'https://placehold.co/100x100/E6FFFA/38B2AC?text=BS' },
          { id: 'user3', name: 'Citra Lestari', email: 'citra.lestari@example.com', role: 'user', createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), image: null },
          { id: 'user4', name: 'Devi Anggraini', email: 'devi.anggraini@example.com', role: 'editor', createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), image: 'https://placehold.co/100x100/FFF5EB/F97316?text=DA'  },
        ];
        setUsers(mockUsers);
        // --- AKHIR MOCK DATA ---

      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching users data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getRoleBadgeClass = (role: string | null) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100';
      case 'editor':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-700 dark:text-yellow-100';
      case 'user':
      default:
        return 'bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-blue-100';
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg text-gray-600 dark:text-gray-300">Loading users...</p>
        {/* Tambahkan spinner jika mau */}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md">
        <p className="text-red-700 dark:text-red-300 font-medium">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            <FiUsers className="text-blue-500" />
            Manage Users
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            View and manage user accounts in your system.
          </p>
        </div>
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm font-medium shadow-sm"
        >
          <FiArrowLeft />
          Back to Dashboard
        </Link>
      </div>

      {/* TODO: Tambahkan tombol "Add New User" jika fungsionalitasnya ada
      <div className="mb-6 text-right">
        <Link
          href="/admin/dashboard/users/new"
          className="px-5 py-2.5 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm font-medium shadow-sm"
        >
          Add New User
        </Link>
      </div>
      */}

      {users.length === 0 ? (
        <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow">
            <FiUsers size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">No users found.</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                There are currently no users to display.
            </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3 w-12"></th> {/* Kolom untuk avatar */}
                  <th scope="col" className="px-6 py-3">Name</th>
                  <th scope="col" className="px-6 py-3">Email</th>
                  <th scope="col" className="px-6 py-3">Role</th>
                  <th scope="col" className="px-6 py-3">Joined Date</th>
                  {/* <th scope="col" className="px-6 py-3 text-center">Actions</th> */}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                    <td className="px-6 py-4">
                      {user.image ? (
                        <img src={user.image} alt={user.name || 'User Avatar'} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 font-semibold">
                          {user.name ? user.name.substring(0, 2).toUpperCase() : 'N/A'}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                      {user.name || <span className="italic text-gray-400 dark:text-gray-500">No Name</span>}
                    </td>
                    <td className="px-6 py-4">
                      {user.email || <span className="italic text-gray-400 dark:text-gray-500">No Email</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${getRoleBadgeClass(user.role)}`}>
                        {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
                      </span>
                    </td>
                    <td className="px-6 py-4">{formatDate(user.createdAt)}</td>
                    {/* <td className="px-6 py-4 text-center whitespace-nowrap">
                      <Link href={`/admin/dashboard/users/edit/${user.id}`} className="font-medium text-blue-600 dark:text-blue-500 hover:underline mr-3">
                        Edit
                      </Link>
                      <button 
                        onClick={() => console.log('Delete user:', user.id)} // Ganti dengan fungsi delete
                        className="font-medium text-red-600 dark:text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                    */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsersPage;
