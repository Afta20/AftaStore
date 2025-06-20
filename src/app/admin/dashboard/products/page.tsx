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
import Image from 'next/image'; // Gunakan Next/Image
import { FiImage } from 'react-icons/fi'; // Ikon untuk placeholder

ChartJS.register(ArcElement, Tooltip, Legend, Title);

// Interface Product Anda yang sudah benar, saya tambahkan 'status'
interface Product {
  id: string;
  title: string;
  price: number;
  stock?: number;
  imagePreviews: string[];
  reviews?: number | null;
  discountedPrice?: number | null;
  category?: {
    name: string;
  } | null;
  createdAt: string;
  status: 'ACTIVE' | 'ARCHIVED'; // Tambahkan status
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

  // Fungsi fetchProducts Anda yang lama, sudah benar
  const fetchProducts = async () => {
    setLoadingProducts(true);
    setProductError(null);
    try {
      // Mengambil semua produk, termasuk yang diarsipkan
      const response = await fetch('/api/admin/products'); 
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.statusText}`);
      }
      const data: Product[] = await response.json();
      setProducts(data);
    } catch (err: any) {
      setProductError(err.message || 'An error occurred');
    } finally {
      setLoadingProducts(false);
    }
  };

  // Fungsi processCategoryData Anda yang lama
  const processCategoryData = (productList: Product[]) => {
    // Grafik hanya menghitung produk yang AKTIF
    const activeProducts = productList.filter(p => p.status === 'ACTIVE');
    if (activeProducts.length === 0) {
      setCategoryDistribution({ labels: [], counts: [] });
      return;
    }
    const counts: { [key: string]: number } = {};
    activeProducts.forEach(product => {
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
    if (!loadingProducts) {
        setLoadingChartData(true);
        try {
            processCategoryData(products);
            setChartError(null);
        } catch (err: any) {
            setChartError("Failed to process category data.");
        } finally {
            setLoadingChartData(false);
        }
    }
  }, [products, loadingProducts]);

  // Fungsi untuk mengarsipkan produk
  const handleArchiveProduct = async (productId: string) => {
    if (window.confirm("Are you sure you want to archive this product? It will be hidden from the public store.")) {
      try {
        const response = await fetch(`/api/admin/products/${productId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'ARCHIVED' }),
        });
        if (!response.ok) throw new Error('Failed to archive product.');
        alert("Product archived successfully.");
        fetchProducts(); // Refresh data
      } catch (err: any) {
        alert(`Error: ${err.message}`);
      }
    }
  };
  
  // Fungsi untuk mengaktifkan kembali produk
  const handleActivateProduct = async (productId: string) => {
    if (window.confirm("Are you sure you want to activate this product? It will be visible in the public store again.")) {
       try {
        const response = await fetch(`/api/admin/products/${productId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'ACTIVE' }),
        });
        if (!response.ok) throw new Error('Failed to activate product.');
        alert("Product activated successfully.");
        fetchProducts(); // Refresh data
      } catch (err: any) {
        alert(`Error: ${err.message}`);
      }
    }
  }

  const categoryPieData = categoryDistribution ? {
    labels: categoryDistribution.labels,
    datasets: [{
      label: 'Number of Products',
      data: categoryDistribution.counts,
      backgroundColor: ['rgba(255, 99, 132, 0.7)', 'rgba(54, 162, 235, 0.7)', 'rgba(255, 206, 86, 0.7)', 'rgba(75, 192, 192, 0.7)', 'rgba(153, 102, 255, 0.7)', 'rgba(255, 159, 64, 0.7)'],
      borderColor: ['#FFFFFF'],
      borderWidth: 2,
    }],
  } : null;

  const categoryPieOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const, labels: { padding: 20, font: { size: 12 }}},
      title: { display: true, text: 'Active Product Distribution by Category', font: { size: 16, weight: 'bold' as 'bold' }, padding: { top: 10, bottom: 20 }},
    },
  };

  const cardStyle: React.CSSProperties = { padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', textAlign: 'center' };
  const cardTitleStyle: React.CSSProperties = { fontSize: '0.875rem', color: '#6B7280', fontWeight: 500, textTransform: 'uppercase', marginBottom: '8px' };
  const cardStatStyle: React.CSSProperties = { fontSize: '2.25rem', fontWeight: 'bold', color: '#1F2937' };
  
  const activeProducts = products.filter(p => p.status === 'ACTIVE');
  const totalStock = activeProducts.reduce((acc, product) => acc + (product.stock || 0), 0);

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
            <h3 style={cardTitleStyle} className="dark:text-gray-300">Active Products</h3>
            <p style={cardStatStyle} className="dark:text-white">{loadingProducts ? '...' : activeProducts.length}</p>
          </div>
          <div style={cardStyle} className="dark:bg-gray-700">
            <h3 style={cardTitleStyle} className="dark:text-gray-300">Total Stocks (Active)</h3>
            <p style={cardStatStyle} className="dark:text-white">{loadingProducts ? '...' : totalStock.toLocaleString('id-ID')}</p>
          </div>
          <div style={cardStyle} className="dark:bg-gray-700">
            <h3 style={cardTitleStyle} className="dark:text-gray-300">Unique Categories</h3>
            <p style={cardStatStyle} className="dark:text-white">{loadingChartData || !categoryDistribution ? '...' : categoryDistribution.labels.length}</p>
          </div>
        </div>
        {loadingChartData && <p className="text-center text-gray-500 dark:text-gray-400">Loading Graphic data...</p>}
        {chartError && <p className="text-center text-red-500">{chartError}</p>}
        {categoryPieData && !loadingChartData && !chartError && categoryDistribution && categoryDistribution.labels.length > 0 && (
          <div className="max-w-md mx-auto h-72 md:h-96">
            <Pie data={categoryPieData} options={categoryPieOptions as any} />
          </div>
        )}
      </div>

      {loadingProducts && <p className="text-center text-gray-500 dark:text-gray-400">Loading Products...</p>}
      {productError && <p className="text-center text-red-500 py-4">Error: {productError}</p>}

      {!loadingProducts && !productError && (
        <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-md rounded-lg">
          <table className="w-full min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">Image</th>
                <th scope="col" className="px-6 py-3">Title</th>
                <th scope="col" className="px-6 py-3">Price</th>
                <th scope="col" className="px-6 py-3">Stock</th>
                <th scope="col" className="px-6 py-3">Category</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className={`border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${product.status !== 'ACTIVE' && 'opacity-60 bg-gray-50 dark:bg-gray-800/50'}`}>
                  <td className="px-6 py-4">
                    {product.imagePreviews && product.imagePreviews.length > 0 ? (
                      <Image src={product.imagePreviews[0]} alt={product.title} width={48} height={48} className="w-12 h-12 object-cover rounded" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center"><FiImage className="text-gray-400"/></div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{product.title}</td>
                  <td className="px-6 py-4">Rp. {(product.discountedPrice ?? product.price).toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4 font-semibold">{product.stock ?? 'N/A'}</td>
                  <td className="px-6 py-4">{product.category?.name || 'Uncategorized'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${product.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <Link href={`/admin/dashboard/products/edit/${product.id}`} style={{ fontWeight: 500, color: '#2563eb', textDecoration: 'underline', marginRight: '1rem' }}>
                      Edit
                    </Link>
                    {/* === PERBAIKAN DI SINI === */}
                    {product.status === 'ACTIVE' ? (
                       <button onClick={() => handleArchiveProduct(product.id)} style={{ fontWeight: 500, color: '#eab308', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}>
                         Archive
                       </button>
                    ) : (
                       <button onClick={() => handleActivateProduct(product.id)} style={{ fontWeight: 500, color: '#22c55e', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}>
                         Activate
                       </button>
                    )}
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
