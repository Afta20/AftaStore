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

// <-- UBAH: Sesuaikan interface Product untuk menyertakan objek category
interface Product {
  id: string;
  title: string;
  price: number;
  stock?: number;
  imagePreviews: string[];
  reviews?: number | null;
  discountedPrice?: number | null;
  categoryId?: string | null;
  category?: { // Objek kategori dengan nama
    name: string;
  } | null; // Bisa null jika produk tidak punya kategori
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

  // <-- UBAH: Modifikasi processCategoryData untuk menggunakan product.category.name
  const processCategoryData = (productList: Product[]) => {
    if (productList.length === 0) {
      setCategoryDistribution({ labels: [], counts: [] });
      return;
    }
    const counts: { [key: string]: number } = {};

    productList.forEach(product => {
      // Gunakan nama kategori dari product.category.name jika ada,
      // jika tidak, gunakan "Tanpa Kategori"
      const catName = product.category?.name || 'Tanpa Kategori';
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
    } else if (!loadingProducts && products.length === 0) { // Periksa jika loading produk selesai dan produk kosong
        setCategoryDistribution({ labels: [], counts: [] });
        setLoadingChartData(false);
    }
  }, [products, loadingProducts]); // Tambahkan loadingProducts sebagai dependensi

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

  const categoryPieData = categoryDistribution ? {
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
        borderColor: [ // Disesuaikan agar lebih kontras atau seragam
            '#FFFFFF', '#FFFFFF', '#FFFFFF',
            '#FFFFFF', '#FFFFFF', '#FFFFFF',
        ],
        borderWidth: 2, // Sedikit lebih tebal untuk pemisah
      },
    ],
  } : null;

  const categoryPieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
            padding: 20, // Beri jarak pada label legenda
            font: {
                size: 12,
            }
        }
      },
      title: {
        display: true,
        text: 'Distribusi Produk per Kategori',
        font: { size: 16, weight: 'bold' as 'bold' }, // Pertegas judul
        padding: {
            top: 10,
            bottom: 20
        }
      },
      tooltip: {
        callbacks: { // Kustomisasi tooltip
            label: function(context: any) {
                let label = context.dataset.label || '';
                if (label) {
                    label += ': ';
                }
                if (context.parsed !== null) {
                    label += context.parsed;
                }
                return label;
            }
        }
      }
    },
  };

  const cardStyle: React.CSSProperties = {
    padding: '20px', backgroundColor: 'white', borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    textAlign: 'center',
  };
  const cardTitleStyle: React.CSSProperties = {
    fontSize: '0.875rem', color: '#6B7280', fontWeight: 500,
    textTransform: 'uppercase', marginBottom: '8px',
  };
  const cardStatStyle: React.CSSProperties = {
    fontSize: '2.25rem', fontWeight: 'bold', color: '#1F2937',
  };
  const totalStock = products.reduce((acc, product) => acc + (product.stock || 0), 0);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-white">Manage Products</h1>
        <div className="flex gap-3">
          <Link
            href="/admin/dashboard/products/new"
            style={{
              padding: '0.5rem 1rem', backgroundColor: '#22c55e', color: 'white',
              borderRadius: '0.375rem', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500,
            }}
          >
            Add New Product
          </Link>
          <Link
            href="/admin/dashboard"
            style={{
              padding: '0.5rem 1rem', backgroundColor: '#3b82f6', color: 'white',
              borderRadius: '0.375rem', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500,
            }}
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="bg-gray-100 dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-white mb-6 text-center">Product Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8"> {/* Diubah ke 3 kolom */}
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
        {loadingChartData && <p className="text-center text-gray-500 dark:text-gray-400">Loading Graphic data...</p>}
        {chartError && <p className="text-center text-red-500">{chartError}</p>}
        {categoryPieData && !loadingChartData && !chartError && categoryDistribution && categoryDistribution.labels.length > 0 && (
          <div className="max-w-md mx-auto h-72 md:h-96">
            <Pie data={categoryPieData} options={categoryPieOptions as any} />
          </div>
        )}
        {categoryDistribution && categoryDistribution.labels.length === 0 && !loadingChartData && !loadingProducts &&(
            <p className="text-center text-gray-500 dark:text-gray-400">Belum ada data kategori untuk ditampilkan atau tidak ada produk.</p>
        )}
      </div>

      {loadingProducts && <p className="text-center text-gray-500 dark:text-gray-400">Loading Products...</p>}
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
                  <th scope="col" className="px-6 py-3">Stock</th>
                  <th scope="col" className="px-6 py-3">Category</th> {/* <-- TAMBAHKAN Header Kolom Kategori */}
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
                        {product.stock ?? 'N/A'} {/* Tampilkan N/A jika stok null/undefined */}
                      </span>
                    </td>
                    {/* <-- TAMBAHKAN Sel untuk menampilkan Nama Kategori --> */}
                    <td className="px-6 py-4">{product.category?.name || 'Tanpa Kategori'}</td>
                    <td className="px-6 py-4">{new Date(product.createdAt).toLocaleDateString('id-ID')}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/admin/dashboard/products/edit/${product.id}`}
                        style={{
                          fontWeight: 500, color: '#2563eb', textDecoration: 'underline',
                          marginRight: '0.75rem',
                        }}
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        style={{
                          fontWeight: 500, color: '#dc2626', textDecoration: 'underline',
                          background: 'none', border: 'none', padding: 0, cursor: 'pointer',
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
