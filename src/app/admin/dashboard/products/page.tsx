// File: src/app/admin/dashboard/products/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import Image from 'next/image';
import { FiImage } from 'react-icons/fi';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

// Interface Product yang disederhanakan untuk tampilan ini
interface Product {
  id: string;
  title: string;
  price: number;
  discountedPrice?: number | null;
  stock?: number;
  imagePreviews: string[];
  category?: { name: string; } | null;
  createdAt: string;
}

interface CategoryDistributionChartData {
  labels: string[];
  counts: number[];
}

const ManageProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryDistribution, setCategoryDistribution] = useState<CategoryDistributionChartData | null>(null);

  // Fungsi untuk mengambil produk (sekarang hanya mengambil produk yang aktif)
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      // API ini sekarang hanya akan mengembalikan produk AKTIF
      const response = await fetch('/api/admin/products'); 
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.statusText}`);
      }
      const data: Product[] = await response.json();
      setProducts(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Memproses data untuk chart
  const processCategoryData = (productList: Product[]) => {
    if (productList.length === 0) {
      setCategoryDistribution({ labels: [], counts: [] });
      return;
    }
    const counts: { [key: string]: number } = {};
    productList.forEach(product => {
      const catName = product.category?.name || 'Uncategorized';
      counts[catName] = (counts[catName] || 0) + 1;
    });
    setCategoryDistribution({
      labels: Object.keys(counts),
      counts: Object.values(counts),
    });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!loading) {
      processCategoryData(products);
    }
  }, [products, loading]);

  // Fungsi "Delete" yang sebenarnya melakukan arsip
  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm("Are you sure you want to delete this product? It will be hidden from the store.")) {
      try {
        // Kita tetap memanggil method DELETE, backend yang akan menangani logikanya
        const response = await fetch(`/api/admin/products/${productId}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete product.');
        
        alert("Product deleted successfully.");
        fetchProducts(); // Refresh data untuk menghilangkan produk dari tabel
      } catch (err: any) {
        alert(`Error: ${err.message}`);
      }
    }
  };

  // Opsi Chart dari kode Anda
  const categoryPieData = categoryDistribution ? {
    labels: categoryDistribution.labels,
    datasets: [{ data: categoryDistribution.counts, /* ...properti lain... */ }],
  } : null;
  const categoryPieOptions = { /* ...opsi Anda... */ };

  // Kalkulasi statistik dari data yang sudah di-fetch
  const totalStock = products.reduce((acc, product) => acc + (product.stock || 0), 0);
  const uniqueCategoriesCount = categoryDistribution?.labels.length ?? 0;

  // Style inline dari kode Anda
  const cardStyle: React.CSSProperties = { padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', textAlign: 'center' };
  const cardTitleStyle: React.CSSProperties = { fontSize: '0.875rem', color: '#6B7280', fontWeight: 500, textTransform: 'uppercase', marginBottom: '8px' };
  const cardStatStyle: React.CSSProperties = { fontSize: '2.25rem', fontWeight: 'bold', color: '#1F2937' };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-white">Manage Products</h1>
        <div className="flex gap-3">
          <Link href="/admin/dashboard/products/new" style={{ padding: '0.5rem 1rem', backgroundColor: '#22c55e', color: 'white', borderRadius: '0.375rem', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>
            Add New Product
          </Link>
          <Link href="/admin/dashboard" style={{ padding: '0.5rem 1rem', backgroundColor: '#3b82f6', color: 'white', borderRadius: '0.375rem', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>
            Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="bg-gray-100 dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-white mb-6 text-center">Product Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8">
          <div style={cardStyle} className="dark:bg-gray-700">
            <h3 style={cardTitleStyle} className="dark:text-gray-300">Total Products</h3>
            <p style={cardStatStyle} className="dark:text-white">{loading ? '...' : products.length}</p>
          </div>
          <div style={cardStyle} className="dark:bg-gray-700">
            <h3 style={cardTitleStyle} className="dark:text-gray-300">Total Stocks</h3>
            <p style={cardStatStyle} className="dark:text-white">{loading ? '...' : totalStock.toLocaleString('id-ID')}</p>
          </div>
          <div style={cardStyle} className="dark:bg-gray-700">
            <h3 style={cardTitleStyle} className="dark:text-gray-300">Unique Categories</h3>
            <p style={cardStatStyle} className="dark:text-white">{loading ? '...' : uniqueCategoriesCount}</p>
          </div>
        </div>
        {!loading && categoryPieData && <div className="max-w-md mx-auto h-72 md:h-96"><Pie data={categoryPieData} options={categoryPieOptions as any} /></div>}
      </div>

      {!loading && (
        <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-md rounded-lg">
          <table className="w-full min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">Image</th>
                <th scope="col" className="px-6 py-3">Title</th>
                <th scope="col" className="px-6 py-3">Price</th>
                <th scope="col" className="px-6 py-3">Stock</th>
                <th scope="col" className="px-6 py-3">Category</th>
                <th scope="col" className="px-6 py-3">Created At</th>
                <th scope="col" className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="px-6 py-4">
                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                      {product.imagePreviews && product.imagePreviews.length > 0 ? (
                        <Image src={product.imagePreviews[0]} alt={product.title} width={48} height={48} className="object-cover rounded" />
                      ) : <FiImage className="text-gray-400" />}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{product.title}</td>
                  <td className="px-6 py-4">Rp. {(product.discountedPrice ?? product.price).toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4 font-semibold">{product.stock ?? 'N/A'}</td>
                  <td className="px-6 py-4">{product.category?.name || 'Uncategorized'}</td>
                  <td className="px-6 py-4">{new Date(product.createdAt).toLocaleDateString('id-ID')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <Link href={`/admin/dashboard/products/edit/${product.id}`} style={{ fontWeight: 500, color: '#2563eb', textDecoration: 'underline', marginRight: '1rem' }}>Edit</Link>
                    <button onClick={() => handleDeleteProduct(product.id)} style={{ fontWeight: 500, color: '#dc2626', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageProductsPage;
