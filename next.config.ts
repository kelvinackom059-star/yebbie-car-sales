import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // next/image only loads pictures from websites we list here
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "i.ytimg.com" }, // YouTube video thumbnails
    ],
  },
};

export default nextConfig;
