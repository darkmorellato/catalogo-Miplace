/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './index.html',
        './app.js',
        './stores.js',
    ],
    darkMode: 'media',
    theme: {
        extend: {
            fontFamily: {
                sans: ['DM Sans', 'sans-serif'],
                serif: ['Playfair Display', 'serif'],
            },
            colors: {
                paper: { DEFAULT: '#f4f4f0', dark: '#eaeaeb' },
                ink:   { DEFAULT: '#1c1917', light: '#44403c' },
                accent: '#991b1b',
            }
        }
    },
    plugins: [],
}
