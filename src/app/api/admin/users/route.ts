// File: src/app/admin/dashboard/users/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiUsers, FiArrowLeft, FiEdit3, FiTrash2, FiPlusCircle } from 'react-icons/fi'; // Menggunakan react-icons

// Definisikan tipe User (sesuaikan dengan data yang Anda fetch dari API)
interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: string | null;      // Misalnya: 'admin', 'user', 'editor'
  createdAt: string;      // Atau Date, lalu format di frontend
  image?: string | null;   // URL gambar profil pengguna (opsional)
}

const ManageUsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fungsi untuk mengambil data pengguna dari API
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch users: ${response.statusText}`);
      }
      const data: User[] = await response.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching users.');
      console.error("Fetch users error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const getRoleBadgeClass = (role: string | null): string => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-700'; // Dihapus: dark:bg-red-700 dark:text-red-100
      case 'editor':
        return 'bg-yellow-100 text-yellow-700'; // Dihapus: dark:bg-yellow-700 dark:text-yellow-100
      case 'user':
      default:
        return 'bg-blue-100 text-blue-700'; // Dihapus: dark:bg-blue-700 dark:text-blue-100
    }
  };

  const filteredUsers = users.filter(user =>
    (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.role?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm(`Anda yakin ingin menghapus pengguna dengan ID: ${userId}? Tindakan ini tidak dapat diurungkan.`)) {
      console.log("Attempting to delete user:", userId);
      alert(`Fungsi hapus untuk pengguna ${userId} belum diimplementasikan di backend.`);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] p-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
        <p className="text-lg text-gray-600">Loading users data...</p> {/* Dihapus: dark:text-gray-300 */}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <div className="p-6 bg-red-50 border border-red-200 rounded-md text-center"> {/* Dihapus: dark:bg-red-900/20 dark:border-red-700 */}
          <h2 className="text-xl font-semibold text-red-700 mb-2">Oops! Something went wrong.</h2> {/* Dihapus: dark:text-red-300 */}
          <p className="text-red-600 mb-4">{error}</p> {/* Dihapus: dark:text-red-400 */}
          <button
            onClick={fetchUsers}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 flex items-center gap-3"> {/* Dihapus: dark:text-white */}
            <FiUsers size={28} className="text-blue-600" /> {/* Dihapus: dark:text-blue-400 */}
            Manage Users
          </h1>
          <p className="text-sm text-gray-500 mt-1"> {/* Dihapus: dark:text-gray-400 */}
            View, search, and manage user accounts in the system.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link
            href="/admin/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm font-medium shadow-sm"
          >
            <FiArrowLeft size={18} />
            Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search users by name, email, or role..."
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400" /* Dihapus: dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 */
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredUsers.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow"> {/* Dihapus: dark:bg-gray-800 */}
            <FiUsers size={48} className="mx-auto text-gray-400 mb-4" /> {/* Dihapus: dark:text-gray-500 */}
            <p className="text-gray-600 text-lg font-medium"> {/* Dihapus: dark:text-gray-400 */}
              {searchTerm ? 'No users found matching your search.' : 'No users found.'}
            </p>
            {searchTerm && (
                 <p className="text-sm text-gray-400 mt-2"> {/* Dihapus: dark:text-gray-500 */}
                    Try adjusting your search terms.
                 </p>
            )}
        </div>
      ) : (
        <div className="bg-white shadow-xl rounded-lg overflow-hidden"> {/* Dihapus: dark:bg-gray-800 */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-full text-sm text-left text-gray-500"> {/* Dihapus: dark:text-gray-400 */}
              <thead className="text-xs text-gray-700 uppercase bg-gray-100"> {/* Dihapus: dark:bg-gray-700 dark:text-gray-300 */}
                <tr>
                  <th scope="col" className="px-6 py-3 w-16 text-center">Avatar</th>
                  <th scope="col" className="px-6 py-3">Name</th>
                  <th scope="col" className="px-6 py-3">Email</th>
                  <th scope="col" className="px-6 py-3 text-center">Role</th>
                  <th scope="col" className="px-6 py-3">Joined Date</th>
                  <th scope="col" className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="bg-white border-b hover:bg-gray-50 transition-colors"> {/* Dihapus: dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700/50 */}
                    <td className="px-6 py-4 flex justify-center">
                      {user.image ? (
                        <img src={user.image} alt={user.name || 'User Avatar'} className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-200" /> {/* Dihapus: dark:ring-gray-600 */}
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold text-xs"> {/* Dihapus: dark:bg-gray-600 dark:text-gray-300 */}
                          {user.name ? user.name.substring(0, 2).toUpperCase() : 'N/A'}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"> {/* Dihapus: dark:text-white */}
                      {user.name || <span className="italic text-gray-400">No Name Provided</span>} {/* Dihapus: dark:text-gray-500 */}
                    </td>
                    <td className="px-6 py-4 text-gray-600"> {/* Dihapus: dark:text-gray-300 */}
                      {user.email || <span className="italic text-gray-400">No Email Provided</span>} {/* Dihapus: dark:text-gray-500 */}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getRoleBadgeClass(user.role)}`}>
                        {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{formatDate(user.createdAt)}</td> {/* Dihapus: dark:text-gray-300 */}
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <Link href={`/admin/dashboard/users/edit/${user.id}`} className="font-medium text-blue-600 hover:text-blue-800 hover:underline mr-4 transition-colors"> {/* Dihapus: dark:text-blue-400 dark:hover:text-blue-300 */}
                        <FiEdit3 className="inline -mt-1 mr-1" />Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="font-medium text-red-600 hover:text-red-800 hover:underline transition-colors" /* Dihapus: dark:text-red-400 dark:hover:text-red-300 */
                        title={`Delete user ${user.name || user.id}`}
                      >
                        <FiTrash2 className="inline -mt-1 mr-1" />Delete
                      </button>
                    </td>
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
