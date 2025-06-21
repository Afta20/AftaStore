"use client";
import React, { useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Image from "next/image";
import AddressModal from "./AddressModal";
import Orders from "../Orders";
import { useSession, signOut } from "next-auth/react"; // Impor useSession dan signOut

const MyAccount = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [addressModal, setAddressModal] = useState(false);

  // Mengambil data sesi pengguna yang sedang login
  const { data: session, status } = useSession({
    required: true, // Akan mengarahkan ke halaman login jika belum login
  });

  const openAddressModal = () => {
    setAddressModal(true);
  };

  const closeAddressModal = () => {
    setAddressModal(false);
  };

  // Menampilkan pesan loading saat sesi sedang diverifikasi
  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p className="text-lg">Loading Your Account...</p>
      </div>
    );
  }

  // Jika tidak ada sesi, tampilkan pesan (seharusnya jarang terjadi karena `required: true`)
  if (!session) {
    return <div>Please sign in to view your account.</div>;
  }

  // Memecah nama untuk ditampilkan di form
  const nameParts = session.user?.name?.split(" ") || ["", ""];
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ");

  return (
    <>
      <Breadcrumb title={"My Account"} pages={["my account"]} />

      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-col xl:flex-row gap-7.5">
            {/* */}
            <div className="xl:max-w-[370px] w-full bg-white rounded-xl shadow-1">
              <div className="flex xl:flex-col">
                <div className="hidden lg:flex flex-wrap items-center gap-5 py-6 px-4 sm:px-7.5 xl:px-9 border-r xl:border-r-0 xl:border-b border-gray-3">
                  <div className="max-w-[64px] w-full h-16 rounded-full overflow-hidden">
                    {/* DATA DINAMIS: Gambar Profil dari Sesi */}
                    <Image
                      src={session.user?.image || "/images/users/default-avatar.png"}
                      alt="user"
                      width={64}
                      height={64}
                    />
                  </div>

                  <div>
                    {/* DATA DINAMIS: Nama dari Sesi */}
                    <p className="font-medium text-dark mb-0.5">
                      {session.user?.name || "User"}
                    </p>
                    <p className="text-custom-xs">Member Afta-Store</p>
                  </div>
                </div>

                <div className="p-4 sm:p-7.5 xl:p-9">
                  <div className="flex flex-wrap xl:flex-nowrap xl:flex-col gap-4">
                    <button onClick={() => setActiveTab("dashboard")} className={`flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-blue hover:text-white ${ activeTab === "dashboard" ? "text-white bg-blue" : "text-dark-2 bg-gray-1" }`} >
                      <svg className="fill-current" width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" >
                        <path fillRule="evenodd" clipRule="evenodd" d="M5.91002 1.60413... (SVG code) ...Z" fill=""/>
                      </svg>
                      Dashboard
                    </button>
                    <button onClick={() => setActiveTab("addresses")} className={`flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-blue hover:text-white ${ activeTab === "addresses" ? "text-white bg-blue" : "text-dark-2 bg-gray-1" }`} >
                      <svg className="fill-current" width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" >
                        <path d="M8.25065 15.8125C7.87096 15.8125... (SVG code) ...4.12875Z" fill=""/>
                      </svg>
                      Addresses
                    </button>
                    <button onClick={() => setActiveTab("account-details")} className={`flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-blue hover:text-white ${ activeTab === "account-details" ? "text-white bg-blue" : "text-dark-2 bg-gray-1" }`} >
                      <svg className="fill-current" width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" >
                        <path fillRule="evenodd" clipRule="evenodd" d="M10.9995 1.14581C8.59473... (SVG code) ...4.35364 16.0416Z" fill=""/>
                      </svg>
                      Account Details
                    </button>
                    <button onClick={() => signOut()} className={`flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-blue hover:text-white text-dark-2 bg-gray-1`}>
                      <svg className="fill-current" width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" >
                        <path d="M13.7005 1.14581C12.4469... (SVG code) ...Z" fill=""/>
                        <path d="M13.7507 10.3125C14.1303... (SVG code) ...77197L3.69247 10.3125H13.7507Z" fill=""/>
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* */}

            {/* */}
            <div className={`xl:max-w-[770px] w-full bg-white rounded-xl shadow-1 py-9.5 px-4 sm:px-7.5 xl:px-10 ${ activeTab === "dashboard" ? "block" : "hidden" }`} >
              {/* DATA DINAMIS: Nama di pesan selamat datang */}
              <p className="text-dark">
                Hello {session.user?.name} (not {session.user?.name}?
                <button onClick={() => signOut()} className="text-red ease-out duration-200 hover:underline ml-1">
                  Log Out
                </button>
                )
              </p>
              <p className="text-custom-sm mt-4">
                From your account dashboard you can view your recent orders,
                manage your shipping and billing addresses, and edit your
                password and account details.
              </p>
            </div>
            
            <div className={`xl:max-w-[770px] w-full bg-white rounded-xl shadow-1 ${ activeTab === "orders" ? "block" : "hidden" }`}>
              <Orders />
            </div>
            
            <div className={`xl:max-w-[770px] w-full bg-white rounded-xl shadow-1 py-9.5 px-4 sm:px-7.5 xl:px-10 ${ activeTab === "downloads" ? "block" : "hidden" }`}>
              <p>You don&apos;t have any download</p>
            </div>
            
            <div className={`flex-col sm:flex-row gap-7.5 ${ activeTab === "addresses" ? "flex" : "hidden" }`}>
              <div className="xl:max-w-[370px] w-full bg-white shadow-1 rounded-xl">
                <div className="flex items-center justify-between py-5 px-4 sm:pl-7.5 sm:pr-6 border-b border-gray-3">
                  <p className="font-medium text-xl text-dark">Shipping Address</p>
                  <button className="text-dark ease-out duration-200 hover:text-blue" onClick={openAddressModal}>
                    {/* ... SVG Edit ... */}
                  </button>
                </div>
                <div className="p-4 sm:p-7.5">
                  <div className="flex flex-col gap-4">
                     {/* DATA DINAMIS: Info pengguna di kartu alamat */}
                    <p className="flex items-center gap-2.5 text-custom-sm">Name: {session.user?.name}</p>
                    <p className="flex items-center gap-2.5 text-custom-sm">Email: {session.user?.email}</p>
                    <p className="flex items-center gap-2.5 text-custom-sm">Phone: (Data belum ada)</p>
                    <p className="flex gap-2.5 text-custom-sm">Address: (Data belum ada)</p>
                  </div>
                </div>
              </div>
              {/* ... Kartu Billing Address ... */}
            </div>
            
            <div className={`xl:max-w-[770px] w-full ${ activeTab === "account-details" ? "block" : "hidden" }`}>
              <form>
                <div className="bg-white shadow-1 rounded-xl p-4 sm:p-8.5">
                  <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
                    <div className="w-full">
                      <label htmlFor="firstName" className="block mb-2.5">First Name <span className="text-red">*</span></label>
                      <input type="text" name="firstName" id="firstName" placeholder="Jhon" defaultValue={firstName} className="..."/>
                    </div>
                    <div className="w-full">
                      <label htmlFor="lastName" className="block mb-2.5">Last Name <span className="text-red">*</span></label>
                      <input type="text" name="lastName" id="lastName" placeholder="Deo" defaultValue={lastName} className="..."/>
                    </div>
                  </div>
                  {/* ... Sisa Form ... */}
                  <button type="submit" className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark">
                    Save Changes
                  </button>
                </div>
                <div className="bg-white shadow-1 rounded-xl p-4 sm:p-8.5 mt-9">
                  <p className="font-medium text-xl sm:text-2xl text-dark mb-7">Password Change</p>
                  {/* ... Form ganti password ... */}
                </div>
              </form>
            </div>
            {/* */}
          </div>
        </div>
      </section>

      <AddressModal isOpen={addressModal} closeModal={closeAddressModal} />
    </>
  );
};

export default MyAccount;