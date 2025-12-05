

const colors = {
    primary: "#F35B05",        // 주황(대표)
    primaryHover: "#E86E00",
    primaryActive: "#CC6200",

    navy: "#1A2B4C",           // 딥 네이비 (텍스트/헤더)
    blue: "#3A6FF8",           // 보조 CTA (밝은 블루)
    blueHover: "#2F5FCC",
    blueActive: "#2346A3",



    yellowLite: "#FFE38A",

    /* ✅ 보조 블루 추가 */
    blue600: "#2B6CB0",   // Royal Blue
    blue700: "#234E96",

    // neutrals
    white: "#FFFFFF",
    black: "#0B0B0B",
    gray900: "#1E1E1E",
    gray700: "#3F3F46",
    gray500: "#71717A",
    gray400: "#A1A1AA",
    gray300: "#D1D5DB",
    gray200: "#E5E7EB",

    // overlays
    overlayDark: "rgba(0,0,0,.55)",
    overlayMid: "rgba(0,0,0,.28)",
};


export const theme = {
    colors: {
        ...colors,
        heroBg: colors.primary,
        heroText: colors.white,
        borderLightOnBlue: "rgba(255,255,255,.15)",
        dotBg: colors.overlayMid,
        dot: colors.white,

        /* ✅ 섹션 타이틀 바에 사용할 값 */
        sectionTitleBg: colors.gray400,
        sectionTitleText: colors.white,
    },
    sizes: {
        container: "1120px",
        radius: {
            sm: "10px",
            md: "14px",
            lg: "18px",
            xl: "20px",
        },
    },
    shadow: {
        soft: "0 6px 18px rgba(0,0,0,.12)",
    },
};
