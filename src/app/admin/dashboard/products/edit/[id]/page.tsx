// File: src/app/admin/dashboard/products/edit/[id]/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { FiUser, FiMail, FiShield, FiSave, FiArrowLeft, FiLoader, FiUploadCloud, FiImage } from 'react-icons/fi';

interface Category {
  id: string;
  name: string;
}

interface ProductFormData {
  title: string;
  price: string;
  stock: string;
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
    description: '',
    categoryId: '',
  });

  // State baru untuk gambar
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!productId) {
        setError("Product ID not found.");
        setLoadingInitial(false);
        return;
      }

      setLoadingInitial(true);
      try {
        const [categoriesResponse, productResponse] = await Promise.all([
            fetch('/api/admin/categories'),
            fetch(`/api/admin/products/${productId}`)
        ]);

        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData);
        }

        if (!productResponse.ok) {
          throw new Error('Failed to fetch product data.');
        }
        const productData = await productResponse.json();
        
        setFormData({
          title: productData.title || '',
          price: productData.price?.toString() || '0',
          stock: productData.stock?.toString() || '0',
          description: productData.description || '',
          categoryId: productData.categoryId || '',
        });
        
        // Simpan URL gambar saat ini
        if (productData.imagePreviews && productData.imagePreviews.length > 0) {
            setCurrentImage(productData.imagePreviews[0]);
        }

      } catch (err: any) {
        setError(err.message || 'An error occurred while loading data.');
      } finally {
        setLoadingInitial(false);
      }
    };

    fetchInitialData();
  }, [productId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      let imageUrl = currentImage; // Gunakan gambar lama secara default

      // Jika ada file gambar baru yang dipilih, upload dulu
      if (newImageFile) {
        const uploadResponse = await fetch(`/api/admin/upload?filename=${newImageFile.name}`, {
          method: 'POST',
          body: newImageFile,
        });
        if (!uploadResponse.ok) throw new Error('Image upload failed.');
        const blob = await uploadResponse.json();
        imageUrl = blob.url; // Gunakan URL baru dari Vercel Blob
      }

      const updatedProductData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10),
        categoryId: formData.categoryId || null,
        imagePreviews: imageUrl ? [imageUrl] : [], // Kirim URL gambar yang sudah diperbarui
      };

      // Kirim data lengkap ke API PUT
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProductData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update product.');
      }

      setSuccessMessage('Product updated successfully!');
      setTimeout(() => router.push('/admin/dashboard/products'), 2000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingInitial) { return <div className="p-8 text-center">Loading product data...</div>; }
  
  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px', marginBottom: '16px', border: '1px solid #d1d5db', borderRadius: '0.375rem', background: '#f9fafb' };
  const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151'};

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-white">Edit Product</h1>
        <Link href="/admin/dashboard/products" style={{ padding: '0.5rem 1rem', backgroundColor: '#4B5563', color: 'white', borderRadius: '0.375rem', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>Back</Link>
      </div>

      {error && <p className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">Error: {error}</p>}
      {successMessage && <p className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">{successMessage}</p>}

      {/* --- Perbaikan Struktur Form --- */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-lg shadow-md space-y-6">
        
        {/* Seksi Gambar */}
        <div>
          <label style={labelStyle}>Product Image</label>
          <div className="flex items-center gap-6">
            <div className="w-32 h-32 bg-gray-100 rounded-md flex items-center justify-center">
              {currentImage ? (
                <Image src={currentImage} alt="Current product" width={128} height={128} className="object-contain rounded-md" />
              ) : newImageFile ? (
                <Image src={URL.createObjectURL(newImageFile)} alt="New preview" width={128} height={128} className="object-contain rounded-md" />
              ) : (
                <FiImage className="text-gray-400" size={40} />
              )}
            </div>
            <div>
              <label htmlFor="imageFile" className="cursor-pointer text-sm text-blue-600 hover:text-blue-800 underline">Change Image</label>
              <input type="file" id="imageFile" onChange={handleFileChange} accept="image/*" className="hidden" />
              {newImageFile && <p className="text-xs text-gray-500 mt-2">New: {newImageFile.name}</p>}
            </div>
          </div>
        </div>

        {/* Input Lainnya */}
        <div>
          <label htmlFor="title" style={labelStyle}>Product Title:</label>
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
          <label htmlFor="description" style={labelStyle}>Description (Optional):</label>
          <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={5} style={inputStyle} />
        </div>
        <div>
          <label htmlFor="categoryId" style={labelStyle}>Category (Optional):</label>
          <select id="categoryId" name="categoryId" value={formData.categoryId} onChange={handleInputChange} style={inputStyle}>
            <option value="">-- No Category --</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className="pt-4 flex justify-end">
          <button type="submit" disabled={loading} style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: 500, opacity: loading ? 0.6 : 1, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            {loading ? <FiLoader className="animate-spin" /> : <FiSave />}
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProductPage;
