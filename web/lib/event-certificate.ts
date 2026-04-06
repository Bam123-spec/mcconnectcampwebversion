"use client";

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

type DownloadEventCertificateInput = {
  studentName: string;
  eventName: string;
  clubName: string;
  dateLabel: string;
  eventDate?: string | null;
  eventTime?: string | null;
  location?: string | null;
};

const BRAND = rgb(81 / 255, 35 / 255, 127 / 255);
const BRAND_LIGHT = rgb(244 / 255, 238 / 255, 250 / 255);
const TEXT_DARK = rgb(17 / 255, 24 / 255, 39 / 255);
const TEXT_MUTED = rgb(107 / 255, 114 / 255, 128 / 255);
const BORDER = rgb(229 / 255, 231 / 255, 235 / 255);

const formatCertificateMoment = (eventDate?: string | null, eventTime?: string | null, fallback?: string) => {
  const candidate = eventDate ? new Date(eventDate) : null;
  if (candidate && !Number.isNaN(candidate.getTime())) {
    const datePart = candidate.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    if (eventTime?.trim()) {
      return `${datePart} at ${eventTime.trim()}`;
    }

    return datePart;
  }

  return fallback || "Date and time to be announced";
};

const downloadBlob = (bytes: Uint8Array, filename: string) => {
  const bufferCopy = new Uint8Array(bytes.byteLength);
  bufferCopy.set(bytes);
  const blob = new Blob([bufferCopy.buffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

export async function downloadEventCertificate({
  studentName,
  eventName,
  clubName,
  dateLabel,
  eventDate,
  eventTime,
  location,
}: DownloadEventCertificateInput) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([842, 595]);
  const { width, height } = page.getSize();

  const fontRegular = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(1, 1, 1) });
  page.drawRectangle({ x: 0, y: height - 92, width, height: 92, color: BRAND });
  page.drawRectangle({ x: 40, y: 40, width: width - 80, height: height - 80, borderColor: BORDER, borderWidth: 1 });
  page.drawRectangle({ x: 60, y: 122, width: width - 120, height: 84, color: BRAND_LIGHT, borderColor: BORDER, borderWidth: 1 });

  page.drawText("Montgomery College", {
    x: 56,
    y: height - 52,
    size: 14,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText("Raptor Connect", {
    x: width - 180,
    y: height - 52,
    size: 14,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText("Certificate of Attendance", {
    x: 60,
    y: height - 150,
    size: 30,
    font: fontBold,
    color: TEXT_DARK,
  });

  page.drawText("This certifies that", {
    x: 60,
    y: height - 205,
    size: 14,
    font: fontRegular,
    color: TEXT_MUTED,
  });

  page.drawText(studentName, {
    x: 60,
    y: height - 248,
    size: 28,
    font: fontBold,
    color: BRAND,
  });

  page.drawText("attended", {
    x: 60,
    y: height - 290,
    size: 14,
    font: fontRegular,
    color: TEXT_MUTED,
  });

  page.drawText(eventName, {
    x: 60,
    y: height - 336,
    size: 24,
    font: fontBold,
    color: TEXT_DARK,
    maxWidth: width - 120,
  });

  page.drawText(`Hosted by ${clubName}`, {
    x: 60,
    y: height - 368,
    size: 13,
    font: fontRegular,
    color: TEXT_MUTED,
  });

  page.drawText("Event details", {
    x: 78,
    y: 178,
    size: 12,
    font: fontBold,
    color: BRAND,
  });

  page.drawText(formatCertificateMoment(eventDate, eventTime, dateLabel), {
    x: 78,
    y: 154,
    size: 14,
    font: fontRegular,
    color: TEXT_DARK,
    maxWidth: 300,
  });

  page.drawText(location?.trim() ? location : "Location TBA", {
    x: 78,
    y: 132,
    size: 12,
    font: fontRegular,
    color: TEXT_MUTED,
    maxWidth: 300,
  });

  page.drawText("Issued through Raptor Connect for student involvement records.", {
    x: 60,
    y: 76,
    size: 11,
    font: fontRegular,
    color: TEXT_MUTED,
  });

  page.drawLine({
    start: { x: width - 260, y: 120 },
    end: { x: width - 80, y: 120 },
    thickness: 1,
    color: BORDER,
  });

  page.drawText("Student Life Verification", {
    x: width - 245,
    y: 102,
    size: 11,
    font: fontRegular,
    color: TEXT_MUTED,
  });

  const bytes = await pdf.save();
  const safeStudent = studentName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const safeEvent = eventName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  downloadBlob(bytes, `${safeStudent || "student"}-${safeEvent || "event"}-certificate.pdf`);
}
