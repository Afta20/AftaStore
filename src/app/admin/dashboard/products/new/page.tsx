// File: src/app/admin/dashboard/products/new/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiPlus, FiArrowLeft, FiLoader, FiUploadCloud } from 'react-icons/fi';

// Tipe untuk Kategori
interface Category {
  id: string;
  name: string;
}

const AddNewProductPage = () => {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  
  // === PERUBAHAN 1: State untuk menyimpan file gambar ===
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      // Anda bisa mengganti ini dengan fetch API ke /api/admin/categories
      setCategories([
        { id: 'clxne5028000012mca18d31r7', name: 'Elektronik' },
        { id: 'clxne5t4k000212mc999q3s6o', name: 'Aksesoris Komputer' },
      ]);
    };
    fetchCategories();
  }, []);

  // === PERUBAHAN 2: Handler untuk input file ===
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    // === PERUBAHAN 3: Alur Submit Baru ===

    // Langkah A: Pastikan ada file gambar yang dipilih
    if (!imageFile) {
      setError("Please select an image file to upload.");
      setLoading(false);
      return;
    }

    try {
      // Langkah B: Upload gambar terlebih dahulu ke API upload kita
      const imageUploadResponse = await fetch(
        `/api/admin/upload?filename=${imageFile.name}`,
        {
          method: 'POST',
          body: imageFile, // Kirim file mentah sebagai body
        },
      );
      
      if (!imageUploadResponse.ok) {
        throw new Error('Failed to upload image.');
      }

      const newBlob = await imageUploadResponse.json();
      const newImageUrl = newBlob.url; // Dapatkan URL gambar dari Vercel Blob

      // Langkah C: Siapkan data produk dengan URL gambar yang baru
      const productData = {
        title,
        price: parseFloat(price), 
        stock: parseInt(stock, 10),
        imagePreviews: [newImageUrl], // Simpan URL dalam array
        description,
        categoryId: categoryId || null,
      };

      // Langkah D: Kirim data produk lengkap ke API products
      const createProductResponse = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      if (!createProductResponse.ok) {
        const errorData = await createProductResponse.json();
        throw new Error(errorData.message || `Failed to add product`);
      }

      setSuccessMessage('Product added successfully!');
      setTimeout(() => router.push('/admin/dashboard/products'), 2000);
      
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
      console.error("Submit error:", err);
    } finally {
      setLoading(false);
    }
  };
  
  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px', marginBottom: '16px', border: '1px solid #d1d5db', borderRadius: '8px' };
  const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151'};

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">Add New Product</h1>
        <Link href="/admin/dashboard/products" style={{ padding: '8px 12px', backgroundColor: '#4B5563', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
          Back to Product List
        </Link>
      </div>

      {error && <p style={{ color: '#ef4444', marginBottom: '16px', background: '#fee2e2', padding: '10px', borderRadius: '8px' }}>Error: {error}</p>}
      {successMessage && <p style={{ color: '#16a34a', marginBottom: '16px', background: '#dcfce7', padding: '10px', borderRadius: '8px' }}>{successMessage}</p>}

      <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        
        {/* === PERUBAHAN 4: Ganti input teks gambar menjadi input file === */}
        <div>
          <label htmlFor="imageFile" style={labelStyle}>Product Image:</label>
          <div style={{ border: '2px dashed #d1d5db', borderRadius: '8px', padding: '24px', textAlign: 'center' }}>
            <FiUploadCloud style={{ margin: '0 auto 12px', fontSize: '2rem', color: '#9ca3af' }}/>
            <input type="file" id="imageFile" onChange={handleFileChange} required accept="image/png, image/jpeg, image/webp" style={{ display: 'block', width: '100%', color: '#6b7280' }}/>
            {imageFile && <p style={{marginTop: '12px', fontSize: '0.875rem', color: '#4b5563'}}>Selected file: {imageFile.name}</p>}
          </div>
        </div>

        <div style={{marginTop: '16px'}}>
          <label htmlFor="title" style={labelStyle}>Product Title:</label>
          <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required style={inputStyle} />
        </div>
        <div>
          <label htmlFor="price" style={labelStyle}>Price (Rp):</label>
          <input type="number" id="price" value={price} onChange={(e) => setPrice(e.target.value)} required style={inputStyle} />
        </div>
        <div>
          <label htmlFor="stock" style={labelStyle}>Stock:</label>
          <input type="number" id="stock" value={stock} onChange={(e) => setStock(e.target.value)} required style={inputStyle} />
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
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          {loading ? <FiLoader className="animate-spin" /> : <FiPlus />}
          {loading ? 'Submitting...' : 'Add Product'}
        </button>
      </form>
    </div>
  );
};

export default AddNewProductPage;
