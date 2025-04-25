/// <reference types="vitest" />

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import * as path from 'path'
import UnoCSS from "unocss/vite"

// https://vitejs.dev/config/
export default defineConfig(() => ({
    resolve: {
        alias: {
            '/@': path.resolve(__dirname, 'src')
        }
    },
    server: {
        port: 8080
    },
    plugins: [vue(), UnoCSS()],
    test: {
        include: ['tests/unit/**/*.spec.ts']
    }
}))
