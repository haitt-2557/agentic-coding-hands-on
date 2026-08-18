// Placeholder `/admin` route — the account menu links here for the `admin` role only
// (components/ui/account-menu.tsx). Visibility is driven by a CLIENT-SIDE mock session, so
// this page is NOT access-controlled and must not be treated as protected: real
// authorization has to be enforced server-side when real auth arrives (see ADR-001).

export default function AdminDashboardPage() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-[1152px] flex-col gap-6 px-6 py-20 text-white">
      <h1 className="text-4xl font-bold text-accent">Admin Dashboard</h1>
      <p className="text-base text-white/80">
        This screen has not been designed yet. It exists so the admin menu item has a real
        destination.
      </p>
    </main>
  );
}
