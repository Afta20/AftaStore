// File: src/app/admin/layout.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  const menuItems = [
    { href: '/admin/dashboard', label: 'Dashboard Home' },
    { href: '/admin/dashboard/users', label: 'Manage Users' },
    { href: '/admin/dashboard/products', label: 'Manage Products' },
    { href: '/admin/dashboard/orders', label: 'Manage Orders' },
  ];

  // Warna utama dari public site (perkiraan dari screenshot)
  const primaryBlue = '#3C50E0'; // Warna biru yang cukup menonjol
  const lightGrayBg = '#F3F4F6'; // Background abu-abu muda untuk konten utama
  const sidebarBg = '#FFFFFF'; // Sidebar putih
  const textColorDark = '#111827'; // Teks gelap (mirip Tailwind gray-900)
  const textColorMedium = '#4B5563'; // Teks abu-abu sedang (mirip Tailwind gray-600)
  const borderColor = '#E5E7EB'; // Border abu-abu muda (mirip Tailwind gray-300)

  const sidebarStyle: React.CSSProperties = {
    width: '256px',
    backgroundColor: sidebarBg,
    color: textColorDark,
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    borderRight: `1px solid ${borderColor}`, // Garis pemisah
    boxShadow: '2px 0 5px -2px rgba(0,0,0,0.1)', // Shadow halus untuk pemisah
  };

  const linkStyleBase: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: '0.75rem 1rem', // Sedikit disesuaikan
    borderRadius: '0.375rem',
    textDecoration: 'none',
    color: textColorMedium, // Warna teks dasar untuk link
    transition: 'background-color 0.2s ease-in-out, color 0.2s ease-in-out',
    fontWeight: '500', // font-medium
  };

  const activeLinkStyle: React.CSSProperties = {
    ...linkStyleBase,
    backgroundColor: primaryBlue, // Background biru untuk link aktif
    color: '#FFFFFF', // Teks putih untuk link aktif
    fontWeight: '600', // font-semibold
  };
  
  const hoverLinkStyle: string = `hover:bg-gray-100 hover:text-gray-900`; // Ini akan jadi kelas Tailwind jika bisa

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif', backgroundColor: lightGrayBg }}>
      <aside style={sidebarStyle} className="hidden md:flex"> {/* Tambahkan className hidden md:flex jika mau responsif Tailwind */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem', paddingTop: '0.5rem' }}>
          <Link href="/admin/dashboard" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: primaryBlue, textDecoration: 'none' }}>
            AftaStore Admin
          </Link>
        </div>
        <nav style={{ flexGrow: 1 }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {menuItems.map((item, index) => {
              let isActive = false;
              if (item.href === '/admin/dashboard') {
                isActive = pathname === item.href;
              } else {
                isActive = pathname.startsWith(item.href);
              }

              // Untuk hover dengan inline style, kita tidak bisa langsung, jadi kita set warna dasar saja.
              // Jika Tailwind berfungsi, kita bisa tambahkan kelas hover.
              const currentStyle = isActive ? activeLinkStyle : linkStyleBase;

              return (
                <li key={item.href} style={{ marginBottom: '0.5rem' }}>
                  <Link
                    href={item.href}
                    style={currentStyle}
                    // Jika Tailwind berfungsi, kamu bisa tambahkan className untuk hover:
                    // className={!isActive ? 'hover:bg-gray-100 hover:text-gray-900' : ''}
                  >
                    <span style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div style={{ marginTop: 'auto', borderTop: `1px solid ${borderColor}`, paddingTop: '1rem' }}>
          <Link
            href="/"
            style={{ ...linkStyleBase, justifyContent: 'center', color: textColorMedium }}
            // className="hover:bg-gray-100 hover:text-gray-900" // Jika Tailwind berfungsi
          >
            <span style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              View Public Site
            </span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ backgroundColor: 'white', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)', padding: '1rem' }} className="md:hidden"> {/* Header mobile, disembunyikan di md ke atas */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '600', color: textColorDark }}>Admin Menu</h1>
            {/* Tombol untuk toggle sidebar mobile bisa diletakkan di sini */}
          </div>
        </header>

        <main style={{ flex: 1, overflowX: 'hidden', overflowY: 'auto', backgroundColor: lightGrayBg, padding: '1.5rem' }}> {/* md:p-8 */}
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;