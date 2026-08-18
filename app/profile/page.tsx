// Placeholder `/profile` route — the account menu links here for `user` and `admin`
// (components/ui/account-menu.tsx), and TC ID-59 requires no broken links. Same precedent
// as `/awards` and `/kudos`: the destination is out of scope this run, but a 404 is not an
// acceptable stand-in for "not built yet".

export default function ProfilePage() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-[1152px] flex-col gap-6 px-6 py-20 text-white">
      <h1 className="text-4xl font-bold text-accent">Profile</h1>
      <p className="text-base text-white/80">
        This screen has not been designed yet. It exists so the account menu has a real
        destination.
      </p>
    </main>
  );
}
