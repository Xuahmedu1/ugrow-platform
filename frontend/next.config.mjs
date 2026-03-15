

[{
	"resource": "/d:/!!/Project Orders Markting/XV1/ugrow-platform/frontend/next.config.mjs",
	"owner": "typescript",
	"code": "1005",
	"severity": 8,
	"message": "',' expected.",
	"source": "ts",
	"startLineNumber": 6,
	"startColumn": 3,
	"endLineNumber": 6,
	"endColumn": 9,
	"modelVersionId": 15,
	"origin": "extHost1"
}]

// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hebbkx1anhila5yf.public.blob.vercel-storage.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;