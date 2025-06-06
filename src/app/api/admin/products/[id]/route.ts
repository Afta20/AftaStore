// File: src/app/api/admin/products/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma'; // Sesuaikan path ke Prisma client Anda
import { getToken } from 'next-auth/jwt'; // Untuk otentikasi

// --- GET Handler: Mengambil detail satu produk ---
export async function GET(
  request: NextRequest,
  context: { params: { id: string } } // Next.js App Router context untuk dynamic segments
) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const productId = context.params.id;

  if (!productId) {
    return NextResponse.json({ message: 'Product ID is required' }, { status: 400 });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true, // Sertakan detail kategori jika ada
      },
    });

    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    // Konversi tipe Decimal menjadi number sebelum mengirim respons
    const responseProduct = {
      ...product,
      price: Number(product.price), // Konversi Decimal ke number
      discountedPrice: product.discountedPrice ? Number(product.discountedPrice) : null, // Konversi jika ada
      // Stok sudah integer, jadi tidak perlu konversi
    };

    return NextResponse.json(responseProduct, { status: 200 });
  } catch (error) {
    console.error(`Failed to fetch product ${productId}:`, error);
    return NextResponse.json({ message: `Failed to fetch product: ${productId}` }, { status: 500 });
  }
}

// --- PUT Handler: Memperbarui produk yang ada ---
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const productId = context.params.id;

  if (!productId) {
    return NextResponse.json({ message: 'Product ID is required' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const {
      title,
      price,
      stock, // Ambil stock dari body
      imagePreviews,
      description,
      categoryId,
      // Tambahkan discountedPrice jika Anda juga mengelolanya di form edit
      // discountedPrice,
    } = body;

    // Validasi input dasar
    if (!title || price == null || stock == null) {
      return NextResponse.json({ message: 'Title, Price, and Stock are required' }, { status: 400 });
    }

    const priceNumber = parseFloat(price);
    if (isNaN(priceNumber) || priceNumber < 0) {
        return NextResponse.json({ message: 'Price must be a valid non-negative number.' }, { status: 400 });
    }

    const stockNumber = parseInt(stock, 10);
    if (isNaN(stockNumber) || stockNumber < 0) {
        return NextResponse.json({ message: 'Stock must be a valid non-negative number.' }, { status: 400 });
    }

    // Data untuk update
    const updateData: any = {
      title,
      price: priceNumber,
      stock: stockNumber,
      imagePreviews: imagePreviews || [],
      description: description || null,
    };

    // Handle koneksi kategori
    if (categoryId) {
      updateData.category = { connect: { id: categoryId } };
    } else {
      // Jika categoryId kosong/null, putuskan relasi kategori jika ada sebelumnya
      // Ini mungkin perlu disesuaikan tergantung bagaimana Anda ingin menangani "tidak ada kategori"
      updateData.category = { disconnect: true };
    }
    
    // Jika Anda mengelola discountedPrice:
    // if (discountedPrice != null) {
    //   const discountedPriceNumber = parseFloat(discountedPrice);
    //   if (!isNaN(discountedPriceNumber) && discountedPriceNumber >= 0) {
    //     updateData.discountedPrice = discountedPriceNumber;
    //   } else {
    //     updateData.discountedPrice = null; // atau throw error jika format salah
    //   }
    // } else {
    //   updateData.discountedPrice = null; // Hapus discountedPrice jika dikosongkan
    // }


    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: updateData,
    });

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error: any) {
    console.error(`Failed to update product ${productId}:`, error);
    if (error.code === 'P2025') { // Record to update not found
        return NextResponse.json({ message: 'Product not found for update.' }, { status: 404 });
    }
    return NextResponse.json({ message: `Failed to update product: ${productId}`, error: error.message }, { status: 500 });
  }
}

// --- DELETE Handler: Menghapus produk ---
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const productId = context.params.id;

  if (!productId) {
    return NextResponse.json({ message: 'Product ID is required' }, { status: 400 });
  }

  try {
    // Sebelum menghapus produk, Anda mungkin perlu menangani OrderItem terkait jika ada constraint
    // Misalnya, jika OrderItem memiliki relasi WAJIB ke Produk, Anda mungkin perlu
    // menghapus OrderItem dulu atau meng-set productId di OrderItem menjadi null (jika diizinkan skema).
    // Untuk contoh ini, kita asumsikan relasi bisa langsung dihapus atau ditangani oleh onDelete cascade di Prisma.

    await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error(`Failed to delete product ${productId}:`, error);
    if (error.code === 'P2025') { // Record to delete not found
        return NextResponse.json({ message: 'Product not found for deletion.' }, { status: 404 });
    }
    // Error P2003: Foreign key constraint failed (misalnya jika produk masih ada di OrderItem)
    if (error.code === 'P2003') {
        return NextResponse.json({ message: 'Cannot delete product. It is still referenced in existing orders. Please remove it from orders first or archive the product instead.' }, { status: 409 });
    }
    return NextResponse.json({ message: `Failed to delete product: ${productId}`, error: error.message }, { status: 500 });
  }
}