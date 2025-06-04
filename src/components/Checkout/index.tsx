// File: src/app/(site)/(pages)/checkout/page.tsx
"use client";

import React, { useState, useEffect } from "react"; // Tambahkan useEffect jika belum ada
import { useSelector, useDispatch } from 'react-redux';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import Breadcrumb from "@/components/Common/Breadcrumb";
import { removeAllItemsFromCart } from '@/redux/features/cart-slice';
import { RootState, useAppSelector } from '@/redux/store';

// Impor kembali komponen-komponen Anda
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

// Definisikan tipe untuk data billing dan shipping
interface BillingData {
  firstName: string;
  lastName: string;
  companyName?: string;
  countryRegion: string;
  streetAddress: string;
  apartmentSuite?: string;
  townCity: string;
  stateCounty?: string; // Atau province
  postcodeZip: string;
  phone: string;
  emailAddress: string;
  // Tambahkan field lain jika ada
}

interface ShippingData {
  fullName: string; // Atau pisah jadi firstName, lastName
  fullAddress: string;
  phoneNumber: string;
  // Tambahkan field lain jika ada
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
  
  // State untuk data dari komponen Billing dan Shipping
  // Inisialisasi dengan nilai default atau data dari sesi jika ada
  const [billingDetails, setBillingDetails] = useState<Partial<BillingData>>({
    emailAddress: session?.user?.email || '',
    firstName: session?.user?.name?.split(' ')[0] || '',
    lastName: session?.user?.name?.split(' ').slice(1).join(' ') || '',
    // Inisialisasi field lain jika perlu
  });

  const [shippingDetails, setShippingDetails] = useState<Partial<ShippingData>>({});
  const [useSameAsBilling, setUseSameAsBilling] = useState(true); // Opsi untuk "kirim ke alamat penagihan"

