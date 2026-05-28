import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import laravel from 'laravel-vite-plugin'
import os from 'os'

function getLocalIP() {
    const interfaces = os.networkInterfaces()
    for (const iface of Object.values(interfaces)) {
        for (const cfg of iface) {
            if (cfg.family === 'IPv4' && !cfg.internal) {
                return cfg.address
            }
        }
    }
    return 'localhost'
}

const localIP = getLocalIP()

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/js/main.jsx'],
            refresh: true,
        }),
        react(),
    ],
    server: {
        host: '0.0.0.0',
        port: 5173,
        allowedHosts: [
            'localhost',
            '.trycloudflare.com',
        ],
        hmr: {
            host: localIP,
            port: 5173,
            clientPort: 5173,
        },
        cors: true,
    },
    optimizeDeps: {
        exclude: ['pdfjs-dist'],
    },
})
