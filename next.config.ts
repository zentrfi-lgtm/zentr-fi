import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pbs.twimg.com",
        pathname: "/profile_images/**",
      },
      {
        protocol: "https",
        hostname: "id-preview--569ddaf6-086b-470c-801a-01a684ceeb48.lovable.app",
        pathname: "/assets/**",
      },
      {
        protocol: "https",
        hostname: "cdn.mos.cms.futurecdn.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.lot.com",
        pathname: "/**",
      },

      {
        protocol: "https",
        hostname: "www1.grc.nasa.gov",
        pathname: "/**",
      }



      
    ],
  },
  env: {
    // Allow the original Vite-style variable name to work in Next.js builds.
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID:
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ??
      process.env.VITE_WALLETCONNECT_PROJECT_ID,
  },
};

export default nextConfig;
