/** @type {import('next').NextConfig} */
const nextConfig = {
	basePath: '/flowforge',
	// Required for @react-pdf/renderer to work on Vercel serverless
	serverExternalPackages: ['@react-pdf/renderer'],
	experimental: {
		serverActions: {
			bodySizeLimit: '10mb',
		},
	},
	images: {
		domains: ['tlynzgbxrnujphaatagu.supabase.co'],
		// Enable SVG support with security settings
		dangerouslyAllowSVG: true,
		contentDispositionType: 'attachment',
		contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
	},
}

module.exports = nextConfig
