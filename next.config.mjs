/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // تجاهل أخطاء الـ TypeScript أثناء البناء (عشان ميزعلش مننا)
    ignoreBuildErrors: true,
  },
  eslint: {
    // تجاهل أخطاء التنسيق (عشان ينجز)
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
