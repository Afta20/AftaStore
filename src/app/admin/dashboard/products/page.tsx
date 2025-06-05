// File: src/app/admin/dashboard/products/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Pie } from 'react-chartjs-2'; // Menggunakan Pie chart sebagai contoh
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title, // Ditambahkan untuk judul chart
} from 'chart.js';

// Registrasi komponen Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, Title);

// Definisikan tipe Product (sesuai yang sudah kamu punya)
interface Product {
  id: string;
  title: string;
  price: number;
  imagePreviews: string[];
  reviews?: number | null;
  discountedPrice?: number | null;
  categoryId?: string | null; // Penting untuk chart kategori
  // category?: { name: string }; // Jika kamu include nama kategori dari backend
  createdAt: string;
}

// Interface untuk data chart distribusi kategori
interface CategoryDistributionChartData {
  labels: string[]; // Nama-nama kategori
  counts: number[]; // Jumlah produk per kategori
}

const ManageProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductError] = useState<string | null>(null);

  // State untuk data chart
  const [categoryDistribution, setCategoryDistribution] = useState<CategoryDistributionChartData | null>(null);
  const [loadingChartData, setLoadingChartData] = useState(true);
  const [chartError, setChartError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    setProductError(null);
    try {
      const response = await fetch('/api/admin/products'); // API untuk mengambil semua produk
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.statusText}`);
      }
      const data: Product[] = await response.json();
      setProducts(data);
    } catch (err: any) {
      setProductError(err.message || 'An error occurred while fetching products');
      console.error(err);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Fungsi untuk mengambil dan memproses data untuk chart kategori
  const processCategoryData = (productList: Product[]) => {
    if (productList.length === 0) {
      setCategoryDistribution({ labels: [], counts: [] });
      return;
    }

    const counts: { [key: string]: number } = {};
    const categoryIdToNameMapping: { [key: string]: string } = {
      // TODO: Idealnya, mapping ini atau nama kategori berasal dari data kategori Anda
      // Untuk sekarang, kita bisa menggunakan categoryId sebagai label jika nama tidak tersedia langsung
      // Atau jika produk Anda memiliki objek category: { id: string, name: string }, itu lebih baik.
      // Contoh placeholder jika Anda punya data kategori:
      // "cuid_elektronik": "Elektronik",
      // "cuid_pakaian": "Pakaian",
    };

    productList.forEach(product => {
      const catId = product.categoryId || 'Tanpa Kategori';
      const catName = categoryIdToNameMapping[catId] || catId; // Gunakan ID jika nama tak ada mapping
      counts[catName] = (counts[catName] || 0) + 1;
    });

    setCategoryDistribution({
      labels: Object.keys(counts),
      counts: Object.values(counts),
    });
  };


  useEffect(() => {
    const loadData = async () => {
        await fetchProducts(); // Data produk akan di-set di sini
    };
    loadData();
  }, []);

  // Effect terpisah untuk memproses data chart setelah produk berhasil di-fetch
  useEffect(() => {
    if (products.length > 0) {
      setLoadingChartData(true);
      try {
        processCategoryData(products);
        setChartError(null);
      } catch (err: any) {
        setChartError("Gagal memproses data kategori untuk chart.");
        console.error("Error processing category data:", err);
      } finally {
        setLoadingChartData(false);
      }
    } else if (!loadingProducts) { // Jika produk selesai loading dan kosong
        setCategoryDistribution({ labels: [], counts: [] }); // Set data kosong untuk chart
        setLoadingChartData(false);
    }
  }, [products, loadingProducts]); // Dependensi pada products dan loadingProducts


  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm("Anda yakin ingin menghapus produk ini?")) {
      setProductError(null); // Reset error sebelum mencoba delete
      try {
        const response = await fetch(`/api/admin/products/${productId}`, { method: 'DELETE' });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({})); // coba parse error, atau default object kosong
          throw new Error(errorData.message || `Gagal menghapus produk: ${response.statusText}`);
        }
        // Jika berhasil, refresh daftar produk
        alert("Produk berhasil dihapus. Daftar akan diperbarui.");
        fetchProducts(); // Refresh list
      } catch (err: any) {
        console.error("Error deleting product:", err);
        setProductError(err.message || 'Gagal menghapus produk.');
        alert(`Error: ${err.message || 'Gagal menghapus produk.'}`);
      }
    }
  };

  // Konfigurasi data untuk Pie chart
  const categoryPieData = categoryDistribution ? {
    labels: categoryDistribution.labels,
    datasets: [
      {
        label: 'Jumlah Produk',
        data: categoryDistribution.counts,
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 159, 64, 0.7)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  } : null;

  const categoryPieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Distribusi Produk per Kategori',
        font: { size: 16 }
      },
    },
  };

  // Style untuk kartu (bisa dipindah ke CSS/Tailwind)
  const cardStyle: React.CSSProperties = {
    padding: '20px',
    backgroundColor: 'white', // Ganti dengan dark mode variable jika perlu
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    textAlign: 'center',
  };
  const cardTitleStyle: React.CSSProperties = {
    fontSize: '0.875rem', // text-sm
    color: '#6B7280', // gray-500
    fontWeight: 500,
    textTransform: 'uppercase',
    marginBottom: '8px',
  };
  const cardStatStyle: React.CSSProperties = {
    fontSize: '2.25rem', // text-4xl
    fontWeight: 'bold',
    color: '#1F2937', // gray-800
  };


  // Render utama
  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-white">Manage Products</h1>
        <div className="flex gap-3">
          <Link href="/admin/dashboard/products/new" className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm font-medium">
            Add New Product
          </Link>
          <Link href="/admin/dashboard" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm font-medium">
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Bagian Statistik dan Grafik */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-white mb-6 text-center">Product Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-8">
          <div style={cardStyle} className="dark:bg-gray-700">
            <h3 style={cardTitleStyle} className="dark:text-gray-300">Total Produk</h3>
            <p style={cardStatStyle} className="dark:text-white">{loadingProducts ? '...' : products.length}</p>
          </div>
          <div style={cardStyle} className="dark:bg-gray-700">
            <h3 style={cardTitleStyle} className="dark:text-gray-300">Kategori Unik</h3>
            <p style={cardStatStyle} className="dark:text-white">
              {loadingChartData || !categoryDistribution ? '...' : categoryDistribution.labels.length}
            </p>
          </div>
          {/* Tambahkan kartu lain jika perlu */}
        </div>

        {loadingChartData && <p className="text-center text-gray-500 dark:text-gray-400">Memuat data grafik...</p>}
        {chartError && <p className="text-center text-red-500">{chartError}</p>}
        {categoryPieData && !loadingChartData && !chartError && categoryDistribution && categoryDistribution.labels.length > 0 && (
          <div className="max-w-md mx-auto h-72 md:h-96"> {/* Kontainer untuk ukuran Pie chart */}
            <Pie data={categoryPieData} options={categoryPieOptions as any} />
          </div>
        )}
        {categoryDistribution && categoryDistribution.labels.length === 0 && !loadingChartData && (
            <p className="text-center text-gray-500 dark:text-gray-400">Belum ada data kategori untuk ditampilkan.</p>
        )}
      </div>
      {/* Akhir Bagian Statistik dan Grafik */}


      {loadingProducts && <p className="text-center text-gray-500 dark:text-gray-400">Memuat daftar produk...</p>}
      {productError && <p className="text-center text-red-500 py-4">Error: {productError}</p>}

      {!loadingProducts && !productError && (
        products.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">Tidak ada produk ditemukan.</p>
        ) : (
          <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-md rounded-lg">
            <table className="w-full min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">Image</th>
                  <th scope="col" className="px-6 py-3">Title</th>
                  <th scope="col" className="px-6 py-3">Price</th>
                  <th scope="col" className="px-6 py-3">Created At</th>
                  <th scope="col" className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <td className="px-6 py-4">
                      {product.imagePreviews && product.imagePreviews.length > 0 && (
                        <img src={product.imagePreviews[0]} alt={product.title} className="w-12 h-12 object-cover rounded" />
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{product.title}</td>
                    <td className="px-6 py-4">Rp. {product.price.toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4">{new Date(product.createdAt).toLocaleDateString('id-ID')}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link href={`/admin/dashboard/products/edit/${product.id}`} className="font-medium text-blue-600 dark:text-blue-500 hover:underline mr-3">
                        Edit
                      </Link>
                      <button onClick={() => handleDeleteProduct(product.id)} className="font-medium text-red-600 dark:text-red-500 hover:underline">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
};

export default ManageProductsPage;