// File: src/app/(site)/(pages)/orders/[orderId]/page.tsx

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Breadcrumb from '@/components/Common/Breadcrumb';
import { FiArrowLeft, FiCalendar, FiMapPin } from 'react-icons/fi';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Force page to be dynamic (no caching)
export const dynamic = 'force-dynamic';

// Helper untuk format
const formatDate = (dateString: Date) =>
  new Date(dateString).toLocaleString('id-ID', {
    dateStyle: 'long',
    timeStyle: 'short',
  });

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);

// Komponen utama
const OrderDetailsPage = async ({ params }: { params: { orderId: string } }) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return (
      <div className="container mx-auto text-center py-20">
        Anda harus login untuk melihat halaman ini.
      </div>
    );
  }

  const { orderId } = params;

  // Validasi orderId (UUID format)
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(orderId);
  if (!isUUID) notFound();

  let order;

  try {
    order = await prisma.order.findUnique({
      where: {
        id: orderId,
        userId: session.user.id,
      },
      include: {
        items: true,
      },
    });

    if (!order) notFound();
  } catch (error) {
    console.error('Error fetching order:', error);
    return (
      <div className="container mx-auto text-center py-20">
        Terjadi kesalahan saat mengambil data order.
      </div>
    );
  }

  const getStatusBadgeClass = (status: string): string => {
    switch (status?.toUpperCase()) {
      case 'PAID':
      case 'SHIPPED':
      case 'DELIVERED':
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalAmount = order.items.reduce(
    (sum, item) => sum + item.quantity * Number(item.priceAtPurchase),
    0
  );

  return (
    <>
      <Breadcrumb title="Order Details" pages={['My Account', 'My Orders', 'Details']} />
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6 md:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-6 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Order #{order.id.substring(0, 8)}...
                </h1>
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                  <FiCalendar /> Placed on {formatDate(order.createdAt)}
                </p>
              </div>
              <div className="mt-4 sm:mt-0">
                <span
                  className={`px-4 py-1.5 text-sm font-semibold rounded-full ${getStatusBadgeClass(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FiMapPin /> Shipping Address
              </h2>
              <p className="text-gray-600 leading-relaxed">{order.shippingAddress}</p>
            </div>

            <div className="mt-8 border-t pt-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Items in this Order</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg"
                  >
                    <Image
                      src={
                        item.productImageSnapshot?.[0] ??
                        'https://placehold.co/100x100/F3F4F6/9CA3AF?text=No+Img'
                      }
                      alt={item.productNameSnapshot || 'Unknown Product'}
                      width={80}
                      height={80}
                      className="w-20 h-20 rounded-md object-cover flex-shrink-0 bg-gray-200"
                    />
                    <div className="flex-grow">
                      <p className="font-medium text-gray-800">
                        {item.productNameSnapshot || 'Unknown Product'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity} @ {formatCurrency(Number(item.priceAtPurchase))}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(item.quantity * Number(item.priceAtPurchase))}
                    </p>
                  </div>
                ))}
              </div>
              <div className="text-right mt-6">
                <p className="text-lg font-semibold text-gray-800">
                  Total: {formatCurrency(totalAmount)}
                </p>
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

export default OrderDetailsPage;
