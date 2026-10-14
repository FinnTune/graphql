/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    // The dashboard used to live at /profile (a leftover from the original
    // school-profile assignment). Keep old links and bookmarks working,
    // including their query strings.
    return [{ source: '/profile', destination: '/explore', permanent: true }]
  },
}

module.exports = nextConfig
