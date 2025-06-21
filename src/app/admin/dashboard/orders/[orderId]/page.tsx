// File: src/app/admin/dashboard/orders/[orderId]/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { FiShoppingBag, FiUser, FiMapPin, FiCalendar, FiArrowLeft, FiEdit } from 'react-icons/fi';

// --- TYPE DEFINITIONS ---
interface OrderItem {
  id: string;
  quantity: number;
  priceAtPurchase: number;
  product: {
    title: string;
    imagePreviews: string[];
  };
}
interface OrderDetails {
  id: string;
  createdAt: string;
  status: string;
  totalAmount: number;
  shippingAddress: string;
  customerNotes?: string | null;
  user: {
    name: string | null;
    email: string | null;
    image?: string | null;
  } | null;
  items: OrderItem[];
}

const OrderDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchOrderDetails = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to fetch order details.');
      }
      const data: OrderDetails = await response.json();
      setOrder(data);
      setNewStatus(data.status);
    } catch (err: any) {
      setError(err.message);
      console.error("Fetch order details error:", err);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  const handleStatusUpdate = async () => {
    if (!orderId || !newStatus || newStatus === order?.status) return;
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to update status.');
      }
      fetchOrderDetails();
      alert('Order status has been updated successfully!');
    } catch (err: any) {
      alert(`Error: ${err.message}`);
      console.error("Update status error:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' });
  
  const getStatusBadgeClass = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PAID': case 'SHIPPED': case 'DELIVERED': case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': case 'FAILED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-600">Loading order details...</div>;
  }
  if (error) {
    return <div className="p-8 text-center text-red-600">Error: {error}</div>;
  }
  if (!order) {
    return <div className="p-8 text-center text-gray-600">Order not found.</div>;
  }

  const orderStatuses = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED'];

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FiShoppingBag size={28} className="text-purple-600" />
            Order Details
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-mono">ID: {order.id}</p>
        </div>
        <Link
          href="/admin/dashboard/orders"
          style={{ padding: '0.5rem 1rem', backgroundColor: '#3b82f6', color: 'white', borderRadius: '0.375rem', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>
          <FiArrowLeft size={18} /> 
          Back to All Orders
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Order Summary</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Order Date</p>
                <p className="font-medium text-gray-800 flex items-center gap-2"><FiCalendar /> {formatDate(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-gray-500">Order Status</p>
                <p className={`font-medium px-2.5 py-1 text-xs inline-block rounded-full ${getStatusBadgeClass(order.status)}`}>{order.status}</p>
              </div>
              <div>
                <p className="text-gray-500">Shipping Address</p>
                <p className="font-medium text-gray-800 flex items-start gap-2"><FiMapPin className="mt-1 flex-shrink-0" /> <span className="whitespace-pre-wrap">{order.shippingAddress}</span></p>
              </div>
            </div>
            {order.customerNotes && (
                 <div className="mt-4">
                     <p className="text-gray-500 text-sm">Customer Notes</p>
                     <p className="font-medium text-gray-800 mt-1 p-3 bg-yellow-50 border border-yellow-200 rounded-md italic">&ldquo;{order.customerNotes}&rdquo;</p>
                 </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Customer Details</h2>
             {order.user ? (
                <div className="flex items-center gap-4">
                  {/* --- AVATAR FIX --- */}
                  {order.user.image ? (
                    <Image src={order.user.image} alt="User Avatar" width={64} height={64} className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-200" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xl ring-2 ring-gray-300">
                      {order.user.name ? order.user.name.substring(0, 2).toUpperCase() : 'N/A'}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-lg text-gray-800">{order.user.name || 'No Name'}</p>
                    <p className="text-sm text-gray-600">{order.user.email || 'No Email'}</p>
                  </div>
                </div>
             ) : (<p className="text-gray-600">Guest user.</p>)}
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Items Ordered</h2>
              <ul className="divide-y divide-gray-200">
                {order.items.map(item => (
                  <li key={item.id} className="py-4 flex gap-4">
                    <Image
                      src={item.product.imagePreviews[0] || 'https://placehold.co/100x100/F3F4F6/9CA3AF?text=No+Img'}
                      alt={item.product.title}
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-md object-cover flex-shrink-0"
                    />
                    <div className="flex-grow">
                        <p className="font-medium text-sm text-gray-800">{item.product.title}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                        <p className="font-semibold text-sm text-gray-800">
                            Rp {(item.priceAtPurchase * item.quantity).toLocaleString('id-ID')}
                        </p>
                        <p className="text-xs text-gray-500">
                           (@ Rp {item.priceAtPurchase.toLocaleString('id-ID')})
                        </p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="border-t border-gray-200 mt-4 pt-4 text-right">
                  <p className="text-gray-600">Grand Total</p>
                  <p className="text-2xl font-bold text-gray-900">Rp {order.totalAmount.toLocaleString('id-ID')}</p>
              </div>
           </div>
           
           <div className="bg-white p-6 rounded-lg shadow-md">
             <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2"><FiEdit/> Update Order Status</h2>
             <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
             >
                {orderStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
             </select>
             {/* --- UPDATE STATUS BUTTON FIX --- */}
             <button
                onClick={handleStatusUpdate}
                disabled={isUpdating || newStatus === order.status}
                style={{
                  marginTop: '1rem',
                  width: '100%',
                  padding: '10px 16px',
                  backgroundColor: (isUpdating || newStatus === order.status) ? '#9CA3AF' : '#2563EB', // gray-400 or blue-600
                  color: 'white',
                  fontWeight: 600,
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  cursor: (isUpdating || newStatus === order.status) ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s',
                  border: 'none',
                }}
             >
                {isUpdating ? 'Updating...' : 'Update Status'}
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
