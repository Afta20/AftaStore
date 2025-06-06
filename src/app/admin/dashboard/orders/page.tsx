// File: src/app/admin/dashboard/orders/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { FiShoppingBag, FiArrowLeft, FiEye } from 'react-icons/fi'; // Menggunakan react-icons

// Definisikan tipe Order (sesuaikan dengan data yang Anda fetch dari API)
interface Order {
  id: string;
  user: { // Objek user yang di-include dari backend
    name: string | null;
    email: string | null;
  } | null;
  totalAmount: number;
  status: string; // Misalnya: 'PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'
  createdAt: string; // Atau Date, lalu format
}

const ManageOrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Mengambil daftar pesanan dari API backend.
   */
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/orders');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch orders: ${response.statusText}`);
      }
      const data: Order[] = await response.json();
      setOrders(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching orders.');
      console.error("Fetch orders error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusBadgeClass = (status: string | null): string => {
    switch (status?.toUpperCase()) {
      case 'PAID':
      case 'SHIPPED':
      case 'DELIVERED':
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100';
      case 'CANCELLED':
      case 'FAILED':
        return 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] p-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
        <p className="text-lg text-gray-600 dark:text-gray-300">Loading order data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md text-center">
          <h2 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-2">Oops! Something went wrong.</h2>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchOrders}
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
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-white flex items-center gap-3">
            <FiShoppingBag size={28} className="text-purple-600 dark:text-purple-400" />
            Manage Orders
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            View and track all customer orders.
          </p>
        </div>
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm font-medium shadow-sm"
        >
          <FiArrowLeft size={18} />
          Back to Dashboard
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow">
            <FiShoppingBag size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">No orders found.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-300">
                <tr>
                  <th scope="col" className="px-6 py-3">Order ID</th>
                  <th scope="col" className="px-6 py-3">Customer</th>
                  <th scope="col" className="px-6 py-3">Date</th>
                  <th scope="col" className="px-6 py-3 text-center">Status</th>
                  <th scope="col" className="px-6 py-3 text-right">Total Amount</th>
                  <th scope="col" className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-600 dark:text-gray-400">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                      {order.user?.name || <span className="italic text-gray-400">Guest</span>}
                      <p className="font-normal text-gray-500 dark:text-gray-400">{order.user?.email}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900 dark:text-white">
                      Rp {order.totalAmount.toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <Link href={`/admin/dashboard/orders/${order.id}`} className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors inline-flex items-center gap-1">
                        <FiEye size={14} /> View Details
                      </Link>
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

export default ManageOrdersPage;
