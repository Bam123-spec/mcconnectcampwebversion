"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, LoaderCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function OtherCollegeLogin({ defaultExpanded = false }: { defaultExpanded?: boolean }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(
    () => email.trim().length > 3 && password.trim().length > 5,
    [email, password]
  );

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError(null);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    if (!data.session) {
      setError("Sign-in succeeded, but no session was returned.");
      setLoading(false);
      return;
    }

    const sessionResponse = await fetch("/auth/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_in: data.session.expires_in,
      }),
    });

    if (!sessionResponse.ok) {
      setError("Could not start a web session. Please try again.");
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  };

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="flex h-14 w-full items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white px-6 text-base font-semibold text-gray-700 shadow-sm transition-all duration-300 hover:border-gray-300 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
      >
        Other College Login
      </button>
    );
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-5">
      <div>
        <label htmlFor="other-college-email" className="mb-2 block text-sm font-semibold text-gray-700">
          School Email
        </label>
        <input
          id="other-college-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="name@college.edu"
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#51237f] focus:ring-2 focus:ring-[#51237f]/15"
          autoComplete="email"
          required
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "other-college-login-error" : undefined}
        />
      </div>

      <div>
        <label htmlFor="other-college-password" className="mb-2 block text-sm font-semibold text-gray-700">
          Password
        </label>
        <input
          id="other-college-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your password"
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#51237f] focus:ring-2 focus:ring-[#51237f]/15"
          autoComplete="current-password"
          required
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "other-college-login-error" : undefined}
        />
      </div>

      {error ? (
        <div id="other-college-login-error" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700" role="alert">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={!canSubmit || loading}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#51237f] px-5 text-sm font-semibold text-white transition hover:bg-[#421d68] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <LoaderCircle size={16} className="animate-spin" /> : null}
          {loading ? "Signing in..." : "Continue"}
        </button>
        <button
          type="button"
          onClick={() => {
            setExpanded(false);
            setEmail("");
            setPassword("");
            setError(null);
          }}
          className="inline-flex min-h-12 items-center justify-center rounded-lg border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
