"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Breadcrumb from '@/components/Common/Breadcrumb';
import { FiArrowLeft, FiCalendar, FiMapPin } from 'react-icons/fi';

// Definisikan tipe data sesuai snapshot
interface OrderItem {
  id: string;
  quantity: number;
  priceAtPurchase: number;
  productNameSnapshot: string;
  productImageSnapshot: string[] | null; // Sesuai tipe di Prisma
}

interface OrderDetails {
  id: string;
  createdAt: string;
  status: string;
  totalAmount: number;
  shippingAddress: string;
  items: OrderItem[];
}

// Helper format mata uang
const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

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
      const response = await fetch(`/api/orders/${orderId}`); // Panggil API Route
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Gagal mengambil detail pesanan.');
      }
      const data: OrderDetails = await response.json();
      setOrder(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (sessionStatus === 'authenticated') {
      fetchOrderDetails();
    }
  }, [sessionStatus, fetchOrderDetails]);
  
  const formatDate = (dateString: string) => new Date(dateString).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' });

  const getStatusBadgeClass = (status: string): string => {
    switch (status?.toUpperCase()) {
      case 'PAID': case 'SHIPPED': case 'DELIVERED': case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': case 'FAILED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading || sessionStatus === 'loading') {
    return <div className="p-8 text-center text-gray-600 min-h-[60vh] flex items-center justify-center">Loading...</div>;
  }
  if (error) {
    return <div className="p-8 text-center text-red-600 min-h-[60vh] flex items-center justify-center">Error: {error}</div>;
  }
  if (!order) {
    return <div className="p-8 text-center text-gray-600 min-h-[60vh] flex items-center justify-center">Pesanan tidak ditemukan.</div>;
  }

  return (
    <>
      <Breadcrumb title="Order Details" pages={["My Account", "My Orders", "Details"]} />
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6 md:p-8">
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

            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-700 mb-2 flex items-center gap-2"><FiMapPin /> Shipping Address</h2>
              <p className="text-gray-600 leading-relaxed">{order.shippingAddress}</p>
            </div>

            <div className="mt-8 border-t pt-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Items in this Order</h2>
              <div className="space-y-4">
                {order.items.map(item => (
                  <div key={item.id} className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg">
                    <Image
                      src={item.productImageSnapshot?.[0] ?? 'https://placehold.co/100x100/F3F4F6/9CA3AF?text=No+Img'}
                      alt={item.productNameSnapshot}
                      width={80}
                      height={80}
                      className="w-20 h-20 rounded-md object-cover flex-shrink-0 bg-gray-200"
                    />
                    <div className="flex-grow">
                      <p className="font-medium text-gray-800">{item.productNameSnapshot}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity} @ {formatCurrency(Number(item.priceAtPurchase))}</p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(item.quantity * Number(item.priceAtPurchase))}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 text-center">
              <Link href="/orders" className="inline-flex items-center gap-2 px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300 transition-colors">
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