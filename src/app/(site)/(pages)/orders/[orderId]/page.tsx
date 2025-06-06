// File: src/app/(site)/(pages)/orders/[orderId]/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Breadcrumb from '@/components/Common/Breadcrumb';
import { FiShoppingBag, FiMapPin, FiCalendar, FiArrowLeft, FiClipboard, FiAlertCircle } from 'react-icons/fi';

// --- DEFINISI TIPE DATA (DENGAN PERBAIKAN) ---
interface OrderItem {
  id: string;
  quantity: number;
  priceAtPurchase: number;
  product: { // Objek produk bisa jadi null jika produk sudah dihapus
    title: string;
    imagePreviews: string[];
  } | null;
}
interface OrderDetails {
  id: string;
  createdAt: string;
  status: string;
  totalAmount: number;
  shippingAddress: string;
  customerNotes?: string | null;
  items: OrderItem[];
}

const UserOrderDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;
  const { status: sessionStatus } = useSession({
    required: true,
    onUnauthenticated() {
      router.push(`/signin?callbackUrl=/orders/${orderId}`);
    },
  });

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrderDetails = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to fetch order details.');
      }
      const data: OrderDetails = await response.json();
      setOrder(data);
    } catch (err: any) {
      setError(err.message);
      console.error("Fetch order details error:", err);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (sessionStatus === 'authenticated') {
      fetchOrderDetails();
    }
  }, [sessionStatus, fetchOrderDetails]);

  const formatDate = (dateString: string) => new Date(dateString).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' });
  
  const getStatusBadgeClass = (status: string): string => {
    switch (status?.toUpperCase()) {
      case 'PAID': case 'SHIPPED': case 'DELIVERED': case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': case 'FAILED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading || sessionStatus === 'loading') {
    return <div className="p-8 text-center text-gray-600 min-h-[60vh] flex items-center justify-center">Loading your order details...</div>;
  }
  if (error) {
    return <div className="p-8 text-center text-red-600 min-h-[60vh] flex items-center justify-center">Error: {error}</div>;
  }
  if (!order) {
    return <div className="p-8 text-center text-gray-600 min-h-[60vh] flex items-center justify-center">Order not found.</div>;
  }

  return (
    <>
      <Breadcrumb title="Order Details" pages={["My Account", "My Orders", "Details"]} />
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6 md:p-8">
            {/* Header Pesanan */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-6 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Order #{order.id.substring(0, 8)}...</h1>
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                  <FiCalendar /> Placed on {formatDate(order.createdAt)}
                </p>
              </div>
              <div className="mt-4 sm:mt-0">
                <span className={`px-4 py-1.5 text-sm font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                  {order.status}
                </span>
              </div>
            </div>

            {/* Konten Detail Pesanan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-3">Shipping Address</h2>
                <div className="text-gray-600 leading-relaxed">
                  <p>{order.shippingAddress}</p>
                </div>

                {order.customerNotes && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Your Notes</h3>
                    <p className="text-sm text-gray-600 p-4 bg-gray-50 rounded-md italic">
                      &ldquo;{order.customerNotes}&rdquo;
                    </p>
                  </div>
                )}
              </div>
              
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-3">Order Summary</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal ({order.items.reduce((acc, item) => acc + item.quantity, 0)} items)</span>
                    <span className="text-gray-800">Rp {order.items.reduce((acc, item) => acc + (item.priceAtPurchase * item.quantity), 0).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-800">Rp {(order.totalAmount - order.items.reduce((acc, item) => acc + (item.priceAtPurchase * item.quantity), 0)).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                    <span className="text-gray-900">Total</span>
                    <span className="text-blue-600">Rp {order.totalAmount.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Daftar Item */}
            <div className="mt-8 border-t pt-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Items in this Order</h2>
              <div className="space-y-4">
                {order.items.map(item => (
                  <div key={item.id} className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg">
                    <Image
                      src={item.product?.imagePreviews?.[0] ?? 'https://placehold.co/100x100/F3F4F6/9CA3AF?text=No+Img'}
                      alt={item.product?.title ?? 'Product not available'}
                      width={80}
                      height={80}
                      className="w-20 h-20 rounded-md object-cover flex-shrink-0 bg-gray-200"
                    />
                    <div className="flex-grow">
                      {item.product ? (
                        <>
                          <p className="font-medium text-gray-800">{item.product.title}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity} @ Rp {item.priceAtPurchase.toLocaleString('id-ID')}</p>
                        </>
                      ) : (
                        <div className="flex flex-col justify-center">
                            <p className="font-medium text-gray-500 italic">Product no longer available</p>
                            <p className="text-xs text-gray-400">This item was part of your order.</p>
                        </div>
                      )}
                    </div>
                    <p className="font-semibold text-gray-900">
                      Rp {(item.priceAtPurchase * item.quantity).toLocaleString('id-ID')}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/orders"
                className="inline-flex items-center gap-2 px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300 transition-colors"
              >
                <FiArrowLeft size={16} />
                Back to Order History
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default UserOrderDetailsPage;
