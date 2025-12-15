/** @type {import('next').NextConfig} */
const nextConfig = {
	basePath: '/flowforge',
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
