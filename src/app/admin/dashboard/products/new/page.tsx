// File: src/app/admin/dashboard/products/new/page.tsx (Diperbarui)
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Category {
  id: string;
  name: string;
}

const AddNewProductPage = () => {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [imagePreviews, setImagePreviews] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fungsi untuk mengambil daftar kategori dari API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // === PERUBAHAN DI SINI: Fetch ke API asli ===
        const response = await fetch('/api/admin/categories');
        if (!response.ok) {
            throw new Error("Failed to fetch categories");
        }
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setError("Could not load categories for the dropdown.");
      }
    };
    fetchCategories();
  }, []);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (!title || !price) {
      setError("Title and Price are required.");
      setLoading(false);
      return;
    }

    const productData = {
      title,
      price: parseFloat(price), 
      stock: parseInt(stock, 10),
      imagePreviews: imagePreviews.split(',').map(url => url.trim()).filter(url => url),
      description,
      categoryId: categoryId || null,
    };

    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to add product`);
      }

      setSuccessMessage('Product added successfully!');
      setTimeout(() => router.push('/admin/dashboard/products'), 2000);
    } catch (err: any) {
      setError(err.message || 'An error occurred while adding the product.');
    } finally {
      setLoading(false);
    }
  };

  // ... (sisa kode JSX tidak perlu diubah)
  // ... (untuk keringkasan, saya potong bagian JSX yang tidak berubah)
  // ... (Gunakan kode JSX dari file Anda yang sebelumnya)
  const inputStyle: React.CSSProperties = { width: '100%', padding: '8px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '4px' };
  const buttonStyle: React.CSSProperties = { padding: '10px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };
  const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '5px', fontWeight: '500'};

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Add New Product</h1>
        <Link href="/admin/dashboard/products" style={{ padding: '8px 12px', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
          Back to Product List
        </Link>
      </div>

      {error && <p style={{ color: 'red', marginBottom: '10px' }}>Error: {error}</p>}
      {successMessage && <p style={{ color: 'green', marginBottom: '10px' }}>{successMessage}</p>}

      <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div>
          <label htmlFor="title" style={labelStyle}>Product Title:</label>
          <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required style={inputStyle} />
        </div>
        <div>
          <label htmlFor="price" style={labelStyle}>Price (Rp):</label>
          <input type="number" id="price" value={price} onChange={(e) => setPrice(e.target.value)} required style={inputStyle} />
        </div>
        <div>
           <label htmlFor="stock" style={labelStyle}>Stock:</label>
           <input type="number" id="stock" value={stock} onChange={(e) => setStock(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label htmlFor="imagePreviews" style={labelStyle}>Image URLs (comma-separated):</label>
          <input type="text" id="imagePreviews" value={imagePreviews} onChange={(e) => setImagePreviews(e.target.value)} placeholder="e.g., /url1.jpg, /url2.jpg" style={inputStyle} />
        </div>
        <div>
          <label htmlFor="description" style={labelStyle}>Description (Optional):</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} style={inputStyle} />
        </div>
        <div>
          <label htmlFor="category" style={labelStyle}>Category (Optional):</label>
          <select id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} style={inputStyle}>
            <option value="">-- Select Category --</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={loading} style={{...buttonStyle, marginTop: '15px'}}>
          {loading ? 'Adding...' : 'Add Product'}
        </button>
      </form>
    </div>
  );
};
export default AddNewProductPage;