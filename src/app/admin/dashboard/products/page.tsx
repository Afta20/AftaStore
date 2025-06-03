// File: src/app/admin/dashboard/products/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link'; // Untuk tombol kembali atau navigasi lain

// Definisikan tipe Product (sesuaikan dengan model Prisma Product-mu)
interface Product {
  id: string;
  title: string;
  price: number; // Atau tipe Decimal jika kamu menggunakan itu dan perlu konversi
  imagePreviews: string[]; // Array URL gambar
  reviews?: number | null;
  discountedPrice?: number | null;
  categoryId?: string | null;
  // category?: { name: string }; // Jika kamu include category
  createdAt: string; // Atau Date
}

const ManageProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/products');
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.statusText}`);
      }
      const data = await response.json();
      setProducts(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Fungsi untuk menghapus produk (akan kita implementasikan nanti)
  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      // Logika untuk memanggil API delete produk
      console.log("Deleting product:", productId);
      // Setelah berhasil delete, panggil fetchProducts() lagi untuk refresh daftar
      // Contoh:
      // try {
      //   const res = await fetch(`/api/admin/products/${productId}`, { method: 'DELETE' });
      //   if (!res.ok) throw new Error('Failed to delete product');
      //   fetchProducts(); // Refresh list
      // } catch (err) {
      //   setError('Failed to delete product');
      // }
      alert("Delete functionality not yet implemented.");
    }
  };

  if (loading) return <p>Loading products...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Manage Products</h1>
        <div>
          <Link href="/admin/dashboard/products/new" style={{ marginRight: '10px', padding: '8px 12px', backgroundColor: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
            Add New Product
          </Link>
          <Link href="/admin/dashboard" style={{ padding: '8px 12px', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
            Back to Dashboard
          </Link>
        </div>
      </div>

      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #ddd', backgroundColor: '#f9f9f9' }}>
              <th style={{ padding: '8px', textAlign: 'left' }}>Image</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Title</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Price</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Created At</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '8px' }}>
                  {product.imagePreviews && product.imagePreviews.length > 0 && (
                    <img src={product.imagePreviews[0]} alt={product.title} style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                  )}
                </td>
                <td style={{ padding: '8px' }}>{product.title}</td>
                <td style={{ padding: '8px' }}>Rp. {product.price.toLocaleString('id-ID')}</td>
                <td style={{ padding: '8px' }}>{new Date(product.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: '8px' }}>
                  <Link href={`/admin/dashboard/products/edit/${product.id}`} style={{ marginRight: '8px', color: 'blue' }}>
                    Edit
                  </Link>
                  <button onClick={() => handleDeleteProduct(product.id)} style={{ color: 'red', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ManageProductsPage;