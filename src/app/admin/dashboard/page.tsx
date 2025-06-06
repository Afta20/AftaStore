// File: src/app/admin/dashboard/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
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

interface TargetCategoryDistributionData {
  labels: string[];
  counts: number[];
}

interface DashboardSummary {
  totalUsers: number;
  totalOrders: number;
  monthlyRevenue: number;
  productsSoldThisMonth: number;
}

interface ProductFromApi {
  id: string;
  categoryId?: string | null;
  category?: { // API /api/admin/products sebaiknya mengembalikan ini
    name: string;
  } | null;
  // tambahkan field lain dari produk jika dibutuhkan untuk logika lain
  // misalnya 'title' untuk debugging
  title?: string; 
}

interface CategoryFromApi {
  id: string;
  name: string;
}

// Data Kategori Dummy (sesuaikan ID jika Anda tahu ID pasti dari DB Anda)
const DUMMY_CATEGORIES: CategoryFromApi[] = [
  { id: 'clxne5028000012mca18d31r7', name: 'Elektronik' }, // Contoh ID
  { id: 'clxne5t4k000212mc999q3s6o', name: 'Aksesoris Komputer' }, // Contoh ID
];

// Data Produk Dummy (yang merujuk ke ID kategori dummy di atas)
const DUMMY_PRODUCTS: ProductFromApi[] = [
  { id: 'prod1', categoryId: DUMMY_CATEGORIES[0].id, category: { name: DUMMY_CATEGORIES[0].name }, title: "Produk Elektronik 1" },
  { id: 'prod2', categoryId: DUMMY_CATEGORIES[0].id, category: { name: DUMMY_CATEGORIES[0].name }, title: "Produk Elektronik 2" },
  { id: 'prod3', categoryId: DUMMY_CATEGORIES[1].id, category: { name: DUMMY_CATEGORIES[1].name }, title: "Aksesoris Komp 1" },
  { id: 'prod4', categoryId: 'other_cat_id', category: { name: "Kategori Lain" }, title: "Produk Kategori Lain"}, // Produk dengan kategori lain
  { id: 'prod5', categoryId: DUMMY_CATEGORIES[0].id, category: { name: DUMMY_CATEGORIES[0].name }, title: "Produk Elektronik 3" },
];


