export const fmtDateTime = (ts) => {
    if (!ts) return "-";
    let d;

    // Firestore Timestamp 호환
    if (typeof ts?.toDate === "function") d = ts.toDate();
    else if (typeof ts?.seconds === "number") d = new Date(ts.seconds * 1000);
    else if (ts instanceof Date) d = ts;
    else if (typeof ts === "number") d = new Date(ts);
    else if (typeof ts === "string") d = new Date(ts);
    else return "-";

    if (isNaN(d.getTime())) return "-";

    const pad = (n) => String(n).padStart(2, "0");
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());

    return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
};