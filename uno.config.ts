import { presetWebFonts, defineConfig, presetAttributify, presetWind3, presetIcons } from "unocss"

export default defineConfig({
    presets: [
        presetAttributify(),
        presetWind3(),
        presetIcons(),
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
        "btn-m": "text-[16px] fw-500",
        "cap-m": "text-[13px] text-text-secondary",
        "card": "rd-xl px-5 py-6 bg-surface-primary b-1 b-solid b-border-secondary"
    },
    theme: {
        colors: {
            surface: {
                accentPrimary: "#0E9888",
                primary: "#FFFFFF",
                secondary: "#F1F4F3"
            },
            border: {
                primary: "#C7C7C7",
                secondary: "#E2E2E2",
                accentPrimary: "#067A6F"
            },
            text: {
                primary: "#111C18",
                secondary: "#6A716E"
            },
            background: {
                background: "#F8F8F8"
            }
        }
    },
    preflights: [
        {
            getCSS: ({ theme }) => `
                body {
                    background-color: ${theme.colors.background.background};
                }
                * {
                    color: ${theme.colors.text.primary};
                }
            `
        }
    ]
})
