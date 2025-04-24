import { presetWebFonts, defineConfig, presetAttributify, presetWind3 } from "unocss"

export default defineConfig({
    presets: [
        presetAttributify(),
        presetWind3(),
        presetWebFonts({
            provider: "google",
            fonts: {
                sans: "Noto Sans JP"
            }

        })
    ],
    rules: [],
    theme: {
        colors: {
            border: {
                secondary: "#E2E2E2"
            }
        }
    },
    preflights: [
        {
            getCSS: ({ theme: _theme }) => ` `
        }
    ]
})
