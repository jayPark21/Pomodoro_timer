/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'timer-bg': '#121212',
                'timer-focus': '#ff6b6b',
                'timer-break': '#4ecdc4',
            }
        },
    },
    plugins: [],
}
