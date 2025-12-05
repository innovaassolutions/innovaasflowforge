/** @type {import('next').NextConfig} */
const nextConfig = {
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