  // State untuk metode pengiriman dan pembayaran (contoh sederhana)
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<string | null>(null); // Misal: 'standard', 'express'
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null); // Misal: 'bank_transfer', 'cod'


  // Hitung ongkos kirim berdasarkan metode yang dipilih (contoh)
  const calculateShippingFee = () => {
    if (selectedShippingMethod === 'express') return 75000;
    if (selectedShippingMethod === 'standard') return 45000;
    return 0; // Default atau jika belum dipilih
  };
  const shippingFee = calculateShippingFee();
  const grandTotal = productsSubtotal + shippingFee;

  // State untuk catatan pelanggan, dll.
  const [customerNotes, setCustomerNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Update shippingDetails jika "useSameAsBilling" berubah
  useEffect(() => {
    if (useSameAsBilling) {
      setShippingDetails({
        fullName: `${billingDetails.firstName || ''} ${billingDetails.lastName || ''}`.trim(),
        fullAddress: `${billingDetails.streetAddress || ''}, ${billingDetails.townCity || ''}, ${billingDetails.postcodeZip || ''}, ${billingDetails.countryRegion || ''}`, // Sesuaikan format
        phoneNumber: billingDetails.phone || '',
      });
    } else {
      // Kosongkan shippingDetails jika tidak sama dengan billing
      // atau biarkan pengguna mengisinya manual
      setShippingDetails({}); 
    }
  }, [useSameAsBilling, billingDetails]);


  const handleWhatsAppCheckout = (e: React.MouseEvent<HTMLButtonElement>) => { /* ... (logika tetap sama) ... */ };

  const handleProcessToPayment = async () => {
    if (!session?.user) { /* ... (validasi sesi) ... */ }
    if (cartItems.length === 0) { /* ... (validasi keranjang) ... */ }

    // Kumpulkan semua data yang diperlukan, termasuk dari billingDetails dan shippingDetails
    let finalShippingAddress = '';
    if (useSameAsBilling) {
      finalShippingAddress = `${billingDetails.streetAddress || ''}, ${billingDetails.apartmentSuite || ''}, ${billingDetails.townCity || ''}, ${billingDetails.stateCounty || ''} ${billingDetails.postcodeZip || ''}, ${billingDetails.countryRegion || ''}`;
    } else {
      finalShippingAddress = shippingDetails.fullAddress || ''; // Ambil dari state shippingDetails
    }
    
    if (!finalShippingAddress.trim()) {
        setCheckoutError("Mohon isi alamat pengiriman Anda.");
        return;
    }
    if (!selectedShippingMethod) {
        setCheckoutError("Mohon pilih metode pengiriman.");
        return;
    }
    if (!selectedPaymentMethod) {
        setCheckoutError("Mohon pilih metode pembayaran.");
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
      // Kumpulkan data billing dan shipping di sini untuk dikirim ke API
      billingDetails: { ...billingDetails }, // Kirim semua detail billing
      shippingAddress: finalShippingAddress,
      shippingMethod: selectedShippingMethod,
      paymentMethod: selectedPaymentMethod,
      customerNotes: customerNotes,
    };

    try {
      const response = await fetch('/api/orders', { /* ... (fetch API) ... */ });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Gagal membuat pesanan.');
      
      const orderId = result.order.id;
      dispatch(removeAllItemsFromCart());
      router.push(`/order-confirmation/${orderId}`);
    } catch (err: any) { /* ... (penanganan error) ... */ } 
    finally { setIsProcessing(false); }
  };

  if (status === "loading" || !session) { /* ... (loading state) ... */ }

  return (
    <>
      <Breadcrumb title={"Checkout"} pages={["checkout"]} />
      <section className="overflow-hidden py-20 bg-gray-200">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          {/* PENTING: Komponen <Billing />, <Shipping />, <ShippingMethod />, <PaymentMethod />
            perlu menerima props untuk state dan fungsi onChange-nya agar data bisa
            dikelola oleh komponen Checkout ini (pendekatan Lifting State Up).
            Contoh: <Billing details={billingDetails} onChange={handleBillingChange} />
            
            Atau, jika komponen tersebut mengelola state internal, Anda perlu cara untuk 
            mengambil data finalnya saat form disubmit (misalnya menggunakan `useImperativeHandle` 
            dengan `ref`, atau library form).

            Untuk sekarang, saya akan berikan placeholder bagaimana mereka dirender.
            Anda perlu memodifikasi komponen-komponen tersebut.
          */}
          <form onSubmit={(e) => { e.preventDefault(); handleProcessToPayment(); }}>
            <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-11">
              {/* */}
              <div className="lg:max-w-[670px] w-full space-y-7.5">
                {/* Komponen Billing akan menerima data billingDetails dan fungsi untuk mengupdatenya */}
                <Billing 
                />

                {/* Opsi untuk menggunakan alamat yang sama */}
                <div className="bg-white shadow-lg rounded-[10px] p-6 sm:p-8">
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={useSameAsBilling}
                      onChange={(e) => setUseSameAsBilling(e.target.checked)}
                      className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    Kirim ke alamat penagihan yang sama
                  </label>
                </div>

                {!useSameAsBilling && (
                  // Komponen Shipping akan menerima data shippingDetails dan fungsi untuk mengupdatenya
                  <Shipping 
                  />
                )}
                
                <div className="bg-white shadow-lg rounded-[10px] p-6 sm:p-8">
                  <div>
                    <label htmlFor="notes" className="block mb-2 text-sm font-medium text-gray-700">
                      Catatan Tambahan (opsional)
                    </label>
                    <textarea
                      name="notes" id="notes" rows={5}
                      placeholder="Catatan untuk pesanan Anda..."
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 bg-gray-50"
                      value={customerNotes}
                      onChange={(e) => setCustomerNotes(e.target.value)}
                    />
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
                    {/* ... (Loop cartItems) ... */}
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
                      <p className="text-sm text-gray-800 text-right">Rp. {shippingFee.toLocaleString('id-ID')}</p>
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
                <ShippingMethod 
                />
                <PaymentMethod 
                />

                {checkoutError && <p className="text-red-600 text-sm mt-4 text-center">{checkoutError}</p>}

                {cartItems && cartItems.length > 0 && (
                  <div className="space-y-4 mt-6">
                    <button
                      type="submit"
                      disabled={isProcessing || !selectedShippingMethod || !selectedPaymentMethod} // Disable jika sedang proses atau metode belum dipilih
                      className="w-full flex justify-center items-center font-medium text-white bg-blue-600 py-3 px-6 rounded-lg shadow-md hover:bg-blue-700 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? 'Memproses...' : 'Buat Pesanan & Lihat Nota'}
                    </button>
                    {/* ... (Tombol WhatsApp Checkout) ... */}
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