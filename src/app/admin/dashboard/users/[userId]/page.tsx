"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiUser, FiMail, FiShield, FiSave, FiArrowLeft, FiLoader } from 'react-icons/fi';
import toast from 'react-hot-toast';

// Definisikan tipe untuk data form
interface UserFormData {
  name: string;
  email: string;
  role: string;
}

/**
 * Halaman untuk mengedit detail pengguna.
 * Mengambil data pengguna saat ini, menampilkan dalam form, dan mengirimkan
 * pembaruan kembali ke server melalui API.
 */
const EditUserPage = () => {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;

  const [userData, setUserData] = useState<UserFormData>({ name: '', email: '', role: 'USER' });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fungsi untuk mengambil data pengguna awal
  const fetchUser = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user data.');
      }
      const data = await response.json();
      setUserData({
        name: data.name || '',
        email: data.email || '',
        role: data.role || 'USER',
      });
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message || 'Could not load user data.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Panggil fetchUser saat komponen pertama kali dimuat
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Handler untuk memperbarui state saat input form berubah
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  // Handler untuk mengirimkan form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const toastId = toast.loading('Updating user...');

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user.');
      }

      toast.success('User updated successfully!', { id: toastId });
      router.push('/admin/dashboard/users'); // Arahkan kembali ke daftar pengguna
    } catch (err: any) {
      toast.error(err.message || 'An error occurred.', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <FiLoader className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        <p>Error: {error}</p>
        <button onClick={() => router.push('/admin/dashboard/users')} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
          Back to User List
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 flex items-center gap-3">
          <FiUser size={28} className="text-blue-600" />
          Edit User
        </h1>
        <button onClick={() => router.push('/admin/dashboard/users')} className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm font-medium shadow-sm">
          <FiArrowLeft size={18} />
          Back to User List
        </button>
      </div>

      <div className="bg-white shadow-xl rounded-lg p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <FiUser className="h-5 w-5 text-gray-400" />
              </span>
              <input
                type="text"
                name="name"
                id="name"
                value={userData.name}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <FiMail className="h-5 w-5 text-gray-400" />
              </span>
              <input
                type="email"
                name="email"
                id="email"
                value={userData.email}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Role Field */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <FiShield className="h-5 w-5 text-gray-400" />
              </span>
              <select
                name="role"
                id="role"
                value={userData.role}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
                <option value="EDITOR">Editor</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <FiLoader className="animate-spin" />
              ) : (
                <FiSave />
              )}
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserPage;
