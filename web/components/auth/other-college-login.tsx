"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, LoaderCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function OtherCollegeLogin() {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
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

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError(signInError.message);
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
        className="w-full h-16 rounded-2xl border border-gray-200 bg-white shadow-sm flex items-center justify-center gap-3 px-6 text-base font-semibold text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300"
      >
        Other College Login
      </button>
    );
  }

  return (
    <form onSubmit={handleLogin} aria-busy={loading} className="space-y-4 rounded-2xl border border-gray-200 bg-gray-50/70 p-5">
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
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#51237f] focus:ring-2 focus:ring-[#51237f]/15"
          autoComplete="email"
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
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#51237f] focus:ring-2 focus:ring-[#51237f]/15"
          autoComplete="current-password"
        />
      </div>

      {error ? (
        <div aria-live="assertive" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={!canSubmit || loading}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#51237f] px-5 text-sm font-semibold text-white transition hover:bg-[#421d68] disabled:cursor-not-allowed disabled:opacity-60"
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
          className="inline-flex min-h-12 items-center justify-center rounded-xl border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
