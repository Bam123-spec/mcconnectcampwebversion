"use client";

import Link from "next/link";
import { Award, Clock, Clock3, QrCode, ShieldCheck, Ticket, Users, MapPin } from "lucide-react";
import { previewActivityMemberships, previewActivityRegistrations } from "@/lib/preview-data";

export function ActivityPanel() {
  const leadershipCount = previewActivityMemberships.filter((membership) => membership.badgeTone === "officer").length;

  return (
    <div className="bg-[#f5f6f8] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Activity</h1>
          <p className="text-gray-600 mt-2">Preview your memberships, event registrations, and campus involvement in one place.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Ticket size={20} className="text-[#51237f]" />
                  Upcoming RSVPs
                </h2>
                <Link href="/events" className="text-sm font-semibold text-[#51237f] hover:underline">
                  Browse Events
                </Link>
              </div>
              <div className="p-6 flex flex-col gap-4">
                {previewActivityRegistrations.map((registration) => (
                  <div
                    key={registration.id}
                    className="flex flex-col sm:flex-row gap-4 border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-green-100 text-green-800">
                          {registration.status}
                        </span>
                        <span className="text-xs font-medium text-gray-500">{registration.clubName}</span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{registration.eventName}</h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-gray-600 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Clock size={16} className="text-gray-400" />
                          {registration.dateLabel}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin size={16} className="text-gray-400" />
                          {registration.location}
                        </div>
                      </div>
                    </div>

                    <div className="sm:border-l sm:border-gray-200 sm:pl-6 flex flex-row sm:flex-col items-center justify-center gap-3 shrink-0">
                      <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 border border-gray-200">
                        {registration.isUpcoming ? <QrCode size={32} /> : <Clock3 size={32} />}
                      </div>
                      <span className="text-sm font-semibold text-[#51237f]">
                        {registration.isUpcoming ? "Preview Pass" : "Preview Event"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Award size={20} className="text-[#51237f]" />
                  My Memberships
                </h2>
                <Link href="/clubs" className="text-sm font-semibold text-[#51237f] hover:underline">
                  Find Groups
                </Link>
              </div>
              <ul className="divide-y divide-gray-100">
                {previewActivityMemberships.map((membership) => (
                  <li key={membership.id} className="p-6 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                    <div className="w-12 h-12 rounded-md bg-[#51237f] flex items-center justify-center text-white font-black text-lg shadow-sm border border-white shrink-0">
                      {membership.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-gray-900 truncate">{membership.name}</h3>
                      <div className="text-sm text-gray-500 mt-0.5">{membership.joinedLabel}</div>
                    </div>
                    <div className="shrink-0 text-right">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
                          membership.badgeTone === "officer"
                            ? "bg-purple-100 text-[#51237f]"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {membership.role}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="space-y-8">
            <section className="bg-[#51237f] text-white rounded-xl shadow-sm p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-10" />
              <h2 className="font-bold text-lg mb-6">Involvement Snapshot</h2>

              <div className="space-y-4">
                <div className="flex justify-between items-end border-b border-white/20 pb-4">
                  <div className="text-purple-200 text-sm font-medium">Registered Events</div>
                  <div className="text-3xl font-black">{previewActivityRegistrations.length}</div>
                </div>
                <div className="flex justify-between items-end border-b border-white/20 pb-4">
                  <div className="text-purple-200 text-sm font-medium">Groups Joined</div>
                  <div className="text-3xl font-black">{previewActivityMemberships.length}</div>
                </div>
                <div className="flex justify-between items-end">
                  <div className="text-purple-200 text-sm font-medium">Leadership Roles</div>
                  <div className="text-3xl font-black">{leadershipCount}</div>
                </div>
              </div>

              <Link
                href="/events"
                className="block w-full mt-6 bg-white text-[#51237f] text-center font-bold py-2.5 rounded-md text-sm hover:bg-gray-50 transition-colors"
              >
                Explore More Events
              </Link>
            </section>

            <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">Preview Notes</h2>
              </div>
              <div className="p-6 space-y-5">
                <div className="flex items-start gap-3">
                  <Users className="text-[#51237f] shrink-0 mt-0.5" size={18} />
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Static showcase mode</h4>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      The activity page is currently using preview content only while the web rollout is being finalized.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ShieldCheck className="text-[#51237f] shrink-0 mt-0.5" size={18} />
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Live sync returns later</h4>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      Real memberships, RSVPs, and officer access can be reconnected once the public preview is live.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
