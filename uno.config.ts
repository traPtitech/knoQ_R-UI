import { defineConfig, presetAttributify, presetWind3 } from "unocss"

export default defineConfig({
    presets: [
        presetAttributify(),
        presetWind3(),
    ],
    rules: [],
    preflights: [
        {
            getCSS: ({ theme: _theme }) => ` `
        }
    ]
})
