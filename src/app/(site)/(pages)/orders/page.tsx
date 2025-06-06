// File: src/app/(site)/(pages)/orders/page.tsx (or a similar path like /my-account/orders)
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Breadcrumb from '@/components/Common/Breadcrumb'; // Assuming you have this component
import { FiShoppingBag, FiCalendar, FiHash, FiMoreVertical } from 'react-icons/fi';

/**
 * @interface OrderHistory
 * Defines the structure for an order shown in the user's history list.
 */
interface OrderHistory {
  id: string;
  createdAt: string;
  status: string;
  totalAmount: number;
  itemCount: number;
}

const MyOrdersPage = () => {
  const router = useRouter();
  const { status: sessionStatus } = useSession({
    required: true,
    onUnauthenticated() {
      // Redirect to sign-in page if not authenticated
      router.push('/signin?callbackUrl=/orders');
    },
  });

  const [orders, setOrders] = useState<OrderHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches the user's order history from the dedicated API endpoint.
   */
  const fetchOrderHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/orders/history');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch your order history.');
      }
      const data: OrderHistory[] = await response.json();
      setOrders(data);
    } catch (err: any) {
      setError(err.message);
      console.error("Fetch order history error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (sessionStatus === 'authenticated') {
      fetchOrderHistory();
    }
  }, [sessionStatus, fetchOrderHistory]);
  
  /**
   * Returns a Tailwind CSS class string for the status badge.
   */
  const getStatusBadgeClass = (status: string): string => {
    switch (status?.toUpperCase()) {
      case 'PAID': case 'SHIPPED': case 'DELIVERED': case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * Formats a date string into a more readable format.
   */
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (sessionStatus === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      {/* --- FIX APPLIED HERE --- */}
      <Breadcrumb title="My Orders" pages={["My Orders"]} />

      <section className="py-16 md:py-20 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Your Order History</h1>

            {error && (
              <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-md text-center">
                <p className="text-red-700 font-medium">Error: {error}</p>
              </div>
            )}
            
            {orders.length === 0 && !error ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <FiShoppingBag size={56} className="mx-auto text-gray-400 mb-4" />
                <h2 className="text-xl font-semibold text-gray-700">You have no orders yet.</h2>
                <p className="text-gray-500 mt-2 mb-6">
                  All your future orders will be displayed here.
                </p>
                <Link
                  href="/shop"
                  className="inline-block px-8 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-transparent hover:border-blue-200">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                      <div className="flex-grow">
                        <p className="text-sm text-gray-500 font-mono flex items-center gap-2">
                           <FiHash size={14} /> {order.id}
                        </p>
                        <p className="font-semibold text-lg text-gray-800 mt-1">
                          {order.itemCount} item{order.itemCount > 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="flex-shrink-0 mt-4 sm:mt-0 sm:text-right">
                        <p className="text-sm text-gray-500 flex items-center gap-2 justify-end">
                          <FiCalendar size={14} /> Placed on {formatDate(order.createdAt)}
                        </p>
                         <p className="font-bold text-xl text-gray-900 mt-1">
                           Rp {order.totalAmount.toLocaleString('id-ID')}
                         </p>
                      </div>
                    </div>
                    <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between items-center">
                       <div>
                         <span className="text-sm font-medium">Status:</span>
                         <span className={`ml-2 px-3 py-1 text-xs font-bold rounded-full ${getStatusBadgeClass(order.status)}`}>
                          {order.status}
                         </span>
                       </div>
                       <Link
                         href={`/orders/${order.id}`} // This page needs to be created next
                         className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                       >
                         View Details
                       </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default MyOrdersPage;
