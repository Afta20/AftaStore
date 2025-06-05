// File: src/app/(site)/(pages)/order-confirmation/[orderId]/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Breadcrumb from '@/components/Common/Breadcrumb'; 

interface FetchedUser {
  name: string | null; 
}
interface FetchedOrderItem {
  id: string; // ID OrderItem
  productId: string;
  title: string;
  quantity: number;
  priceAtPurchase: number; // Harga satuan saat dibeli
}

interface FetchedOrder {
  id: string; // ID Pesanan
  createdAt: string; // atau Date jika dikonversi
  totalAmount: number;
  shippingAddress: string;
  customerNotes?: string | null;
  status: string;
  items: FetchedOrderItem[];
  user?: FetchedUser; // Informasi pengguna jika ada
}



const OrderConfirmationPage = () => {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string; // Ambil orderId dari URL

  const [order, setOrder] = useState<FetchedOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      const fetchOrderDetails = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await fetch(`/api/orders/${orderId}`);
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Gagal mengambil detail pesanan: ${response.status}`);
          }
          const data: FetchedOrder = await response.json();
          setOrder(data);
        } catch (err: any) {
          console.error("Error fetching order details:", err);
          setError(err.message || "Tidak dapat memuat detail pesanan Anda.");
          if (err.response?.status === 404) router.push('/404');
        } finally {
          setLoading(false);
        }
      };

      fetchOrderDetails();
    } else {
      setError("Nomor pesanan tidak valid.");
      setLoading(false);
    }
  }, [orderId, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-lg text-gray-600">Memuat detail pesanan Anda...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 px-4 text-center">
        <h1 className="text-2xl font-semibold text-red-600 mb-4">Terjadi Kesalahan</h1>
        <p className="text-gray-700 mb-6">{error}</p>
        <Link href="/" className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto py-10 px-4 text-center">
        <h1 className="text-2xl font-semibold text-gray-700 mb-4">Pesanan Tidak Ditemukan</h1>
        <p className="text-gray-600 mb-6">Maaf, kami tidak dapat menemukan detail untuk pesanan ini.</p>
        <Link href="/" className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <>
      <Breadcrumb title="Konfirmasi Pesanan" pages={["Konfirmasi Pesanan"]} />
      <section className="py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-6 md:p-10">
            <div className="text-center mb-8">
              <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">Pesanan Berhasil!</h1>
              <p className="text-gray-600 mt-2">Terima kasih atas pesanan Anda. Berikut adalah ringkasannya:</p>
            </div>

            <div className="bg-gray-50 p-4 sm:p-6 rounded-md mb-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-3">Detail Pesanan</h2>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Nomor Pesanan:</dt>
                  <dd className="font-medium text-gray-800">{order.id}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Tanggal Pesanan:</dt>
                  <dd className="font-medium text-gray-800">{formatDate(order.createdAt)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Status Pesanan:</dt>
                  <dd className="font-medium text-green-600">{order.status}</dd>
                </div>
                {order.user && (
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Nama Pelanggan:</dt>
                    <dd className="font-medium text-gray-800">{order.user.name}</dd>
                  </div>
                )}
               
              </dl>
            </div>
            
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-3">Alamat Pengiriman</h2>
              <address className="text-sm text-gray-600 not-italic whitespace-pre-line">
                {order.shippingAddress}
              </address>
            </div>

            {order.customerNotes && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-2">Catatan Pelanggan</h2>
                <p className="text-sm text-gray-600 italic">"{order.customerNotes}"</p>
              </div>
            )}

            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-3">Ringkasan Item</h2>
              <ul className="divide-y divide-gray-200 border-b border-gray-200">
                {order.items.map((item) => (
                  <li key={item.id} className="py-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800">{item.title}</p>
                      <p className="text-xs text-gray-500">Kuantitas: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-gray-800">
                      Rp. {(item.priceAtPurchase * item.quantity).toLocaleString('id-ID')}
                    </p>
                  </li>
                ))}
              </ul>
              <div className="mt-4 text-right">
                <p className="text-xl font-semibold text-gray-800 mt-1">
                  Total: Rp. {order.totalAmount.toLocaleString('id-ID')}
                </p>
              </div>
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/shop" // Atau ke halaman produkmu
                className="px-8 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors duration-150"
              >
                Lanjut Belanja
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default OrderConfirmationPage;