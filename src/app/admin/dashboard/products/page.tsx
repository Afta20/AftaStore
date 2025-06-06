// File: src/app/admin/dashboard/products/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

interface Product {
  id: string;
  title: string;
  price: number;
  stock?: number;
  imagePreviews: string[];
  reviews?: number | null;
  discountedPrice?: number | null;
  categoryId?: string | null;
  createdAt: string;
}

interface CategoryDistributionChartData {
  labels: string[];
  counts: number[];
}

const ManageProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductError] = useState<string | null>(null);

  const [categoryDistribution, setCategoryDistribution] = useState<CategoryDistributionChartData | null>(null);
  const [loadingChartData, setLoadingChartData] = useState(true);
  const [chartError, setChartError] = useState<string | null>(null);

  // fetchProducts, processCategoryData, useEffects, handleDeleteProduct
  // ... (kode fungsi-fungsi ini sama seperti respons saya sebelumnya, saya singkat di sini) ...
  const fetchProducts = async () => {
    setLoadingProducts(true);
    setProductError(null);
    try {
      const response = await fetch('/api/admin/products');
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

  const processCategoryData = (productList: Product[]) => {
    if (productList.length === 0) {
      setCategoryDistribution({ labels: [], counts: [] });
      return;
    }
    const counts: { [key: string]: number } = {};
    const categoryIdToNameMapping: { [key: string]: string } = {};
    productList.forEach(product => {
      const catId = product.categoryId || 'Tanpa Kategori';
      const catName = categoryIdToNameMapping[catId] || catId;
      counts[catName] = (counts[catName] || 0) + 1;
    });
    setCategoryDistribution({
      labels: Object.keys(counts),
      counts: Object.values(counts),
    });
  };

  useEffect(() => {
    const loadData = async () => {
        await fetchProducts();
    };
    loadData();
  }, []);

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
    } else if (!loadingProducts) {
        setCategoryDistribution({ labels: [], counts: [] });
        setLoadingChartData(false);
    }
  }, [products, loadingProducts]);

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm("Anda yakin ingin menghapus produk ini?")) {
      setProductError(null);
      try {
        const response = await fetch(`/api/admin/products/${productId}`, { method: 'DELETE' });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Gagal menghapus produk: ${response.statusText}`);
        }
        alert("Produk berhasil dihapus. Daftar akan diperbarui.");
        fetchProducts();
      } catch (err: any) {
        console.error("Error deleting product:", err);
        setProductError(err.message || 'Gagal menghapus produk.');
        alert(`Error: ${err.message || 'Gagal menghapus produk.'}`);
      }
    }
  };


  const categoryPieData = categoryDistribution ? { /* ...konfigurasi data pie chart... */
    labels: categoryDistribution.labels,
    datasets: [
      {
        label: 'Jumlah Produk',
        data: categoryDistribution.counts,
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)', 'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)', 'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)', 'rgba(255, 159, 64, 0.7)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  } : null;
  const categoryPieOptions = { /* ...konfigurasi opsi pie chart... */
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Distribusi Produk per Kategori', font: { size: 16 } },
    },
  };

  const cardStyle: React.CSSProperties = { /* ...style kartu... */
    padding: '20px', backgroundColor: 'white', borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    textAlign: 'center',
  };
  const cardTitleStyle: React.CSSProperties = { /* ...style judul kartu... */
    fontSize: '0.875rem', color: '#6B7280', fontWeight: 500,
    textTransform: 'uppercase', marginBottom: '8px',
  };
  const cardStatStyle: React.CSSProperties = { /* ...style statistik kartu... */
    fontSize: '2.25rem', fontWeight: 'bold', color: '#1F2937',
  };
  const totalStock = products.reduce((acc, product) => acc + (product.stock || 0), 0);


  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-white">Manage Products</h1>
        <div className="flex gap-3">
          {/* Tombol Add New Product dengan inline style */}
          <Link
            href="/admin/dashboard/products/new"
            style={{
              padding: '0.5rem 1rem', // Tailwind: px-4 py-2
              backgroundColor: '#22c55e', // Tailwind: bg-green-500
              color: 'white',
              borderRadius: '0.375rem', // Tailwind: rounded-md
              textDecoration: 'none',
              fontSize: '0.875rem', // Tailwind: text-sm
              fontWeight: 500, // Tailwind: font-medium
              // Efek hover tidak bisa langsung di inline style untuk background,
              // tapi bisa ditambahkan via CSS class atau <style jsx>
            }}
          >
            Add New Product
          </Link>
          {/* Tombol Back to Dashboard dengan inline style */}
          <Link
            href="/admin/dashboard"
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#3b82f6', // Tailwind: bg-blue-500
              color: 'white',
              borderRadius: '0.375rem',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Bagian Statistik dan Grafik (sama seperti sebelumnya) */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-md mb-8">
        {/* ... (konten kartu statistik dan pie chart tetap sama) ... */}
        <h2 className="text-xl font-semibold text-gray-700 dark:text-white mb-6 text-center">Product Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-8">
          <div style={cardStyle} className="dark:bg-gray-700">
            <h3 style={cardTitleStyle} className="dark:text-gray-300">Total Produk</h3>
            <p style={cardStatStyle} className="dark:text-white">{loadingProducts ? '...' : products.length}</p>
          </div>
          <div style={cardStyle} className="dark:bg-gray-700">
            <h3 style={cardTitleStyle} className="dark:text-gray-300">Total Stok</h3>
            <p style={cardStatStyle} className="dark:text-white">{loadingProducts ? '...' : totalStock.toLocaleString('id-ID')}</p>
          </div>
          <div style={cardStyle} className="dark:bg-gray-700">
            <h3 style={cardTitleStyle} className="dark:text-gray-300">Kategori Unik</h3>
            <p style={cardStatStyle} className="dark:text-white">
              {loadingChartData || !categoryDistribution ? '...' : categoryDistribution.labels.length}
            </p>
          </div>
        </div>
        {loadingChartData && <p className="text-center text-gray-500 dark:text-gray-400">Memuat data grafik...</p>}
        {chartError && <p className="text-center text-red-500">{chartError}</p>}
        {categoryPieData && !loadingChartData && !chartError && categoryDistribution && categoryDistribution.labels.length > 0 && (
          <div className="max-w-md mx-auto h-72 md:h-96">
            <Pie data={categoryPieData} options={categoryPieOptions as any} />
          </div>
        )}
        {categoryDistribution && categoryDistribution.labels.length === 0 && !loadingChartData && (
            <p className="text-center text-gray-500 dark:text-gray-400">Belum ada data kategori untuk ditampilkan.</p>
        )}
      </div>


      {loadingProducts && <p className="text-center text-gray-500 dark:text-gray-400">Memuat daftar produk...</p>}
      {productError && <p className="text-center text-red-500 py-4">Error: {productError}</p>}

      {!loadingProducts && !productError && (
        products.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">Tidak ada produk ditemukan.</p>
        ) : (
          <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-md rounded-lg">
            {/* Menggunakan kelas Tailwind untuk tabel agar lebih konsisten jika sebagian besar stylingmu Tailwind */}
            <table className="w-full min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">Image</th>
                  <th scope="col" className="px-6 py-3">Title</th>
                  <th scope="col" className="px-6 py-3">Price</th>
                  <th scope="col" className="px-6 py-3">Stock</th>
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
                    <td className="px-6 py-4 font-semibold">
                      <span
                        style={{
                          color: (product.stock || 0) <= 5 ? '#ef4444' : (product.stock || 0) <= 10 ? '#f59e0b' : '#10b981',
                        }}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">{new Date(product.createdAt).toLocaleDateString('id-ID')}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {/* Tombol Edit dengan inline style */}
                      <Link
                        href={`/admin/dashboard/products/edit/${product.id}`}
                        style={{
                          fontWeight: 500, // Tailwind: font-medium
                          color: '#2563eb', // Tailwind: text-blue-600 (atau dark:text-blue-500)
                          textDecoration: 'underline', // Tailwind: hover:underline (efek hover default link)
                          marginRight: '0.75rem', // Tailwind: mr-3
                        }}
                      >
                        Edit
                      </Link>
                      {/* Tombol Delete dengan inline style */}
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        style={{
                          fontWeight: 500, // Tailwind: font-medium
                          color: '#dc2626', // Tailwind: text-red-600 (atau dark:text-red-500)
                          textDecoration: 'underline', // Tailwind: hover:underline
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          cursor: 'pointer',
                        }}
                      >
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