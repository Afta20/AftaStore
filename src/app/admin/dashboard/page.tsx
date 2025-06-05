// File: src/app/admin/dashboard/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement,
  TimeScale, // Jika menggunakan data waktu untuk sumbu X
  Filler,    // Untuk area chart jika diinginkan
} from 'chart.js';
import 'chartjs-adapter-date-fns'; // Adapter untuk data waktu

// Registrasi semua komponen Chart.js yang akan digunakan
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement,
  TimeScale,
  Filler
);

// Contoh Interface untuk data yang akan di-fetch (sesuaikan dengan API Anda)
interface MonthlySalesData {
  labels: string[]; // Contoh: ['Jan', 'Feb', 'Mar', ...]
  revenues: number[];
  orders: number[];
}

interface CategoryDistributionData {
  labels: string[]; // Nama kategori
  counts: number[];   // Jumlah produk atau penjualan per kategori
}

interface DashboardSummary {
  totalUsers: number;
  totalOrders: number;
  monthlyRevenue: number;
  productsSoldThisMonth: number;
}

const AdminDashboardPage = () => {
  const [summaryData, setSummaryData] = useState<DashboardSummary | null>(null);
  const [monthlySales, setMonthlySales] = useState<MonthlySalesData | null>(null);
  const [categoryDistribution, setCategoryDistribution] = useState<CategoryDistributionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        // --- TODO: GANTI DENGAN PEMANGGILAN API AKTUAL ---
        // Contoh:
        // const summaryRes = await fetch('/api/admin/dashboard/summary');
        // const summaryJson = await summaryRes.json();
        // setSummaryData(summaryJson);

        // const salesRes = await fetch('/api/admin/dashboard/monthly-sales');
        // const salesJson = await salesRes.json();
        // setMonthlySales(salesJson);

        // const categoryRes = await fetch('/api/admin/dashboard/category-distribution');
        // const categoryJson = await categoryRes.json();
        // setCategoryDistribution(categoryJson);

        // Untuk sekarang, kita gunakan MOCK DATA:
        setSummaryData({
          totalUsers: 1256,
          totalOrders: 789,
          monthlyRevenue: 75500000,
          productsSoldThisMonth: 340,
        });

        setMonthlySales({
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          revenues: [150, 220, 180, 250, 200, 300].map(v => v * 100000), // dalam Rupiah
          orders: [30, 45, 35, 50, 40, 60],
        });

        setCategoryDistribution({
          labels: ['Elektronik', 'Pakaian', 'Buku', 'Rumah Tangga', 'Olahraga'],
          counts: [120, 80, 60, 90, 50],
        });
        // --- Akhir dari TODO untuk API ---

      } catch (err: any) {
        setError(err.message || "Gagal memuat data dashboard.");
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="p-6 text-center text-gray-700">Memuat data dashboard...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">Error: {error}</div>;
  }

  // Konfigurasi data untuk Chart.js
  const salesChartData = monthlySales ? {
    labels: monthlySales.labels,
    datasets: [
      {
        label: 'Pendapatan (Rp)',
        data: monthlySales.revenues,
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        yAxisID: 'y',
        tension: 0.1,
      },
      {
        label: 'Jumlah Pesanan',
        data: monthlySales.orders,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        yAxisID: 'y1',
        tension: 0.1,
      },
    ],
  } : null;

  const salesChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const, // Menentukan tipe mode interaksi
      intersect: false,
    },
    stacked: false,
    plugins: {
      title: {
        display: true,
        text: 'Grafik Pendapatan & Jumlah Pesanan Bulanan',
      },
      legend: {
        position: 'top' as const, // Menentukan posisi legenda
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Pendapatan (Rp)'
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Jumlah Pesanan'
        },
        grid: {
          drawOnChartArea: false, // only want the grid lines for one axis to show up
        },
      },
    },
  };

  const categoryChartData = categoryDistribution ? {
    labels: categoryDistribution.labels,
    datasets: [
      {
        label: 'Distribusi Kategori',
        data: categoryDistribution.counts,
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  } : null;

  const categoryChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Distribusi Produk per Kategori',
      },
    },
  };


  return (
    // Asumsikan Anda memiliki layout admin dengan padding atau margin sendiri.
    // Jika tidak, tambahkan padding di sini, misalnya `className="p-4 md:p-6 lg:p-8"`
    <div className="space-y-6 md:space-y-8">
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-white">
        Dashboard Admin
      </h1>

      {/* Kartu Ringkasan */}
      {summaryData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Pengguna</h3>
            <p className="mt-1 text-3xl font-semibold text-blue-600 dark:text-blue-400">
              {summaryData.totalUsers.toLocaleString('id-ID')}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Pesanan</h3>
            <p className="mt-1 text-3xl font-semibold text-green-600 dark:text-green-400">
              {summaryData.totalOrders.toLocaleString('id-ID')}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pendapatan Bulan Ini</h3>
            <p className="mt-1 text-3xl font-semibold text-purple-600 dark:text-purple-400">
              Rp {summaryData.monthlyRevenue.toLocaleString('id-ID')}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Produk Terjual (Bulan Ini)</h3>
            <p className="mt-1 text-3xl font-semibold text-yellow-500 dark:text-yellow-400">
              {summaryData.productsSoldThisMonth.toLocaleString('id-ID')}
            </p>
          </div>
        </div>
      )}

      {/* Area Grafik */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow min-h-[300px] md:min-h-[400px]">
          {monthlySales && salesChartData ? (
            <Line options={salesChartOptions as any} data={salesChartData} />
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">Data penjualan tidak tersedia.</p>
          )}
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow min-h-[300px] md:min-h-[400px] flex justify-center items-center">
          {categoryDistribution && categoryChartData ? (
            <div className="w-full h-full max-w-md"> {/* Kontrol ukuran Pie/Doughnut chart */}
              <Doughnut options={categoryChartOptions as any} data={categoryChartData} />
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">Data distribusi kategori tidak tersedia.</p>
          )}
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-white mb-4">Pesanan Terbaru</h2>
        <p className="text-gray-500 dark:text-gray-400">Belum ada data pesanan terbaru.</p>
      </div>
    </div>
  );
};

export default AdminDashboardPage;