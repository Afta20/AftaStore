// File: src/app/admin/dashboard/page.tsx
"use client"; // Jika ada interaktivitas, jika tidak, bisa dihapus

import React from 'react';

const AdminDashboardHomePage = () => {
  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Welcome to the Admin Dashboard</h1>
      <p className="text-gray-600">
        Please select an option from the sidebar to manage your store&apos;s content.
      </p>
      {/* Kamu bisa menambahkan ringkasan statistik atau shortcut di sini nanti */}
    </div>
  );
};

export default AdminDashboardHomePage;