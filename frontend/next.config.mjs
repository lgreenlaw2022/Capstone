/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  // sets default page to Login
  async redirects() {
    return [
      {
        source: "/",
        destination: "/login",
        permanent: false,
      },
    ];
  },

  // Explicitly define environment variables that should be available at runtime
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};

export default nextConfig;
