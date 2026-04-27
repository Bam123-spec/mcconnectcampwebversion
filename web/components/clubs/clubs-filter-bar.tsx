"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

type ClubsFilterBarProps = {
  initialQuery: string;
  initialCategory?: string;
  initialCampus?: string;
  initialDay?: string;
  categories: string[];
  campuses: string[];
  days: string[];
};

const toFilterValue = (value?: string) => (value && value !== "All" ? value : "All");

export function ClubsFilterBar({
  initialQuery,
  initialCategory,
  initialCampus,
  initialDay,
  categories,
  campuses,
  days,
}: ClubsFilterBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(toFilterValue(initialCategory));
  const [campus, setCampus] = useState(toFilterValue(initialCampus));
  const [day, setDay] = useState(toFilterValue(initialDay));

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();

    const trimmedQuery = query.trim();
    if (trimmedQuery) params.set("q", trimmedQuery);
    if (category !== "All") params.set("category", category);
    if (campus !== "All") params.set("campus", campus);
    if (day !== "All") params.set("day", day);

    const href = params.toString() ? `/clubs?${params.toString()}` : "/clubs";
    router.push(href);
  };

  const reset = () => {
    setQuery("");
    setCategory("All");
    setCampus("All");
    setDay("All");
    router.replace("/clubs");
    router.refresh();
  };

  return (
    <section className="mt-6 rounded-[24px] border border-[var(--line-soft)] bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
      <form
        className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.85fr)_minmax(0,0.85fr)_minmax(0,0.85fr)_auto]"
        onSubmit={submit}
      >
        <label className="field-shell flex items-center gap-3">
          <Search size={18} className="text-gray-400" />
          <input
            type="search"
            name="q"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search clubs by name or keyword"
            className="w-full bg-transparent text-sm text-gray-950 outline-none placeholder:text-gray-400 focus-visible:outline-none"
          />
        </label>

        <label className="block">
          <span className="sr-only">Category</span>
          <select
            name="category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="field-shell h-12 w-full text-sm font-medium text-gray-700 outline-none"
          >
            <option value="All">All categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="sr-only">Campus</span>
          <select
            name="campus"
            value={campus}
            onChange={(event) => setCampus(event.target.value)}
            className="field-shell h-12 w-full text-sm font-medium text-gray-700 outline-none"
          >
            <option value="All">All campuses</option>
            {campuses.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="sr-only">Meeting day</span>
          <select
            name="day"
            value={day}
            onChange={(event) => setDay(event.target.value)}
            className="field-shell h-12 w-full text-sm font-medium text-gray-700 outline-none"
          >
            <option value="All">Any day</option>
            {days.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <div className="flex gap-3">
          <button type="submit" className="btn-primary h-12 px-5 text-sm">
            Search
          </button>
          <button
            type="button"
            onClick={reset}
            className="btn-secondary inline-flex h-12 items-center justify-center px-5 text-sm"
          >
            Reset
          </button>
        </div>
      </form>
    </section>
  );
}
