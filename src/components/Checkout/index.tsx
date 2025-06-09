// File: src/app/(site)/(pages)/checkout/page.tsx (atau di mana komponen Checkout utamamu berada)
"use client";

import React, { useState, useEffect } from "react"; // Pastikan useEffect diimpor jika digunakan
import { useSelector, useDispatch } from 'react-redux';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import Breadcrumb from "@/components/Common/Breadcrumb";
import { removeAllItemsFromCart } from '@/redux/features/cart-slice'; // PASTIKAN PATH INI BENAR
// Jika Anda sudah setup RootState dan useAppSelector, gunakan ini:
import { RootState, useAppSelector } from '@/redux/store'; // PASTIKAN PATH INI BENAR

// Komponen-komponen ini akan dirender untuk tampilan,
// tapi data input spesifik dari mereka belum kita ambil di handleProcessToPayment untuk versi ini    // Sesuaikan path jika perlu
import Shipping from "@/components/Checkout/Shipping";   // Sesuaikan path jika perlu
import ShippingMethod from "@/components/Checkout/ShippingMethod"; // Sesuaikan path jika perlu
import PaymentMethod from "@/components/Checkout/PaymentMethod"; // Sesuaikan path jika perlu

interface CartItem {
  id: string;
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
  
  // Untuk saat ini, kita akan hardcode ongkos kirim dan metode di data yang dikirim.
  // Nantinya, ini bisa diambil dari state yang diupdate oleh komponen ShippingMethod dan PaymentMethod.
  const hardcodedShippingFee = 45000;
  const hardcodedShippingMethodName = "Standard Shipping (Default)";
  const hardcodedPaymentMethodName = "Awaiting Payment Confirmation (Default)";
  
  const grandTotal = productsSubtotal + hardcodedShippingFee;

  // State HANYA untuk input yang benar-benar akan kita kirim dari form utama Checkout ini
  const [shippingAddressMainInput, setShippingAddressMainInput] = useState(''); // Data dari textarea alamat
  const [customerNotesMainInput, setCustomerNotesMainInput] = useState('');   // Data dari textarea catatan
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handleWhatsAppCheckout = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!cartItems || cartItems.length === 0) {
      alert("Keranjang Anda kosong!");
      return;
    }
    const orderItemsText = cartItems.map(item =>
      `- ${item.title} (x${item.quantity}): Rp. ${((item.discountedPrice || item.price) * item.quantity).toLocaleString('id-ID')}`
    ).join('\n');
    
    const displayAddress = shippingAddressMainInput.trim() || "Alamat belum diisi";
    const message = `Halo, saya ingin melakukan pembayaran pesanan saya dengan item berikut:\n${orderItemsText}\nAlamat Pengiriman: ${displayAddress}\nBiaya Pengiriman: Rp. ${hardcodedShippingFee.toLocaleString('id-ID')}\nTotal: Rp. ${grandTotal.toLocaleString('id-ID')}\nOrder ID: #ORDER${Date.now()} (User: ${session?.user?.email || 'Guest'})`;
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
    if (!shippingAddressMainInput.trim()) { 
      setCheckoutError("Mohon isi alamat pengiriman Anda di kolom 'Alamat Pengiriman Utama'.");
      return;
    }
