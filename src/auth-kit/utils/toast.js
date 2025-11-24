export const toast = (m) => {
    if (typeof window !== "undefined" && window?.alert) window.alert(m);
    else console.log("[toast]", m);
};