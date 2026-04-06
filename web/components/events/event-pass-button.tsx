"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, Clock3, Download, LoaderCircle, MapPin, QrCode, X } from "lucide-react";
import { toDataURL } from "qrcode";

type EventPassButtonProps = {
  eventId: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  className?: string;
};

export function EventPassButton({
  eventId,
  eventName,
  eventDate,
  eventTime,
  eventLocation,
  className,
}: EventPassButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const passPayload = useMemo(
    () =>
      JSON.stringify({
        type: "connectcamp-event-pass",
        eventId,
        eventName,
        eventDate,
        eventTime,
        eventLocation,
      }),
    [eventDate, eventId, eventLocation, eventName, eventTime]
  );

  const handleOpen = async () => {
    setIsOpen(true);

    if (qrDataUrl || isGenerating) return;

    try {
      setIsGenerating(true);
      const nextQr = await toDataURL(passPayload, {
        width: 320,
        margin: 1,
        color: {
          dark: "#111827",
          light: "#FFFFFF",
        },
      });
      setQrDataUrl(nextQr);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen || !isMounted) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMounted, isOpen]);

  const modalContent =
    isOpen && isMounted ? (
      <div className="fixed inset-0 z-[90] flex items-center justify-center bg-gray-950/45 px-4 py-6">
        <div className="relative w-full max-w-md rounded-[28px] bg-white p-6 shadow-[0_30px_100px_-45px_rgba(17,24,39,0.5)]">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close event pass"
            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:bg-gray-50"
          >
            <X size={16} />
          </button>

          <div className="pr-12">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#f4ecfb] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#51237f]">
              <QrCode size={13} />
              Event Pass
            </span>
            <h3 className="mt-4 text-2xl font-black tracking-[-0.03em] text-gray-950">{eventName}</h3>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Show this QR code at event check-in. The pass is tied to this registration and event.
            </p>
          </div>

          <div className="mt-6 rounded-[24px] border border-gray-200 bg-[#fafafa] p-5">
            <div className="mx-auto flex h-[220px] w-[220px] items-center justify-center rounded-[24px] bg-white shadow-[0_16px_34px_-26px_rgba(17,24,39,0.24)]">
              {qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrDataUrl} alt={`QR code for ${eventName}`} className="h-[188px] w-[188px]" />
              ) : (
                <div className="flex flex-col items-center gap-3 text-sm font-medium text-gray-500">
                  <LoaderCircle size={22} className="animate-spin text-[#51237f]" />
                  {isGenerating ? "Generating pass..." : "Preparing your pass"}
                </div>
              )}
            </div>

            <div className="mt-5 grid gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CalendarDays size={15} className="text-[#51237f]" />
                <span>{eventDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock3 size={15} className="text-[#51237f]" />
                <span>{eventTime || "Time TBA"}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={15} className="text-[#51237f]" />
                <span>{eventLocation || "Location TBA"}</span>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {qrDataUrl ? (
              <a
                href={qrDataUrl}
                download={`${eventName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-event-pass.png`}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#51237f] px-5 text-sm font-semibold text-white transition hover:bg-[#45206b]"
              >
                <Download size={15} />
                Download pass
              </a>
            ) : null}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="inline-flex h-11 items-center justify-center rounded-full border border-gray-300 px-5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    ) : null;

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className={
          className ||
          "inline-flex items-center gap-2 rounded-full border border-[#51237f] bg-white px-4 py-2.5 text-sm font-semibold text-[#51237f] transition-colors hover:bg-[#f4ecfb]"
        }
      >
        <QrCode size={16} />
        Event Pass
      </button>

      {modalContent ? createPortal(modalContent, document.body) : null}
    </>
  );
}
