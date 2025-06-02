// File: src/components/Auth/Signin/index.tsx (Versi Sederhana untuk Debugging Vercel)
"use client";

// Tidak ada import lain dulu untuk meminimalkan variabel
// import { useState } from 'react';
// import { signIn } from 'next-auth/react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import Breadcrumb from "@/components/Common/Breadcrumb";

const Signin = () => {
  const handleTestSubmit = (e: React.FormEvent) => {
    // Log ini akan muncul di KONSOL BROWSER
    console.log("--- VERCEL DEBUG: handleTestSubmit (Minimal) DIPANGGIL! ---");
    e.preventDefault();
    alert("handleTestSubmit di Vercel BERHASIL dipanggil dan preventDefault dieksekusi!");
    // Kita tidak melakukan apa-apa lagi, hanya tes event handler
  };

  return (
    <>
      {/* <Breadcrumb title={"Signin"} pages={["Signin"]} /> */}
      <section style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>
        <div style={{ maxWidth: '500px', margin: 'auto', backgroundColor: 'white', padding: '20px' }}>
          <h1>Halaman Signin Tes Sederhana (Vercel)</h1>
          <form onSubmit={handleTestSubmit}>
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="email-test">Email:</label>
              <input
                id="email-test"
                name="email"
                type="email"
                defaultValue="test@example.com"
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="password-test">Password:</label>
              <input
                id="password-test"
                name="password"
                type="password"
                defaultValue="password"
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }}
              />
            </div>
            <button
              type="submit"
              style={{ padding: '10px 15px', backgroundColor: 'blue', color: 'white', border: 'none' }}
            >
              Test Submit di Vercel
            </button>
          </form>
          <p style={{ marginTop: '10px' }}>Periksa konsol browser setelah mengklik tombol submit.</p>
        </div>
      </section>
    </>
  );
};

export default Signin;