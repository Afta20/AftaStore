// File: src/app/admin/dashboard/users/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { FiUsers, FiArrowLeft, FiEdit3, FiTrash2, FiSearch } from 'react-icons/fi';

/**
 * @interface User
 * Mendefinisikan struktur objek untuk data pengguna.
 * @property {string} id - ID unik pengguna.
 * @property {string | null} name - Nama lengkap pengguna.
 * @property {string | null} email - Alamat email pengguna.
 * @property {string | null} role - Peran pengguna dalam sistem (misalnya, 'admin', 'user', 'editor').
 * @property {string} createdAt - Tanggal dan waktu pembuatan akun pengguna, dalam format string ISO.
 * @property {string | null} [image] - URL opsional ke gambar avatar pengguna.
 */
interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: string | null;
  createdAt: string;
  image?: string | null;
}

/**
 * Komponen `ManageUsersPage` adalah halaman untuk menampilkan, mencari, dan mengelola
 * daftar pengguna dalam dashboard admin.
 * @returns {JSX.Element} Halaman antarmuka untuk manajemen pengguna.
 */
const ManageUsersPage = () => {
  /** State untuk menyimpan daftar semua pengguna yang diambil dari API. */
  const [users, setUsers] = useState<User[]>([]);
  /** State untuk menandakan status loading saat mengambil data pengguna. */
  const [loading, setLoading] = useState(true);
  /** State untuk menyimpan pesan error jika terjadi kesalahan saat pengambilan data. */
  const [error, setError] = useState<string | null>(null);
  /** State untuk menyimpan term pencarian yang dimasukkan pengguna. */
  const [searchTerm, setSearchTerm] = useState('');

  /**
   * Fungsi `fetchUsers` mengambil daftar pengguna dari endpoint API `/api/admin/users`.
   * Fungsi ini menggunakan `useCallback` untuk memoization, berguna jika diteruskan sebagai prop
   * atau digunakan dalam dependency array `useEffect` lainnya.
   */
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
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
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]); // fetchUsers dimasukkan sebagai dependensi karena sudah di-memoize dengan useCallback.

  /**
   * Memformat string tanggal ISO menjadi format tanggal lokal Indonesia (misalnya, "6 Juni 2025").
   * @param {string} dateString - String tanggal dalam format ISO yang akan diformat.
   * @returns {string} Representasi string tanggal yang sudah diformat, atau 'N/A' jika input tidak valid.
   */
  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      // Menangani kasus jika dateString tidak valid dan menyebabkan error pada constructor Date
      console.error("Invalid date string for formatDate:", dateString, e);
      return 'Invalid Date';
    }
  };

  /**
   * Mengembalikan string kelas CSS Tailwind berdasarkan peran pengguna untuk styling badge.
   * @param {string | null} role - Peran pengguna (misalnya, 'admin', 'editor', 'user').
   * @returns {string} String kelas CSS untuk badge peran.
   */
  const getRoleBadgeClass = (role: string | null): string => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-700';
      case 'editor':
        return 'bg-yellow-100 text-yellow-700';
      case 'user':
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  /**
   * Menyaring daftar pengguna berdasarkan `searchTerm`.
   * Pencarian dilakukan pada nama, email, dan peran pengguna (case-insensitive).
   */
  const filteredUsers = users.filter(user =>
    (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.role?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  /**
   * Menangani aksi penghapusan pengguna.
   * Memunculkan dialog konfirmasi sebelum melanjutkan.
   * Implementasi API delete sesungguhnya perlu ditambahkan.
   * @param {string} userId - ID dari pengguna yang akan dihapus.
   */
  const handleDeleteUser = async (userId: string) => {
    if (window.confirm(`Anda yakin ingin menghapus pengguna dengan ID: ${userId}? Tindakan ini tidak dapat diurungkan.`)) {
      console.log("Attempting to delete user:", userId);
      setLoading(true);
      try {
        const response = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Gagal menghapus pengguna.');
        }
        alert('Pengguna berhasil dihapus.');
        fetchUsers(); // Refresh daftar pengguna
      } catch (err: any) {
        setError(err.message || 'Gagal menghapus pengguna.');
        console.error("Delete user error:", err);
        alert(`Error: ${err.message || 'Gagal menghapus pengguna.'}`);
      } finally {
        setLoading(false);
      }
      alert(`Fungsi hapus untuk pengguna ${userId} belum diimplementasikan di backend.`);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] p-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
        <p className="text-lg text-gray-600">Loading users data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <div className="p-6 bg-red-50 border border-red-200 rounded-md text-center">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Oops! Something went wrong.</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchUsers} // Menggunakan fungsi fetchUsers yang sudah di-memoize
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
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 flex items-center gap-3">
            <FiUsers size={28} className="text-blue-600" />
            Manage Users
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            View, search, and manage user accounts in the system.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/*
            Placeholder untuk tombol "Add New User".
            Aktifkan jika halaman dan fungsionalitasnya sudah ada.
            <Link
              href="/admin/dashboard/users/new"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm font-medium shadow-sm"
            >
              <FiPlusCircle size={18}/>
              Add New User
            </Link>
          */}
          {/* === PERUBAHAN DI SINI === */}
          <Link
            href="/admin/dashboard"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#4B5563', // bg-gray-600
              color: 'white',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              textDecoration: 'none',
              boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
              transition: 'background-color 0.2s ease-out',
              width: '100%', // w-full
            }}
            // Di layar yang lebih besar, style di bawah akan menimpa 'width'
            // Ini adalah cara meniru 'sm:w-auto' dengan JavaScript
            onLoad={(e) => {
                if (window.innerWidth >= 640) { // 640px adalah breakpoint 'sm' di Tailwind
                    e.currentTarget.style.width = 'auto';
                }
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#374151'} // hover:bg-gray-700
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4B5563'}
          >
            <FiArrowLeft size={18} />
            Back to Dashboard
          </Link>
          {/* === AKHIR PERUBAHAN === */}
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search users by name, email, or role..."
              className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow">
            <FiUsers size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg font-medium">
              {searchTerm ? 'No users found matching your search.' : 'No users found.'}
            </p>
            {searchTerm && (
                 <p className="text-sm text-gray-400 mt-2">
                   Try adjusting your search terms.
                 </p>
            )}
        </div>
      ) : (
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100">
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
                  <tr key={user.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 flex justify-center">
                      {user.image ? (
                        <img src={user.image} alt={user.name || 'User Avatar'} className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-200" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold text-xs">
                          {user.name ? user.name.substring(0, 2).toUpperCase() : 'N/A'}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      {user.name || <span className="italic text-gray-400">No Name Provided</span>}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {user.email || <span className="italic text-gray-400">No Email Provided</span>}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getRoleBadgeClass(user.role)}`}>
                        {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{formatDate(user.createdAt)}</td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      {/* Placeholder: Ganti dengan Link ke halaman edit pengguna jika ada */}
                      <Link href={`/admin/dashboard/users/${user.id}`} className="font-medium text-blue-600 hover:text-blue-800 hover:underline mr-4 transition-colors">
                        <FiEdit3 className="inline -mt-1 mr-1" />Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="font-medium text-red-600 hover:text-red-800 hover:underline transition-colors"
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