// File: src/app/(site)/(pages)/checkout/page.tsx
"use client";

import React, { useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import Breadcrumb from "@/components/Common/Breadcrumb"; // Sesuaikan path jika perlu
import { removeAllItemsFromCart } from '@/redux/features/cart-slice'; // PASTIKAN PATH INI BENAR
import { RootState, useAppSelector } from '@/redux/store'; // PASTIKAN PATH INI BENAR

// Komponen-komponen tetap diimpor dan dirender
import Billing from "@/components/Checkout/Billing";     // Sesuaikan path jika perlu
import Shipping from "@/components/Checkout/Shipping";   // Sesuaikan path jika perlu
import ShippingMethod from "@/components/Checkout/ShippingMethod"; // Sesuaikan path jika perlu
import PaymentMethod from "@/components/Checkout/PaymentMethod"; // Sesuaikan path jika perlu
import Coupon from "@/components/Checkout/Coupon";       // Sesuaikan path jika perlu

interface CartItem {
  id: string | number;
  title: string;
  price: number;
  quantity: number;
}

const Checkout = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/signin?callbackUrl=/checkout");
    },
  });

  const cartItems: CartItem[] = useAppSelector((state: RootState) => state.cartReducer?.items || []);
  const productsSubtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  const shippingFeeFromMethod = 45000; // Untuk sementara, kita hardcode. Nanti bisa diambil dari state ShippingMethod
  const grandTotal = productsSubtotal + shippingFeeFromMethod;

  // State untuk input yang datanya AKAN kita kirim
  const [shippingAddressInput, setShippingAddressInput] = useState(''); // Data dari textarea alamat
  const [customerNotesInput, setCustomerNotesInput] = useState('');   // Data dari textarea catatan

  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handleWhatsAppCheckout = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!cartItems || cartItems.length === 0) {
      alert("Keranjang Anda kosong!");
      return;
    }
    const orderItemsText = cartItems.map(item =>
      `- ${item.title} (x${item.quantity}): Rp. ${(item.price * item.quantity).toLocaleString('id-ID')}`
    ).join('\n');
    // Gunakan shippingAddressInput untuk pesan WhatsApp jika sudah diisi
    const displayAddress = shippingAddressInput.trim() || "Belum diisi";
    const message = `Halo, saya ingin melakukan pembayaran pesanan saya dengan item berikut:\n${orderItemsText}\nAlamat Pengiriman: ${displayAddress}\nBiaya Pengiriman: Rp. ${shippingFeeFromMethod.toLocaleString('id-ID')}\nTotal: Rp. ${grandTotal.toLocaleString('id-ID')}\nOrder ID: #ORDER${Date.now()} (User: ${session?.user?.email || 'Guest'})`;
    const phoneNumber = "6283189082839"; 
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, '_blank');
  };

  const handleProcessToPayment = async () => {
    if (!session?.user) {
      setCheckoutError("Anda harus login untuk membuat pesanan.");
      return;
    }
    if (cartItems.length === 0) {
      setCheckoutError("Keranjang Anda kosong.");
      return;
    }
    if (!shippingAddressInput.trim()) { // Validasi input alamat dari textarea
      setCheckoutError("Mohon isi alamat pengiriman Anda di kolom yang disediakan.");
      return;
    }

    setIsProcessing(true);
    setCheckoutError(null);

    const orderData = {
      cartItems: cartItems.map(item => ({
        id: String(item.id),
        title: item.title,
        price: item.price,
        quantity: item.quantity,
      })),
      totalAmount: grandTotal,
      shippingAddress: shippingAddressInput, // Ambil dari state input textarea
      customerNotes: customerNotesInput,     // Ambil dari state input textarea
      // Untuk shippingMethod dan paymentMethod, kita bisa set default atau string kosong jika belum diintegrasikan
      shippingMethod: "Standard Shipping (Default)", // Contoh default
      paymentMethod: "Awaiting Payment Confirmation (Default)", // Contoh default
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal membuat pesanan.');
      }

      console.log('Pesanan berhasil dibuat:', result.order);
      const orderId = result.order.id;

      dispatch(removeAllItemsFromCart());
      router.push(`/order-confirmation/${orderId}`);

    } catch (err: any) {
      console.error("Kesalahan saat proses pembayaran:", err);
      setCheckoutError(err.message || "Terjadi kesalahan saat membuat pesanan Anda.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (status === "loading" || !session) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-gray-600">Loading checkout...</p>
      </div>
    );
  }

  return (
    <>
      <Breadcrumb title={"Checkout"} pages={["checkout"]} />
      <section className="overflow-hidden py-20 bg-gray-200">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          {/* Kita bungkus dengan <form> agar tombol type="submit" bisa memicu handleProcessToPayment */}
          <form onSubmit={(e) => { e.preventDefault(); handleProcessToPayment(); }}>
            <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-11">
              {/* */}
              <div className="lg:max-w-[670px] w-full space-y-7.5">
                <div className="bg-white shadow-lg rounded-[10px] p-6 sm:p-8">
                  <h3 className="font-semibold text-xl text-gray-800 mb-5">Informasi Kontak</h3>
                  <p className="mb-3 text-gray-700">Login sebagai: <strong className="text-gray-900">{session.user?.name}</strong> ({session.user?.email})</p>
                </div>

                {/* Komponen Billing dan Shipping tetap dirender untuk tampilan */}
                <Billing />
                <Shipping />
                
                {/* Textarea untuk alamat pengiriman yang akan DIKIRIM ke backend */}
                <div className="bg-white shadow-lg rounded-[10px] p-6 sm:p-8">
                  <h3 className="font-semibold text-lg text-gray-800 mb-4">Alamat Pengiriman Utama</h3>
                  <label htmlFor="shippingAddress" className="block mb-2 text-sm font-medium text-gray-700">
                    Alamat Lengkap Pengiriman (Jalan, No, RT/RW, Kel/Desa, Kec, Kab/Kota, Provinsi, Kodepos) <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    name="shippingAddress"
                    id="shippingAddress"
                    rows={4}
                    placeholder="Masukkan alamat lengkap pengiriman Anda di sini..."
                    className="block w-full rounded-md border-gray-300 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 bg-gray-50"
                    value={shippingAddressInput}
                    onChange={(e) => setShippingAddressInput(e.target.value)}
                    required
                  />
                </div>

                <div className="bg-white shadow-lg rounded-[10px] p-6 sm:p-8">
                  <div>
                    <label htmlFor="notes" className="block mb-2 text-sm font-medium text-gray-700">
                      Catatan Tambahan (opsional)
                    </label>
                    <textarea
                      name="notes" id="notes" rows={5}
                      placeholder="Catatan untuk pesanan Anda, misal: permintaan khusus untuk pengiriman."
                      className="block w-full rounded-md border-gray-300 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 bg-gray-50"
                      value={customerNotesInput}
                      onChange={(e) => setCustomerNotesInput(e.target.value)}
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* */}
              <div className="lg:max-w-[455px] w-full space-y-7.5">
                <div className="bg-white shadow-lg rounded-[10px]">
                  {/* ... (Bagian "Pesanan Anda" dengan cartItems, shippingFee, grandTotal) ... */}
                  <div className="border-b border-gray-200 py-5 px-6 sm:px-8">
                    <h3 className="font-medium text-xl text-gray-800">Pesanan Anda</h3>
                  </div>
                  <div className="pt-4 pb-6 px-6 sm:px-8 space-y-3">
                    <div className="flex items-center justify-between text-sm font-medium text-gray-500 border-b border-gray-200 pb-3">
                      <span>Produk</span>
                      <span className="text-right">Subtotal</span>
                    </div>
                    {cartItems && cartItems.length > 0 ? (
                      cartItems.map((item) => (
                        <div key={item.id || item.title} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                          <div>
                            <p className="text-sm text-gray-800">{item.title} <span className="text-xs text-gray-500">x {item.quantity}</span></p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-800 text-right">
                              Rp. {(item.price * item.quantity).toLocaleString('id-ID')}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="py-5 text-center text-gray-500">Keranjang Anda kosong.</p>
                    )}
                    <div className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                      <p className="text-sm text-gray-800">Ongkos Kirim</p>
                      <p className="text-sm text-gray-800 text-right">Rp. {shippingFeeFromMethod.toLocaleString('id-ID')}</p>
                    </div>
                    <div className="flex items-center justify-between pt-4">
                      <p className="font-semibold text-lg text-gray-900">Total</p>
                      <p className="font-semibold text-lg text-gray-900 text-right">
                        Rp. {grandTotal.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                </div>
                
                <Coupon />
                <ShippingMethod />
                <PaymentMethod />

                {checkoutError && <p className="text-red-600 text-sm mt-4 text-center">{checkoutError}</p>}

                {cartItems && cartItems.length > 0 && (
                  <div className="space-y-4 mt-6">
                    <button
                      type="submit" // Tombol ini akan men-submit form dan memicu handleProcessToPayment
                      disabled={isProcessing}
                      className="w-full flex justify-center items-center font-medium text-white bg-blue-600 py-3 px-6 rounded-lg shadow-md hover:bg-blue-700 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? 'Memproses...' : 'Buat Pesanan & Lihat Nota'}
                    </button>
                    <button
                      type="button"
                      onClick={handleWhatsAppCheckout}
                      disabled={isProcessing}
                      className="w-full flex items-center justify-center font-medium text-white py-3 px-6 rounded-lg shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{ backgroundColor: '#25D366' }}
                      onMouseOver={(e) => { if(!isProcessing) e.currentTarget.style.backgroundColor = '#1DA851'}}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#25D366'}
                    >
                      <span className="mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.72.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.029 18.88c-1.161 0-2.305-.292-3.318-.844l-3.677.964.984-3.595c-.607-1.052-.927-2.246-.926-3.468.001-3.825 3.113-6.937 6.937-6.937 1.856.001 3.598.723 4.907 2.034 1.31 1.311 2.031 3.054 2.03 4.908-.001 3.825-3.113 6.938-6.937 6.938z"/></svg>
                      </span>
                      Checkout Via WhatsApp
                    </button>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default Checkout;