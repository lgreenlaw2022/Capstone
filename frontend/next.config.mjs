/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

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
};

export default nextConfig;
