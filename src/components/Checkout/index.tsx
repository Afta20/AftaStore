// Di file komponen Checkout utama Anda
"use client";

import React from "react";
import { useSelector } from 'react-redux';
import { useSession } from "next-auth/react"; // Impor useSession
import { useRouter } from "next/navigation"; // Impor useRouter dari next/navigation

import Breadcrumb from "@/components/Common/Breadcrumb"; // Sesuaikan path jika perlu
// Komponen-komponen yang mungkin tidak lagi diperlukan jika user sudah pasti login:
// import Login from "./Login"; 
import Billing from "./Billing";       // Anda mungkin ingin menampilkan data user di sini
import Shipping from "./Shipping";     // Anda mungkin ingin menampilkan data user di sini
import ShippingMethod from "./ShippingMethod";
import PaymentMethod from "./PaymentMethod";
import Coupon from "./Coupon";

// Impor RootState dan useAppSelector jika Anda mau type safety (opsional tapi bagus)
// import { RootState, useAppSelector } from '@/redux/store'; // Sesuaikan path

const Checkout = () => {
  const router = useRouter();

  // Gunakan useSession untuk mendapatkan data sesi dan status
  const { data: session, status } = useSession({
    required: true, // Ini akan memastikan pengguna harus login
    onUnauthenticated() {
      // Fungsi ini akan dipanggil jika pengguna tidak terautentikasi
      // Arahkan ke halaman login, tambahkan callbackUrl agar setelah login kembali ke checkout
      router.push("/signin?callbackUrl=/checkout");
    },
  });

  // Mengambil data keranjang dari Redux (pastikan path state benar: state.cartReducer.items)
  // Jika menggunakan useAppSelector yang sudah diketik:
  // const cartItems = useAppSelector((state: RootState) => state.cartReducer?.items || []);
  // const productsSubtotal = useAppSelector((state: RootState) => 
  //   state.cartReducer?.items?.reduce((acc, item) => acc + (item.price * item.quantity), 0) || 0
  // );
  // ATAU dengan useSelector biasa:
  const cartItems = useSelector((state: any) => state.cartReducer?.items || []);
  const productsSubtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  const shippingFee = 45000; // Contoh, bisa dibuat dinamis nanti
  const grandTotal = productsSubtotal + shippingFee;

  // Fungsi untuk checkout via WhatsApp (menggunakan data dinamis)
  const handleWhatsAppCheckout = (e) => {
    e.preventDefault();
    if (!cartItems || cartItems.length === 0) {
      alert("Keranjang Anda kosong!");
      return;
    }

    const orderItemsText = cartItems.map(item =>
      `- ${item.title} (x${item.quantity}): Rp. ${(item.price * item.quantity).toLocaleString('id-ID')}`
    ).join('\n');

    const message = `Halo, saya ingin melakukan pembayaran pesanan saya dengan item berikut:
${orderItemsText}
Biaya Pengiriman: Rp. ${shippingFee.toLocaleString('id-ID')}
Total: Rp. ${grandTotal.toLocaleString('id-ID')}
Order ID: #ORDER${Date.now()} (User: ${session?.user?.email || 'Guest'})`; // Tambahkan email user jika ada

    const phoneNumber = "6283189082839";
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, '_blank');
  };

  // Tampilkan pesan loading selagi status sesi sedang dicek
  // atau jika belum terautentikasi (sebelum onUnauthenticated melakukan redirect)
  if (status === "loading" || !session) {
    // Pastikan session juga dicek, karena status bisa authenticated tapi session masih null sesaat
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading checkout...</p> {/* Ganti dengan spinner/skeleton yang lebih baik */}
      </div>
    );
  }

  // Jika sudah terautentikasi (status === "authenticated" dan session ada),
  // tampilkan konten halaman checkout.
  return (
    <>
      <Breadcrumb title={"Checkout"} pages={["checkout"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <form> {/* Form ini mungkin akan digunakan untuk submit ke backend nanti */}
            <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-11">
              {/* */}
              <div className="lg:max-w-[670px] w-full">
                {/* Komponen Login tidak lagi diperlukan di sini karena halaman sudah diproteksi */}
                {/* <Login /> */}

                {/* Anda bisa langsung menampilkan data user yang login di Billing atau Shipping */}
                <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5">
                  <h3 className="font-semibold text-lg text-dark mb-4">Billing & Shipping Information</h3>
                  <p className="mb-2">Logged in as: <strong>{session.user?.name}</strong> ({session.user?.email})</p>
                  {/* Di sini Anda akan meletakkan komponen <Billing /> dan <Shipping /> */}
                  {/* Atau form untuk input alamat jika belum ada */}
                  <Billing /> {/* Pastikan Billing mengambil/menerima data user jika perlu */}
                  <Shipping /> {/* Pastikan Shipping mengambil/menerima data user jika perlu */}
                </div>

                {/* */}
                <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5 mt-7.5">
                  <div>
                    <label htmlFor="notes" className="block mb-2.5">
                      Other Notes (optional)
                    </label>
                    <textarea
                      name="notes"
                      id="notes"
                      rows={5}
                      placeholder="Notes about your order, e.g. speacial notes for delivery."
                      className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full p-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* */}
              <div className="max-w-[455px] w-full">
                <div className="bg-white shadow-1 rounded-[10px]">
                  <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
                    <h3 className="font-medium text-xl text-dark">Your Order</h3>
                  </div>
                  <div className="pt-2.5 pb-8.5 px-4 sm:px-8.5">
                    <div className="flex items-center justify-between py-5 border-b border-gray-3">
                      <div><h4 className="font-medium text-dark">Product</h4></div>
                      <div><h4 className="font-medium text-dark text-right">Subtotal</h4></div>
                    </div>
                    {cartItems && cartItems.length > 0 ? (
                      cartItems.map((item) => (
                        // Pastikan item memiliki 'id' yang unik atau gunakan index jika tidak ada
                        <div key={item.id || item.title} className="flex items-center justify-between py-5 border-b border-gray-3">
                          <div>
                            <p className="text-dark">{item.title} <span className="text-sm text-gray-500">x {item.quantity}</span></p>
                          </div>
                          <div>
                            <p className="text-dark text-right">
                              Rp. {(item.price * item.quantity).toLocaleString('id-ID')}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="py-5 text-center text-gray-500">Your cart is empty.</p>
                    )}
                    <div className="flex items-center justify-between py-5 border-b border-gray-3">
                      <div><p className="text-dark">Shipping Fee</p></div>
                      <div><p className="text-dark text-right">Rp. {shippingFee.toLocaleString('id-ID')}</p></div>
                    </div>
                    <div className="flex items-center justify-between pt-5">
                      <div><p className="font-medium text-lg text-dark">Total</p></div>
                      <div>
                        <p className="font-medium text-lg text-dark text-right">
                          Rp. {grandTotal.toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* */}
                <Coupon />

                {/* */}
                <ShippingMethod />

                {/* */}
                <PaymentMethod />

                {/* */}
                {cartItems && cartItems.length > 0 && ( // Hanya tampilkan tombol jika ada item
                  <>
                    <button
                      type="submit" // Ini mungkin akan diubah untuk submit ke API order
                      className="w-full flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5"
                      onClick={(e) => {
                        e.preventDefault(); // Sementara, agar tidak submit form HTML
                        alert("Proses ke pembayaran backend belum diimplementasikan.");
                        // Nanti di sini akan ada logika untuk kirim data ke API order
                      }}
                    >
                      Process to Payment (Backend)
                    </button>
                    <button
                      type="button"
                      onClick={handleWhatsAppCheckout}
                      className="w-full flex items-center justify-center font-medium text-white py-3 px-6 rounded-md ease-out duration-200 mt-4"
                      style={{ backgroundColor: '#25D366' }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#128C7E'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#25D366'}
                    >
                      <span className="mr-2">
                        {/* WhatsApp SVG icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.72.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.029 18.88c-1.161 0-2.305-.292-3.318-.844l-3.677.964.984-3.595c-.607-1.052-.927-2.246-.926-3.468.001-3.825 3.113-6.937 6.937-6.937 1.856.001 3.598.723 4.907 2.034 1.31 1.311 2.031 3.054 2.03 4.908-.001 3.825-3.113 6.938-6.937 6.938z"/>
                        </svg>
                      </span>
                      Checkout Via WhatsApp
                    </button>
                  </>
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