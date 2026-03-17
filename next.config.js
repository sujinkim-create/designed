/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',

    async rewrites() {
        return [
            {
                source: '/api/v1/:path*',
                destination: 'https://api.openai.com/v1/:path*',
            },
        ];
    },
};

module.exports = nextConfig;