const AdminDashboardPage = () => {
  const [summaryData, setSummaryData] = useState<DashboardSummary | null>(null);
  const [monthlySales, setMonthlySales] = useState<MonthlySalesData | null>(null);
  const [targetCategoryDistribution, setTargetCategoryDistribution] = useState<TargetCategoryDistributionData | null>(null);
  
  const [allProducts, setAllProducts] = useState<ProductFromApi[]>([]);
  const [allCategories, setAllCategories] = useState<CategoryFromApi[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const processTargetCategoryDistribution = (
    products: ProductFromApi[],
    categories: CategoryFromApi[] // Parameter ini mungkin tidak terlalu dibutuhkan jika produk sudah punya category.name
  ) => {
    const targetCategoryNames = ['Elektronik', 'Aksesoris Komputer'];
    const counts: { [key: string]: number } = {
      'Elektronik': 0,
      'Aksesoris Komputer': 0,
    };

    // Mapping ID ke Nama hanya sebagai fallback jika product.category.name tidak ada
    const categoryNameMap = new Map<string, string>();
    categories.forEach(cat => categoryNameMap.set(cat.id, cat.name));

    products.forEach(product => {
      let categoryName: string | undefined | null = null;
      if (product.category?.name) {
        categoryName = product.category.name;
      } else if (product.categoryId && categoryNameMap.has(product.categoryId)) {
        categoryName = categoryNameMap.get(product.categoryId);
      }

      if (categoryName === 'Elektronik') {
        counts['Elektronik']++;
      } else if (categoryName === 'Aksesoris Komputer') {
        counts['Aksesoris Komputer']++;
      }
      // Produk dengan kategori lain atau tanpa kategori akan diabaikan untuk chart ini
    });

    setTargetCategoryDistribution({
      labels: targetCategoryNames,
      counts: [counts['Elektronik'], counts['Aksesoris Komputer']],
    });
     // console.log("Processed category distribution:", { labels: targetCategoryNames, counts: [counts['Elektronik'], counts['Aksesoris Komputer']] });
  };


  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      let fetchedProducts: ProductFromApi[] = [];
      let fetchedCategories: CategoryFromApi[] = [];

      try {
        // 1. Fetch Summary Data
        try {
            const summaryRes = await fetch('/api/admin/dashboard/summary');
            if (!summaryRes.ok) {
                console.warn("Gagal mengambil data summary, menggunakan mock.");
                throw new Error("API summary gagal"); // Dilempar agar ditangkap dan mock digunakan
            }
            const summaryJson = await summaryRes.json();
            setSummaryData(summaryJson);
        } catch (summaryError) {
            console.warn("Error fetching summary, using mock data.", summaryError);
            setSummaryData({ totalUsers: 1256, totalOrders: 789, monthlyRevenue: 75500000, productsSoldThisMonth: 340 });
        }

        // 2. Fetch Products
        try {
            const productsRes = await fetch('/api/admin/products');
            if (!productsRes.ok) {
                 console.warn("Gagal mengambil data produk, menggunakan mock.");
                 throw new Error("API produk gagal");
            }
            fetchedProducts = await productsRes.json();
            setAllProducts(fetchedProducts);
        } catch (productsError) {
            console.warn("Error fetching products, using mock data.", productsError);
            fetchedProducts = DUMMY_PRODUCTS; // Gunakan dummy jika fetch gagal
            setAllProducts(DUMMY_PRODUCTS);
        }

        // 3. Fetch Categories
        try {
            const categoriesRes = await fetch('/api/admin/categories');
            if (!categoriesRes.ok) {
                console.warn("Gagal mengambil data kategori, menggunakan mock.");
                throw new Error("API kategori gagal");
            }
            fetchedCategories = await categoriesRes.json();
            setAllCategories(fetchedCategories);
        } catch (categoriesError) {
            console.warn("Error fetching categories, using mock data.", categoriesError);
            fetchedCategories = DUMMY_CATEGORIES; // Gunakan dummy jika fetch gagal
            setAllCategories(DUMMY_CATEGORIES);
        }

        // Data sales masih mock untuk sekarang
        setMonthlySales({
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          revenues: [150, 220, 180, 250, 200, 300].map(v => v * 100000),
          orders: [30, 45, 35, 50, 40, 60],
        });

      } catch (err: any) { // Catch error global jika ada yang tidak tertangani di atas
        setError("Terjadi kesalahan umum saat memuat data dashboard.");
        console.error("Global error in fetchDashboardData:", err);
        // Pastikan semua state punya nilai default agar tidak crash saat render
        if (!summaryData) setSummaryData({ totalUsers: 0, totalOrders: 0, monthlyRevenue: 0, productsSoldThisMonth: 0 });
        if (!monthlySales) setMonthlySales({ labels: [], revenues: [], orders: [] });
        if (fetchedProducts.length === 0) setAllProducts(DUMMY_PRODUCTS); // Jika produk masih kosong, set dummy
        if (fetchedCategories.length === 0) setAllCategories(DUMMY_CATEGORIES); // Jika kategori masih kosong, set dummy
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    // Hanya proses jika tidak loading dan ada produk dan kategori
    if (!loading && (allProducts.length > 0 || allCategories.length > 0)) {
      processTargetCategoryDistribution(allProducts, allCategories);
    } else if (!loading && allProducts.length === 0 && allCategories.length === 0) {
      // Jika tidak ada produk dan kategori sama sekali (bahkan dari mock), set default
      setTargetCategoryDistribution({ labels: ['Elektronik', 'Aksesoris Komputer'], counts: [0, 0] });
    }
  }, [allProducts, allCategories, loading]);

  // ... (sisa kode untuk salesChartData, salesChartOptions, categoryPieChartOptions, dan return JSX tetap sama seperti di artifact admin_dashboard_page_real_category_chart) ...
  // Pastikan Anda menggunakan 'categoryPieChartData' untuk data Pie/Doughnut chart
  
  if (loading) {
    return <div className="p-6 text-center text-gray-700">Loading dashboard data...</div>;
  }

  // Error global bisa ditampilkan di sini, atau Anda bisa menangani error per fetch
  if (error && !summaryData) { // Tampilkan error besar hanya jika data utama (summary) gagal total
    return <div className="p-6 text-center text-red-500">Error: {error}</div>;
  }

  const salesChartData = monthlySales ? {
    labels: monthlySales.labels,
    datasets: [
      {
        label: 'Income (Rp)', data: monthlySales.revenues,
        borderColor: 'rgb(54, 162, 235)', backgroundColor: 'rgba(54, 162, 235, 0.5)',
        yAxisID: 'y', tension: 0.1,
      },
      {
        label: 'Number of orders', data: monthlySales.orders,
        borderColor: 'rgb(255, 99, 132)', backgroundColor: 'rgba(255, 99, 132, 0.5)',
        yAxisID: 'y1', tension: 0.1,
      },
    ],
  } : null;

  const salesChartOptions = {
    responsive: true, maintainAspectRatio: false, interaction: { mode: 'index' as const, intersect: false },
    stacked: false, plugins: { title: { display: true, text: 'Graph of Revenue and Number of Monthly Orders' }, legend: { position: 'top' as const }},
    scales: { y: { type: 'linear' as const, display: true, position: 'left' as const, title: { display: true, text: 'Income (Rp)'}},
              y1: { type: 'linear' as const, display: true, position: 'right' as const, title: { display: true, text: 'Number of orders'}, grid: { drawOnChartArea: false }}}
  };

  const categoryPieChartData = targetCategoryDistribution ? {
    labels: targetCategoryDistribution.labels,
    datasets: [
      {
        label: 'Distribution of Products by Kategori',
        data: targetCategoryDistribution.counts,
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)', 
          'rgba(255, 206, 86, 0.8)', 
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  } : null;

  const categoryPieChartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'top' as const }, title: { display: true, text: 'Distribution of Product (Elektronik vs Aksesoris Komp.)' }}
  };

  return (
    <div className="space-y-6 md:space-y-8 p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-white">
        Admin Dashboard
      </h1>

      {summaryData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Users</h3>
            <p className="mt-1 text-3xl font-semibold text-blue-600 dark:text-blue-400">
              {summaryData.totalUsers.toLocaleString('id-ID')}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Orders</h3>
            <p className="mt-1 text-3xl font-semibold text-green-600 dark:text-green-400">
              {summaryData.totalOrders.toLocaleString('id-ID')}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">This Month's Income</h3>
            <p className="mt-1 text-3xl font-semibold text-purple-600 dark:text-purple-400">
              Rp {summaryData.monthlyRevenue.toLocaleString('id-ID')}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Products Sold (This Month)</h3>
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
          {targetCategoryDistribution && categoryPieChartData && targetCategoryDistribution.labels.length > 0 ? (
            <div className="w-full h-full max-w-md">
              <Doughnut options={categoryPieChartOptions as any} data={categoryPieChartData} />
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">Data distribusi kategori tidak tersedia atau tidak ada produk dalam kategori target.</p>
          )}
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-white mb-4">New Order</h2>
        <p className="text-gray-500 dark:text-gray-400">Belum ada data pesanan terbaru.</p>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
