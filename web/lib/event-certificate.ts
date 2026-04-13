"use client";

import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage, type RGB } from "pdf-lib";

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
const BRAND_DARK = rgb(39 / 255, 19 / 255, 66 / 255);
const BRAND_SOFT = rgb(246 / 255, 241 / 255, 251 / 255);
const SURFACE = rgb(253 / 255, 252 / 255, 255 / 255);
const TEXT_DARK = rgb(17 / 255, 24 / 255, 39 / 255);
const TEXT_MUTED = rgb(102 / 255, 102 / 255, 102 / 255);
const TEXT_LIGHT = rgb(159 / 255, 161 / 255, 164 / 255);
const BORDER = rgb(226 / 255, 221 / 255, 232 / 255);

const splitText = (text: string, font: PDFFont, size: number, maxWidth: number) => {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      line = candidate;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }

  if (line) lines.push(line);
  return lines;
};

const drawWrappedText = ({
  page,
  text,
  x,
  y,
  size,
  font,
  color,
  maxWidth,
  lineHeight = size + 6,
  maxLines,
}: {
  page: PDFPage;
  text: string;
  x: number;
  y: number;
  size: number;
  font: PDFFont;
  color: RGB;
  maxWidth: number;
  lineHeight?: number;
  maxLines?: number;
}) => {
  const lines = splitText(text, font, size, maxWidth);
  const visibleLines = typeof maxLines === "number" ? lines.slice(0, maxLines) : lines;

  visibleLines.forEach((line, index) => {
    const isTruncated = maxLines && index === visibleLines.length - 1 && lines.length > visibleLines.length;
    const renderedLine = isTruncated ? `${line.replace(/[,. ]+$/, "")}...` : line;
    page.drawText(renderedLine, {
      x,
      y: y - index * lineHeight,
      size,
      font,
      color,
    });
  });
};

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
  const fontSerifBold = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const fontSerifItalic = await pdf.embedFont(StandardFonts.TimesRomanItalic);
  const issuedDate = new Date().toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const certificateMoment = formatCertificateMoment(eventDate, eventTime, dateLabel);
  const certificateId = `${eventName}-${studentName}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 34)
    .toUpperCase();

  page.drawRectangle({ x: 0, y: 0, width, height, color: SURFACE });
  page.drawRectangle({ x: 0, y: 0, width: 248, height, color: BRAND_DARK });
  page.drawRectangle({ x: 248, y: 0, width: 10, height, color: BRAND });
  page.drawRectangle({ x: 258, y: 0, width: 7, height, color: BRAND_SOFT });

  page.drawCircle({ x: 64, y: height - 66, size: 98, color: BRAND, opacity: 0.32 });
  page.drawCircle({ x: 206, y: 100, size: 122, color: BRAND, opacity: 0.18 });
  page.drawCircle({ x: 118, y: 300, size: 58, color: rgb(1, 1, 1), opacity: 0.07 });
  page.drawLine({ start: { x: 54, y: 118 }, end: { x: 194, y: 118 }, thickness: 1, color: rgb(1, 1, 1), opacity: 0.28 });

  page.drawText("MONTGOMERY", {
    x: 44,
    y: height - 74,
    size: 12,
    font: fontBold,
    color: rgb(1, 1, 1),
  });
  page.drawText("COLLEGE", {
    x: 44,
    y: height - 92,
    size: 12,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText("Raptor Connect", {
    x: 44,
    y: height - 136,
    size: 10,
    font: fontRegular,
    color: rgb(1, 1, 1),
    opacity: 0.78,
  });

  page.drawText("ATTENDANCE", {
    x: 44,
    y: 218,
    size: 9,
    font: fontBold,
    color: rgb(1, 1, 1),
    opacity: 0.58,
  });
  page.drawText("verified record", {
    x: 44,
    y: 197,
    size: 29,
    font: fontSerifBold,
    color: rgb(1, 1, 1),
  });

  page.drawText("Certificate ID", {
    x: 44,
    y: 88,
    size: 8,
    font: fontBold,
    color: rgb(1, 1, 1),
    opacity: 0.56,
  });
  drawWrappedText({
    page,
    text: certificateId || "ATTENDANCE",
    x: 44,
    y: 70,
    size: 8,
    font: fontRegular,
    color: rgb(1, 1, 1),
    maxWidth: 148,
    lineHeight: 11,
    maxLines: 2,
  });

  page.drawRectangle({ x: 296, y: 46, width: width - 338, height: height - 92, color: rgb(1, 1, 1), borderColor: BORDER, borderWidth: 0.8 });
  page.drawRectangle({ x: 314, y: 64, width: width - 374, height: height - 128, borderColor: BRAND_SOFT, borderWidth: 1 });

  page.drawText("Certificate of Attendance", {
    x: 340,
    y: height - 124,
    size: 38,
    font: fontSerifBold,
    color: BRAND_DARK,
  });
  page.drawText("This official student involvement record certifies that", {
    x: 342,
    y: height - 160,
    size: 11,
    font: fontRegular,
    color: TEXT_MUTED,
  });

  page.drawLine({ start: { x: 342, y: height - 181 }, end: { x: width - 88, y: height - 181 }, thickness: 0.9, color: BORDER });

  drawWrappedText({
    page,
    text: studentName,
    x: 342,
    y: height - 225,
    size: 32,
    font: fontBold,
    color: BRAND,
    maxWidth: width - 426,
    lineHeight: 36,
    maxLines: 2,
  });

  page.drawText("attended and participated in", {
    x: 342,
    y: height - 280,
    size: 11,
    font: fontRegular,
    color: TEXT_MUTED,
  });

  drawWrappedText({
    page,
    text: eventName,
    x: 342,
    y: height - 320,
    size: 25,
    font: fontSerifBold,
    color: TEXT_DARK,
    maxWidth: width - 426,
    lineHeight: 29,
    maxLines: 2,
  });

  page.drawText(`Hosted by ${clubName}`, {
    x: 342,
    y: 220,
    size: 11,
    font: fontRegular,
    color: TEXT_MUTED,
  });

  page.drawRectangle({ x: 342, y: 128, width: width - 426, height: 66, color: BRAND_SOFT, borderColor: BORDER, borderWidth: 0.7 });
  page.drawText("DATE & TIME", { x: 362, y: 170, size: 7.5, font: fontBold, color: TEXT_LIGHT });
  drawWrappedText({
    page,
    text: certificateMoment,
    x: 362,
    y: 153,
    size: 10,
    font: fontRegular,
    color: TEXT_DARK,
    maxWidth: 176,
    lineHeight: 12,
    maxLines: 2,
  });

  page.drawText("LOCATION", { x: 558, y: 170, size: 7.5, font: fontBold, color: TEXT_LIGHT });
  drawWrappedText({
    page,
    text: location?.trim() ? location : "Location TBA",
    x: 558,
    y: 153,
    size: 10,
    font: fontRegular,
    color: TEXT_DARK,
    maxWidth: 176,
    lineHeight: 12,
    maxLines: 2,
  });

  page.drawText("Issued through Raptor Connect for official student involvement records.", {
    x: 342,
    y: 90,
    size: 8.5,
    font: fontRegular,
    color: TEXT_MUTED,
  });

  page.drawLine({ start: { x: width - 250, y: 91 }, end: { x: width - 88, y: 91 }, thickness: 0.8, color: BORDER });
  page.drawText("Student Life Verification", {
    x: width - 242,
    y: 73,
    size: 9,
    font: fontBold,
    color: TEXT_MUTED,
  });
  page.drawText(`Issued ${issuedDate}`, {
    x: width - 242,
    y: 60,
    size: 8,
    font: fontSerifItalic,
    color: TEXT_LIGHT,
  });

  const bytes = await pdf.save();
  const safeStudent = studentName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const safeEvent = eventName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  downloadBlob(bytes, `${safeStudent || "student"}-${safeEvent || "event"}-certificate.pdf`);
}
