import React from 'react';
import Image from 'next/image';
import prisma from '@/lib/prisma'; // Impor prisma client
import { notFound } from 'next/navigation';
import { FiCheckCircle, FiMapPin, FiCalendar } from 'react-icons/fi';

// Helper untuk format tanggal dan mata uang
const formatDate = (dateString: Date) => new Date(dateString).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' });
const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

// Komponen halaman sekarang menjadi 'async' untuk bisa mengambil data
const OrderConfirmationPage = async ({ params }: { params: { orderId: string } }) => {
  const orderId = params.orderId;

  // Mengambil data pesanan dari database di server
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true, // Sertakan semua item yang terkait dengan pesanan ini
    },
  });

  // Jika pesanan tidak ditemukan, tampilkan halaman 404
  if (!order) {
    notFound();
  }

  // Lakukan kalkulasi biaya di sini
  const subtotal = order.items.reduce((acc, item) => acc + (Number(item.priceAtPurchase) * item.quantity), 0);
  const shippingFee = Number(order.totalAmount) - subtotal;

  return (
    <section className="py-16 md:py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-6 md:p-10 text-center">
          
          <FiCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800">Pesanan Berhasil!</h1>
          <p className="text-gray-500 mt-2">Terima kasih atas pesanan Anda. Berikut adalah ringkasannya:</p>

          <div className="text-left border-t border-b my-8 py-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Detail Pesanan</h2>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium">Nomor Pesanan:</span>
              <span className="text-gray-800 font-mono">{order.id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium">Tanggal Pesanan:</span>
              <span className="text-gray-800">{formatDate(order.createdAt)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium">Status Pesanan:</span>
              <span className="font-semibold text-yellow-600">{order.status}</span>
            </div>
          </div>

          <div className="text-left mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2"><FiMapPin /> Alamat Pengiriman</h2>
            <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-md">{order.shippingAddress}</p>
          </div>

          {/* ----- BAGIAN BARU: DAFTAR ITEM ----- */}
          <div className="text-left">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Ringkasan Item</h2>
            <div className="space-y-4">
              {order.items.map(item => (
                <div key={item.id} className="flex items-center gap-4 border-b pb-4">
                  <Image
                    src={item.productImageSnapshot?.[0] ?? 'https://placehold.co/80x80/F3F4F6/9CA3AF?text=No+Img'}
                    alt={item.productNameSnapshot}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-md object-cover bg-gray-200"
                  />
                  <div className="flex-grow">
                    <p className="font-medium text-gray-800">{item.productNameSnapshot}</p>
                    <p className="text-sm text-gray-500">{item.quantity} x {formatCurrency(Number(item.priceAtPurchase))}</p>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(item.quantity * Number(item.priceAtPurchase))}
                  </p>
                </div>
              ))}
            </div>
          </div>
          
          {/* ----- BAGIAN BARU: RINCIAN BIAYA ----- */}
          <div className="text-left border-t mt-8 pt-6">
            <div className="space-y-2 text-md">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-800">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Biaya Pengiriman</span>
                <span className="text-gray-800">{formatCurrency(shippingFee)}</span>
              </div>
              <div className="border-t pt-4 mt-4 flex justify-between font-bold text-xl">
                <span className="text-gray-900">Total</span>
                <span className="text-blue-600">{formatCurrency(Number(order.totalAmount))}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default OrderConfirmationPage;