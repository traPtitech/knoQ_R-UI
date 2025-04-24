import { presetWebFonts, defineConfig, presetAttributify, presetWind3 } from "unocss"

export default defineConfig({
    presets: [
        presetAttributify(),
        presetWind3(),
        presetWebFonts({
            provider: "google",
            fonts: {
                sans: "Noto Sans JP:400,500"
            }

        })
    ],
    rules: [],
    shortcuts: {
        "hxl": "text-[33px] fw-500",
        "hl": "text-[28px] fw-500",
        "hm": "text-[23px] fw-500",
        "hs": "text-[19px] fw-500",
        "hxs": "text-[16px] fw-500",
        "card": "rd-xl px-5 py-6 b-1 b-solid b-border-secondary"
    },
    theme: {
        colors: {
            border: {
                primary: "#C7C7C7",
                secondary: "#E2E2E2"
            },
            text: {
                primary: "#111C18"
            }
        }
    },
    preflights: [
        {
            getCSS: ({ theme }) => `
                * {
                    color: ${theme.colors.text.primary};
                }
            `
        }
    ]
})