console.log("Isi cartItems sebelum dikirim ke API:", JSON.stringify(cartItems, null, 2));
const invalidCartItem = cartItems.find(item => typeof item.id !== 'string' || !item.id.startsWith('c'));

    if (invalidCartItem) {
      setCheckoutError(`Produk "${invalidCartItem.title}" memiliki ID yang tidak valid di keranjang Anda. Mohon hapus produk tersebut dan tambahkan kembali dari halaman toko.`);
      // Scroll ke atas agar pengguna melihat pesan error
      window.scrollTo(0, 0); 
      return;
    }
    setIsProcessing(true);
    setCheckoutError(null);

    // Data yang dikirim ke backend HANYA dari state yang dikelola Checkout.tsx ini
    const orderData = {
      cartItems: cartItems.map(item => ({
        id: item.id,
        title: item.title,
        price: item.discountedPrice || item.price,
        quantity: item.quantity,
      })),
      totalAmount: grandTotal, // Ini sudah termasuk ongkos kirim
      shippingAddress: shippingAddressMainInput, 
      customerNotes: customerNotesMainInput,     
      shippingMethod: hardcodedShippingMethodName, 
      paymentMethod: hardcodedPaymentMethodName, 
      // Data billing dummy atau diambil dari sesi jika API Anda membutuhkannya
      billingDetails: {
        firstName: session.user.name?.split(' ')[0] || 'Pelanggan',
        lastName: session.user.name?.split(' ').slice(1).join(' ') || '',
        emailAddress: session.user.email || 'tidakdiketahui@example.com',
        phone: '000', // Dummy
        countryRegion: 'Indonesia', // Default
        streetAddress: shippingAddressMainInput, // Bisa disamakan jika billing tidak diisi terpisah
        townCity: 'Kota Dummy', // Dummy
        postcodeZip: '00000', // Dummy
        // Anda bisa menambahkan field lain dengan nilai dummy jika skema Order memerlukannya
      }
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      const result = await response.json();
      if (!response.ok) {
        console.error("API Error Data:", result);
        throw new Error(result.message || `Gagal membuat pesanan. Status: ${response.status}`);
      }
      
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
  
  const buttonPrimaryStyle: React.CSSProperties = {
    width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center',
    fontWeight: '500', color: 'white', backgroundColor: '#3B82F6',
    padding: '0.875rem 1.5rem', borderRadius: '0.5rem',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
    transition: 'background-color 0.15s ease-in-out', cursor: 'pointer', border: 'none',
  };
  const buttonWhatsAppStyle: React.CSSProperties = {
    ...buttonPrimaryStyle,
    backgroundColor: '#25D366',
  };
  const disabledButtonStyle: React.CSSProperties = {
    opacity: 0.6,
    cursor: 'not-allowed',
  };

  return (
    <>
      <Breadcrumb title={"Checkout"} pages={["checkout"]} />
      <section className="overflow-hidden py-20 bg-gray-100">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <form onSubmit={(e) => { e.preventDefault(); handleProcessToPayment(); }}>
            <div className="flex flex-col lg:flex-row gap-8 xl:gap-12">
              {/* */}
              <div className="w-full lg:w-2/3 space-y-8">
                <div className="bg-white shadow-md rounded-lg p-6 sm:p-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6">Contact</h3>
                  <p className="text-sm text-gray-600">Login as: 
                    <strong className="text-gray-900"> {session.user?.name}</strong> ({session.user?.email})
                  </p>
                </div>

                {/* Komponen Billing dan Shipping dirender untuk tampilan saja */}
                <Shipping /> 
                
                {/* Textarea untuk alamat pengiriman yang akan DIKIRIM ke backend */}
                <div className="bg-white shadow-md rounded-lg p-6 sm:p-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Main Address</h3>
                  <label htmlFor="shippingAddress" className="block mb-2 text-sm font-medium text-gray-700">
                    Complete Delivery Address (Street, No., RT/RW, Village/Kelurahan, District, City/Regency, Province, Postal Code) <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    name="shippingAddress"
                    id="shippingAddress"
                    rows={4}
                    placeholder="Type your complete shipping address here..."
                    className="block w-full rounded-md border-gray-300 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 bg-gray-50"
                    value={shippingAddressMainInput}
                    onChange={(e) => setShippingAddressMainInput(e.target.value)}
                    required
                  />
                </div>

                <div className="bg-white shadow-md rounded-lg p-6 sm:p-8">
                  <div>
                    <label htmlFor="notes" className="block mb-2 text-sm font-medium text-gray-700">
                      Additional Notes (opsional)
                    </label>
                    <textarea
                      name="notes" id="notes" rows={5}
                      placeholder="Notes for your order, Ex: special notes for delivery."
                      className="block w-full rounded-md border-gray-300 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 bg-gray-50"
                      value={customerNotesMainInput}
                      onChange={(e) => setCustomerNotesMainInput(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* */}
              <div className="w-full lg:w-1/3 space-y-8">
                {/* Order Summary (Ringkasan Pesanan) */}
                <div className="bg-white shadow-lg rounded-[10px]">
                  <div className="border-b border-gray-200 py-5 px-6 sm:px-8">
                    <h3 className="font-medium text-xl text-gray-800">Your Order</h3>
                  </div>
                  <div className="pt-4 pb-6 px-6 sm:px-8 space-y-3">
                    <div className="flex items-center justify-between text-sm font-medium text-gray-500 border-b border-gray-200 pb-3">
                      <span>Product</span>
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
                              Rp. {((item.discountedPrice || item.price) * item.quantity).toLocaleString('id-ID')}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="py-5 text-center text-gray-500">Your cart is empty</p>
                    )}
                    <div className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                      <p className="text-sm text-gray-800">Shipping</p>
                      <p className="text-sm text-gray-800 text-right">Rp. {hardcodedShippingFee.toLocaleString('id-ID')}</p>
                    </div>
                    <div className="flex items-center justify-between pt-4">
                      <p className="font-semibold text-lg text-gray-900">Total</p>
                      <p className="font-semibold text-lg text-gray-900 text-right">
                        Rp. {grandTotal.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Komponen ini dirender untuk tampilan, datanya belum diambil aktif */}
                <ShippingMethod /> 
                <PaymentMethod />

                {checkoutError && <p style={{color: 'red', textAlign: 'center', marginTop: '1rem'}}>{checkoutError}</p>}

                {cartItems && cartItems.length > 0 && (
                  <div style={{marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                    <button
                      type="submit" // Akan memicu onSubmit pada <form>
                      disabled={isProcessing}
                      style={{
                        ...buttonPrimaryStyle,
                        ...(isProcessing ? disabledButtonStyle : {} )
                      }}
                      onMouseOver={(e) => { if(!isProcessing) (e.target as HTMLButtonElement).style.backgroundColor = '#2563EB';}}
                      onMouseOut={(e) => { if(!isProcessing) (e.target as HTMLButtonElement).style.backgroundColor = '#3B82F6';}}
                    >
                      {isProcessing ? 'Processing...' : 'Process to Payment'}
                    </button>
                    <button
                      type="button"
                      onClick={handleWhatsAppCheckout}
                      disabled={isProcessing}
                      style={{
                        ...buttonWhatsAppStyle,
                        ...(isProcessing ? disabledButtonStyle : {})
                      }}
                      onMouseOver={(e) => { if(!isProcessing) (e.target as HTMLButtonElement).style.backgroundColor = '#1DA851';}}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#25D366'}
                    >
                      <span style={{ marginRight: '0.5rem' }}>
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