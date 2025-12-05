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
	},
}

module.exports = nextConfig
