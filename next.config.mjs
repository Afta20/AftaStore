/** @type {import('next').NextConfig} */
const nextConfig = {images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        // --- PERHATIAN ---
        // Ganti hostname ini dengan hostname dari URL Vercel Blob Anda.
        // Anda bisa melihatnya saat meng-upload gambar atau dari URL gambar yang sudah ada.
        // Biasanya formatnya adalah <random-string>.public.blob.vercel-storage.com
        hostname: 'https%3A%2F%2F7q1vcc4wq46yhy6g.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
