/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async redirects() {
    return [
      // Area moderasi pindah dari /kontribusi/moderasi (lihat docs/rancangan-moderator.md).
      { source: "/kontribusi/moderasi", destination: "/moderasi/antrean", permanent: true },
    ];
  },
};

export default nextConfig;
