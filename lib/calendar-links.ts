import { SLOT_DURATION_MINUTES } from "@/lib/appointments";
import { appointmentStartsAt, type DateKey } from "@/lib/dates";
import { siteConfig } from "@/lib/site";

/** Google Takvim tarih biçimi: 20261012T070000Z */
function gcalDate(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/**
 * Hastanın randevuyu kendi Google Takvim'ine tek tıkla eklemesi için link.
 * (Kurulum gerektirmez; hasta kendi hesabıyla ekler.)
 */
export function googleCalendarTemplateUrl(appointment: { serviceName: string; date: DateKey; timeSlot: string }): string {
  const start = appointmentStartsAt(appointment.date, appointment.timeSlot);
  const end = new Date(start.getTime() + SLOT_DURATION_MINUTES * 60_000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${appointment.serviceName} – ${siteConfig.name}`,
    dates: `${gcalDate(start)}/${gcalDate(end)}`,
    details: `${siteConfig.unit}\nTelefon: ${siteConfig.phoneDisplay}`,
    location: siteConfig.address.full,
    ctz: "Europe/Istanbul",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
