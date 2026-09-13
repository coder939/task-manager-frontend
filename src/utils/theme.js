const THEME_KEY = "theme";

export function getStoredTheme() {
    try {
        return localStorage.getItem(THEME_KEY) === "dark"
            ? "dark"
            : "light";
    } catch {
        return "light";
    }
}

export function applyTheme(value) {
    const theme =
        value === true || value === "dark"
            ? "dark"
            : "light";

    const root = document.documentElement;
    const body = document.body;

    root.dataset.theme = theme;

    if (body) {
        body.dataset.theme = theme;
    }

    // "only light" opts the light theme out of browser auto-darkening
    // on browsers that support the CSS color-scheme keyword.
    const colorScheme =
        theme === "dark"
            ? "dark"
            : "only light";

    root.style.colorScheme = colorScheme;

    if (body) {
        body.style.colorScheme = colorScheme;
    }

    try {
        localStorage.setItem(THEME_KEY, theme);
    } catch {
        // Keep the theme usable even when storage is unavailable.
    }

    const themeColor = document.querySelector(
        'meta[name="theme-color"]'
    );

    if (themeColor) {
        themeColor.setAttribute(
            "content",
            theme === "dark"
                ? "#111827"
                : "#f5f6f8"
        );
    }

    const colorSchemeMeta =
        document.querySelector(
            'meta[name="color-scheme"]'
        );

    if (colorSchemeMeta) {
        colorSchemeMeta.setAttribute(
            "content",
            theme === "dark"
                ? "dark"
                : "only light"
        );
    }

    return theme;
}
