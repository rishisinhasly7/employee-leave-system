"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorNote } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import type { Role } from "@/lib/types";

const home = (role: Role) => (role === "ADMIN" ? "/admin/requests" : "/dashboard");

export default function LoginPage() {
  const { session, ready, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && session) router.replace(home(session.role));
  }, [ready, session, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const s = await login(email.trim(), password);
      router.replace(home(s.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen md:grid-cols-[1.1fr_1fr]">
      <section className="flex flex-col justify-between bg-sidebar p-8 text-sidebar-foreground md:p-14">
        <p className="font-heading text-lg font-bold">ELS</p>
        <div className="my-12 max-w-md">
          <h1 className="text-4xl font-bold leading-tight text-white md:text-5xl">
            One place for every leave decision.
          </h1>
          <p className="mt-5 text-base text-sidebar-foreground/80">
            Employees ask for time off and watch their balance. Administrators approve or reject
            from a single queue.
          </p>
        </div>
        <div className="flex flex-wrap gap-2" aria-hidden>
          <Badge variant="approved">Approved</Badge>
          <Badge variant="pending">Pending</Badge>
          <Badge variant="rejected">Rejected</Badge>
        </div>
      </section>

      <section className="flex items-center justify-center p-8">
        <form onSubmit={onSubmit} className="w-full max-w-sm space-y-5">
          <div>
            <h2 className="text-2xl font-bold">Sign in</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Use the email and password given to you by your administrator.
            </p>
          </div>
          {error && <ErrorNote message={error} />}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </section>
    </main>
  );
}
