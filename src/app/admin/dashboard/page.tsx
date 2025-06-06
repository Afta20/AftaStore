// File: src/app/admin/dashboard/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement, // Meskipun tidak dipakai, mungkin ada di registrasi awal
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement,
  TimeScale,
  Filler,
} from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
  PointElement, LineElement, ArcElement, TimeScale, Filler
);

interface MonthlySalesData {
  labels: string[];
  revenues: number[];
  orders: number[];
}

// Interface untuk data kategori yang akan kita tampilkan di chart
interface TargetCategoryDistributionData {
  labels: string[]; // Akan berisi 'Elektronik', 'Aksesoris Komputer'
  counts: number[];
}

interface DashboardSummary {
  totalUsers: number;
  totalOrders: number;
  monthlyRevenue: number;
  productsSoldThisMonth: number;
}

// Interface untuk produk yang diterima dari API (termasuk nama kategori)
interface ProductFromApi {
  id: string;
  categoryId?: string | null;
  category?: {
    name: string;
  } | null;
  // tambahkan field lain dari produk jika dibutuhkan untuk logika lain
}

// Interface untuk kategori yang diterima dari API
interface CategoryFromApi {
  id: string;
  name: string;
}

const AdminDashboardPage = () => {
  const [summaryData, setSummaryData] = useState<DashboardSummary | null>(null);
  const [monthlySales, setMonthlySales] = useState<MonthlySalesData | null>(null);
  // State untuk chart distribusi kategori (hanya 2 kategori target)
  const [targetCategoryDistribution, setTargetCategoryDistribution] = useState<TargetCategoryDistributionData | null>(null);
  
  const [allProducts, setAllProducts] = useState<ProductFromApi[]>([]); // Untuk menyimpan semua produk
  const [allCategories, setAllCategories] = useState<CategoryFromApi[]>([]); // Untuk menyimpan semua kategori

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fungsi untuk memproses data kategori menjadi hanya 2 kategori target
  const processTargetCategoryDistribution = (
    products: ProductFromApi[],
    categories: CategoryFromApi[]
  ) => {
    const targetCategoryNames = ['Elektronik', 'Aksesoris Komputer'];
    const counts: { [key: string]: number } = {
      'Elektronik': 0,
      'Aksesoris Komputer': 0,
    };

    // Buat mapping id ke nama untuk efisiensi jika produk hanya punya categoryId
    const categoryNameMap = new Map<string, string>();
    categories.forEach(cat => categoryNameMap.set(cat.id, cat.name));

    products.forEach(product => {
      let categoryName: string | undefined | null = null;
      if (product.category?.name) {
        categoryName = product.category.name;
      } else if (product.categoryId) {
        categoryName = categoryNameMap.get(product.categoryId);
      }

      if (categoryName === 'Elektronik') {
        counts['Elektronik']++;
      } else if (categoryName === 'Aksesoris Komputer') {
        counts['Aksesoris Komputer']++;
      }
    });

    setTargetCategoryDistribution({
      labels: targetCategoryNames,
      counts: [counts['Elektronik'], counts['Aksesoris Komputer']],
    });
  };


  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        // --- MENGAMBIL DATA AKTUAL ---
        const summaryRes = await fetch('/api/admin/dashboard/summary'); // Ganti dengan API Anda
        if (summaryRes.ok) {
            const summaryJson = await summaryRes.json();
            setSummaryData(summaryJson);
        } else {
            console.warn("Gagal mengambil data summary, menggunakan mock.");
            setSummaryData({ totalUsers: 1256, totalOrders: 789, monthlyRevenue: 75500000, productsSoldThisMonth: 340 });
        }


        // Mock untuk sales, ganti dengan API jika ada
        setMonthlySales({
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          revenues: [150, 220, 180, 250, 200, 300].map(v => v * 100000),
          orders: [30, 45, 35, 50, 40, 60],
        });

        // Fetch semua produk (API ini sudah kita modifikasi untuk menyertakan nama kategori)
        const productsRes = await fetch('/api/admin/products');
        if (!productsRes.ok) throw new Error('Gagal mengambil data produk.');
        const productsData: ProductFromApi[] = await productsRes.json();
        setAllProducts(productsData);

        // Fetch semua kategori (Anda perlu membuat API /api/admin/categories)
        const categoriesRes = await fetch('/api/admin/categories');
        if (!categoriesRes.ok) throw new Error('Gagal mengambil data kategori.');
        const categoriesData: CategoryFromApi[] = await categoriesRes.json();
        setAllCategories(categoriesData);

        // Data kategori akan diproses di useEffect lain setelah produk dan kategori di-set

      } catch (err: any) {
        setError(err.message || "Gagal memuat data dashboard.");
        console.error("Failed to fetch dashboard data:", err);
        // Fallback ke data mock jika ada error fetch, agar halaman tetap render sesuatu
        if (!summaryData) setSummaryData({ totalUsers: 0, totalOrders: 0, monthlyRevenue: 0, productsSoldThisMonth: 0 });
        if (!monthlySales) setMonthlySales({ labels: [], revenues: [], orders: [] });
        if (!targetCategoryDistribution) setTargetCategoryDistribution({ labels: ['Elektronik', 'Aksesoris Komputer'], counts: [0, 0] });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []); // Hanya dijalankan sekali saat mount

  // useEffect terpisah untuk memproses data kategori setelah data produk & kategori tersedia
  useEffect(() => {
    if (allProducts.length > 0 && allCategories.length > 0) {
      processTargetCategoryDistribution(allProducts, allCategories);
    } else if (!loading) { // Jika tidak loading dan data belum ada, set default
        setTargetCategoryDistribution({ labels: ['Elektronik', 'Aksesoris Komputer'], counts: [0, 0] });
    }
  }, [allProducts, allCategories, loading]); // Jalankan ketika products, categories, atau loading berubah

  if (loading) {
    return <div className="p-6 text-center text-gray-700">Memuat data dashboard...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">Error: {error}</div>;
  }

  const salesChartData = monthlySales ? { /* ... sama seperti sebelumnya ... */
    labels: monthlySales.labels,
    datasets: [
      {
        label: 'Pendapatan (Rp)', data: monthlySales.revenues,
        borderColor: 'rgb(54, 162, 235)', backgroundColor: 'rgba(54, 162, 235, 0.5)',
        yAxisID: 'y', tension: 0.1,
      },
      {
        label: 'Jumlah Pesanan', data: monthlySales.orders,
        borderColor: 'rgb(255, 99, 132)', backgroundColor: 'rgba(255, 99, 132, 0.5)',
        yAxisID: 'y1', tension: 0.1,
      },
    ],
  } : null;

  const salesChartOptions = { /* ... sama seperti sebelumnya ... */
    responsive: true, maintainAspectRatio: false, interaction: { mode: 'index' as const, intersect: false },
    stacked: false, plugins: { title: { display: true, text: 'Grafik Pendapatan & Jumlah Pesanan Bulanan' }, legend: { position: 'top' as const }},
    scales: { y: { type: 'linear' as const, display: true, position: 'left' as const, title: { display: true, text: 'Pendapatan (Rp)'}},
              y1: { type: 'linear' as const, display: true, position: 'right' as const, title: { display: true, text: 'Jumlah Pesanan'}, grid: { drawOnChartArea: false }}}
  };

  // Menggunakan targetCategoryDistribution untuk pie chart
  const categoryPieChartData = targetCategoryDistribution ? {
    labels: targetCategoryDistribution.labels, // ['Elektronik', 'Aksesoris Komputer']
    datasets: [
      {
        label: 'Distribusi Kategori',
        data: targetCategoryDistribution.counts, // [jumlah_elektronik, jumlah_aksesoris_komputer]
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)', // Biru untuk Elektronik
          'rgba(255, 206, 86, 0.8)', // Kuning untuk Aksesoris Komputer
          // Tambahkan warna lain jika ada kategori "Lainnya"
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  } : null;

  const categoryPieChartOptions = { /* ... sama seperti sebelumnya, hanya judul mungkin bisa disesuaikan ... */
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'top' as const }, title: { display: true, text: 'Distribusi Produk (Elektronik vs Aksesoris Komp.)' }}
  };

  return (
    <div className="space-y-6 md:space-y-8 p-4 md:p-6 lg:p-8"> {/* Tambahkan padding di sini jika layout admin belum ada */}
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-white">
        Dashboard Admin
      </h1>

      {summaryData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* ... Kartu Ringkasan tetap sama ... */}
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow min-h-[300px] md:min-h-[400px]">
          {monthlySales && salesChartData ? (
            <Line options={salesChartOptions as any} data={salesChartData} />
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">Data penjualan tidak tersedia.</p>
          )}
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow min-h-[300px] md:min-h-[400px] flex justify-center items-center">
          {/* Menggunakan categoryPieChartData */}
          {targetCategoryDistribution && categoryPieChartData ? (
            <div className="w-full h-full max-w-md">
              <Doughnut options={categoryPieChartOptions as any} data={categoryPieChartData} />
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">Data distribusi kategori tidak tersedia atau sedang dimuat.</p>
          )}
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-white mb-4">Pesanan Terbaru</h2>
        <p className="text-gray-500 dark:text-gray-400">Belum ada data pesanan terbaru.</p>
        {/* TODO: Implementasi tabel atau daftar pesanan terbaru dari API */}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
