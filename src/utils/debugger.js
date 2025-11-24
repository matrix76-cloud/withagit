import { useUser } from "../contexts/UserContext";
export default function DebugUser() {
    const u = useUser();
    if (!u?.initialized) return <div>loading…</div>;
    return (
        <pre>{JSON.stringify({
            phoneE164: u.phoneE164,
            profile: u.profile,
            memberships: u.memberships,
            children: u.children?.map(c => c.childId),
            perms: u.perms,
        }, null, 2)}</pre>
    );
}