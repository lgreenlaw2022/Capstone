/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // sets default page to Login
  async redirects() {
    return [
      {
        source: "/",
        destination: "/login",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
