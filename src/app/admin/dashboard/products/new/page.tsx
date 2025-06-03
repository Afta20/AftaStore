// File: src/app/admin/dashboard/products/new/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Untuk redirect setelah submit

// Definisikan tipe untuk Kategori (jika ingin ada dropdown kategori)
interface Category {
  id: string;
  name: string;
}

const AddNewProductPage = () => {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [imagePreviews, setImagePreviews] = useState(''); // Untuk sementara, simpan URL gambar sebagai string dipisah koma
  const [description, setDescription] = useState(''); // Tambahkan field deskripsi jika perlu
  const [categoryId, setCategoryId] = useState(''); // Untuk memilih kategori
  const [categories, setCategories] = useState<Category[]>([]); // Untuk menyimpan daftar kategori dari DB

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fungsi untuk mengambil daftar kategori (opsional, jika ingin ada pilihan kategori)
  useEffect(() => {
    const fetchCategories = async () => {
      try {

        setCategories([
          { id: 'clxne5028000012mca18d31r7', name: 'Elektronik' }, // Ganti dengan ID kategori asli dari DB-mu
          { id: 'clxne5t4k000212mc999q3s6o', name: 'Aksesoris Komputer' }, // Ganti dengan ID kategori asli dari DB-mu
        ]);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        // Tidak perlu set error di sini agar form tetap bisa digunakan
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
      price: parseFloat(price), // Pastikan harga adalah angka
      imagePreviews: imagePreviews.split(',').map(url => url.trim()).filter(url => url), // Ubah string jadi array URL
      description, // Tambahkan jika ada
      categoryId: categoryId || null, // Kirim null jika tidak ada kategori dipilih
    };

    try {
      const response = await fetch('/api/admin/products', { //  API POST di sini
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Failed to add product: ${response.statusText}` }));
        throw new Error(errorData.message || `Failed to add product`);
      }

      setSuccessMessage('Product added successfully!');
      setTitle('');
      setPrice('');
      setImagePreviews('');
      setDescription('');
      setCategoryId('');
      setTimeout(() => router.push('/admin/dashboard/products'), 2000); // Redirect setelah 2 detik
    } catch (err: any) {
      setError(err.message || 'An error occurred while adding the product.');
      console.error("Add product error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Gaya dasar untuk input dan tombol (inline style)
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