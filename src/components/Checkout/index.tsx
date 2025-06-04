// File: src/app/(site)/(pages)/checkout/page.tsx
"use client";

import React, { useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import Breadcrumb from "@/components/Common/Breadcrumb";
import { removeAllItemsFromCart } from '@/redux/features/cart-slice';
import { RootState, useAppSelector } from '@/redux/store';

// Anda bisa tetap merender komponen UI ini untuk tampilan,
// tapi kita tidak akan mengambil data input dari mereka untuk proses order saat ini.
import Billing from "@/components/Checkout/Billing";
import Shipping from "@/components/Checkout/Shipping";
import ShippingMethod from "@/components/Checkout/ShippingMethod";
import PaymentMethod from "@/components/Checkout/PaymentMethod";
import Coupon from "@/components/Checkout/Coupon";

interface CartItem {
  id: string | number;
  title: string;
  price: number;
  quantity: number;
  discountedPrice?: number;
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
  const productsSubtotal = cartItems.reduce((acc, item) => acc + ((item.discountedPrice || item.price) * item.quantity), 0);
  
  // Asumsi ongkos kirim dan metode pembayaran/pengiriman bisa kita set default untuk sekarang
  const shippingFee = 45000; // Contoh statis
  const grandTotal = productsSubtotal + shippingFee;

  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handleWhatsAppCheckout = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!cartItems || cartItems.length === 0) { /* ... validasi keranjang ... */ return; }
   const orderItemsText = cartItems.map(item => 
  `- ${item.title} (x${item.quantity}): Rp. ${((item.discountedPrice || item.price) * item.quantity).toLocaleString('id-ID')}`
).join('\n');
    const message = `Halo, saya ingin checkout via WhatsApp...\n${orderItemsText}\nTotal: Rp. ${grandTotal.toLocaleString('id-ID')}`; // Sederhanakan pesan WA
    const phoneNumber = "6283189082839";
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, '_blank');
  };

  const handleProcessToPayment = async () => {
    if (!session?.user || cartItems.length === 0) {
      setCheckoutError("Anda harus login dan keranjang tidak boleh kosong.");
      setIsProcessing(false); // Pastikan loading dihentikan
      return;
    }

    setIsProcessing(true);
    setCheckoutError(null);

    // Data dummy/placeholder untuk alamat dan info lain
    const dummyShippingAddress = `Alamat Pengiriman Dummy - User: ${session.user.email || 'Tidak diketahui'}`;
    const dummyCustomerNotes = "Tidak ada catatan khusus.";
    const dummyShippingMethod = "Pengiriman Standar (Dummy)";
    const dummyPaymentMethod = "Menunggu Konfirmasi (Dummy)";

    const orderData = {
      cartItems: cartItems.map(item => ({
        id: String(item.id),
        title: item.title,
        price: item.discountedPrice || item.price,
        quantity: item.quantity,
      })),
      totalAmount: grandTotal,
      shippingAddress: dummyShippingAddress,
      customerNotes: dummyCustomerNotes,
      shippingMethod: dummyShippingMethod,
      paymentMethod: dummyPaymentMethod,
      // billingDetails bisa dikosongkan atau diisi data dummy juga jika API mengharapkannya
      billingDetails: {
        firstName: session.user.name?.split(' ')[0] || 'Guest',
        lastName: session.user.name?.split(' ').slice(1).join(' ') || 'User',
        emailAddress: session.user.email || 'guest@example.com',
        phone: '0000000000', // Dummy
        // Field lain bisa dikosongkan atau diisi dummy
        countryRegion: 'Indonesia',
        streetAddress: 'Alamat Dummy',
        townCity: 'Kota Dummy',
        postcodeZip: '00000',
      }
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Gagal membuat pesanan.');
      
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
    return <div className="flex justify-center items-center h-screen"><p className="text-lg text-gray-600">Loading checkout...</p></div>;
  }

  // Gaya dasar untuk tombol jika Tailwind tidak bekerja sempurna
  const buttonPrimaryStyle: React.CSSProperties = { /* ... (gaya dari respons sebelumnya) ... */ };
  const buttonWhatsAppStyle: React.CSSProperties = { /* ... (gaya dari respons sebelumnya) ... */ };
  const disabledButtonStyle: React.CSSProperties = { opacity: 0.6, cursor: 'not-allowed' };

  return (
    <>
      <Breadcrumb title={"Checkout"} pages={["checkout"]} />
      <section className="overflow-hidden py-20 bg-gray-100">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          {/* Kita bisa hilangkan tag <form> jika submit hanya dari satu tombol spesifik */}
          {/* atau biarkan jika ingin enter di field (jika ada) bisa submit */}
          <div className="flex flex-col lg:flex-row gap-8 xl:gap-12">
            {/* */}
            <div className="w-full lg:w-2/3 space-y-8">
              <div className="bg-white shadow-md rounded-lg p-6 sm:p-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Informasi Kontak</h3>
                <p className="text-sm text-gray-600">Login sebagai: 
                  <strong className="text-gray-900"> {session.user?.name}</strong> ({session.user?.email})
                </p>
              </div>

              {/* Komponen ini hanya untuk tampilan, tidak mengambil input untuk orderData saat ini */}
              <Billing />
              <Shipping /> 
              
              {/* Catatan Tambahan (opsional, bisa diisi user atau dikirim dummy) */}
              <div className="bg-white shadow-md rounded-lg p-6 sm:p-8">
                <div>
                  <label htmlFor="notes" className="block mb-2 text-sm font-medium text-gray-700">
                    Catatan Tambahan (opsional)
                  </label>
                  <textarea
                    name="notes" id="notes" rows={4}
                    placeholder="Catatan untuk pesanan Anda..."
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 bg-gray-50 placeholder-gray-400"
                    // value={customerNotes} // Jika ingin tetap ada inputnya
                    // onChange={(e) => setCustomerNotes(e.target.value)}
                    readOnly // Atau biarkan bisa diisi tapi tidak wajib
                  />
                </div>
              </div>
            </div>

            {/* */}
            <div className="w-full lg:w-1/3 space-y-8">
              
              {/* Komponen ini hanya untuk tampilan */}
              <Coupon />
              <ShippingMethod />
              <PaymentMethod />

              {checkoutError && <p style={{color: 'red', textAlign: 'center', marginTop: '1rem'}}>{checkoutError}</p>}

              {cartItems && cartItems.length > 0 && (
                <div className="mt-6">
                  <button
                    type="button" // Ubah ke button agar tidak submit form secara default
                    onClick={handleProcessToPayment} // Panggil fungsi ini
                    disabled={isProcessing}
                    style={{
                      ...buttonPrimaryStyle,
                      ...(isProcessing ? disabledButtonStyle : {})
                    }}
                    onMouseOver={(e) => { if(!isProcessing) (e.target as HTMLButtonElement).style.backgroundColor = '#2563EB';}}
                    onMouseOut={(e) => { if(!isProcessing) (e.target as HTMLButtonElement).style.backgroundColor = '#3B82F6';}}
                  >
                    {isProcessing ? 'Memproses...' : 'Lanjutkan & Lihat Nota'}
                  </button>
                  {/* Tombol WhatsApp bisa Anda sisakan jika masih ingin ada opsi itu */}
                  {/* <button type="button" onClick={handleWhatsAppCheckout} ... /> */}
                </div>
              )}
            </div>
          </div>
          {/* </form> */} {/* Tutup form jika masih digunakan */}
        </div>
      </section>
    </>
  );
};

export default Checkout;