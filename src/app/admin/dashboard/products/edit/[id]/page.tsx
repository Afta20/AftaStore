// File: src/app/admin/dashboard/products/edit/[id]/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

// Definisikan tipe untuk Kategori dan Produk
interface Category {
  id: string;
  name: string;
}

interface ProductFormData {
  title: string;
  price: string;
  stock: string;
  imagePreviews: string; 
  description: string;
  categoryId: string;
}

const EditProductPage = () => {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [formData, setFormData] = useState<ProductFormData>({
    title: '',
    price: '',
    stock: '',
    imagePreviews: '',
    description: '',
    categoryId: '',
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false); // Untuk submit form
  const [loadingInitial, setLoadingInitial] = useState(true); // Untuk fetch data awal
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 1. Fetch data kategori dan data produk yang akan diedit saat komponen dimuat
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!productId) {
        setError("Product ID not found.");
        setLoadingInitial(false);
        return;
      }

      setLoadingInitial(true);
      try {
        // Fetch kategori (sama seperti di halaman 'new')
        const categoriesResponse = await fetch('/api/admin/categories'); // Asumsi ada API ini
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData);
        }

        // Fetch data produk yang spesifik
        const productResponse = await fetch(`/api/admin/products/${productId}`);
        if (!productResponse.ok) {
          throw new Error('Gagal mengambil data produk.');
        }
        const productData = await productResponse.json();
        
        // Isi form dengan data yang ada
        setFormData({
          title: productData.title || '',
          price: productData.price?.toString() || '0',
          stock: productData.stock?.toString() || '0',
          imagePreviews: productData.imagePreviews?.join(', ') || '',
          description: productData.description || '',
          categoryId: productData.categoryId || '',
        });

      } catch (err: any) {
        setError(err.message || 'Terjadi kesalahan saat memuat data.');
        console.error(err);
      } finally {
        setLoadingInitial(false);
      }
    };

    fetchInitialData();
  }, [productId]);

  // Handler untuk setiap perubahan pada input form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 2. Handler untuk submit form (mengirim data update ke API)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (!formData.title || !formData.price || !formData.stock) {
      setError("Judul, Harga, dan Stok wajib diisi.");
      setLoading(false);
      return;
    }

    const updatedProductData = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock, 10),
      imagePreviews: formData.imagePreviews.split(',').map(url => url.trim()).filter(url => url),
      categoryId: formData.categoryId || null,
    };

    try {
      const response = await fetch(`/api/admin/products/${productId}`, { // API PUT di sini
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProductData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Gagal memperbarui produk.');
      }

      setSuccessMessage('Produk berhasil diperbarui!');
      setTimeout(() => router.push('/admin/dashboard/products'), 2000); // Redirect setelah 2 detik

    } catch (err: any) {
      setError(err.message);
      console.error("Update product error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Tampilan loading data awal
  if (loadingInitial) {
    return <div className="p-8 text-center">Loading...</div>;
  }
  
  // Gaya dasar (bisa diganti dengan kelas Tailwind jika sudah berfungsi)
  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px', marginBottom: '16px', border: '1px solid #d1d5db', borderRadius: '0.375rem', background: '#f9fafb' };
  const buttonStyle: React.CSSProperties = { padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: 500 };
  const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151'};

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-white">Edit Product</h1>
        <Link href="/admin/dashboard/products" className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm font-medium">
          Back
        </Link>
      </div>

      {error && <p className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">Error: {error}</p>}
      {successMessage && <p className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">{successMessage}</p>}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-lg shadow-md space-y-6">
        <div>
          <label htmlFor="title" style={labelStyle}>Product:</label>
          <input type="text" id="title" name="title" value={formData.title} onChange={handleInputChange} required style={inputStyle} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="price" style={labelStyle}>Price (Rp):</label>
                <input type="number" id="price" name="price" value={formData.price} onChange={handleInputChange} required style={inputStyle} />
            </div>
            <div>
                <label htmlFor="stock" style={labelStyle}>Stock:</label>
                <input type="number" id="stock" name="stock" value={formData.stock} onChange={handleInputChange} required style={inputStyle} />
            </div>
        </div>

        <div>
          <label htmlFor="imagePreviews" style={labelStyle}>URL Image:</label>
          <input type="text" id="imagePreviews" name="imagePreviews" value={formData.imagePreviews} onChange={handleInputChange} placeholder="contoh: /url1.jpg, /url2.jpg" style={inputStyle} />
        </div>
        <div>
          <label htmlFor="description" style={labelStyle}>Description (Optional):</label>
          <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={5} style={inputStyle} />
        </div>
        <div>
          <label htmlFor="categoryId" style={labelStyle}>Category (Optional):</label>
            <select id="categoryId" name="categoryId" value={formData.categoryId} onChange={handleInputChange} style={inputStyle}>
            <option value="">-- Choose Category --</option>
            {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
            </select>
        </div>
        <div className="pt-4">
          <button type="submit" disabled={loading} style={{...buttonStyle, opacity: loading ? 0.6 : 1}}>
            {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProductPage;