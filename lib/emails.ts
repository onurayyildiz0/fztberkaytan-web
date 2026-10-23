import "server-only";
import { STATUS_LABELS, type AppointmentStatus } from "@/lib/appointments";
import { getAdminEmail } from "@/lib/auth/admin";
import { googleCalendarTemplateUrl } from "@/lib/calendar-links";
import { formatDateLong } from "@/lib/dates";
import { sendEmail } from "@/lib/resend";
import { siteConfig } from "@/lib/site";

type EmailAppointment = {
  serviceName: string;
  date: string; // YYYY-MM-DD
  timeSlot: string;
  notes?: string;
};

type EmailPatient = { name: string; email: string; phone?: string | null };
/** Kliniğin eklediği hastaların e-postası olmayabilir; bu durumda hastaya e-posta atlanır */
type OptionalEmailPatient = { name: string; email: string | null; phone?: string | null };

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function baseUrl(): string {
  return (process.env.AUTH_URL || siteConfig.url).replace(/\/$/, "");
}

function layout(title: string, body: string): string {
  return `<!doctype html>
<html lang="tr"><body style="margin:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#0f172a">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden">
        <tr><td style="background:#0f766e;color:#ffffff;padding:20px 24px;font-size:18px;font-weight:bold">${escapeHtml(siteConfig.name)}</td></tr>
        <tr><td style="padding:24px">
          <h1 style="margin:0 0 16px;font-size:20px">${escapeHtml(title)}</h1>
          ${body}
        </td></tr>
        <tr><td style="padding:16px 24px;background:#f8fafc;font-size:12px;color:#64748b">
          ${escapeHtml(siteConfig.unit)} · ${escapeHtml(siteConfig.address.full)}<br>
          ${escapeHtml(siteConfig.phoneDisplay)} · ${escapeHtml(siteConfig.email)}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function detailsTable(rows: [string, string][]): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:16px 0">
    ${rows
      .map(
        ([k, v]) =>
          `<tr><td style="padding:8px 0;border-bottom:1px solid #e2e8f0;color:#64748b;width:120px">${escapeHtml(k)}</td><td style="padding:8px 0;border-bottom:1px solid #e2e8f0;font-weight:bold">${escapeHtml(v)}</td></tr>`,
      )
      .join("")}
  </table>`;
}

function button(href: string, label: string): string {
  return `<p style="margin:24px 0 0"><a href="${escapeHtml(href)}" style="display:inline-block;background:#0f766e;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:bold">${escapeHtml(label)}</a></p>`;
}

function appointmentRows(a: EmailAppointment): [string, string][] {
  return [
    ["Hizmet", a.serviceName],
    ["Tarih", formatDateLong(a.date)],
    ["Saat", a.timeSlot],
  ];
}

/** Yeni randevu talebi: hastaya bilgilendirme + admin'e uyarı */
export async function sendAppointmentRequestEmails(appointment: EmailAppointment, patient: OptionalEmailPatient) {
  const when = `${formatDateLong(appointment.date)} ${appointment.timeSlot}`;
  const tasks: Promise<boolean>[] = [];

  if (patient.email) {
    tasks.push(
      sendEmail({
        to: patient.email,
        subject: "Randevu talebiniz alındı",
        html: layout(
          "Randevu talebiniz alındı",
          `<p>Merhaba ${escapeHtml(patient.name)},</p>
           <p>Randevu talebiniz bize ulaştı. Fizyoterapist onayladığında size ayrıca e-posta ile bilgi verilecektir.</p>
           ${detailsTable(appointmentRows(appointment))}
           ${button(`${baseUrl()}/hasta-paneli/randevularim`, "Randevularımı Görüntüle")}`,
        ),
        text: `Merhaba ${patient.name},\n\nRandevu talebiniz alındı.\nHizmet: ${appointment.serviceName}\nTarih: ${when}\n\nOnaylandığında size bilgi verilecektir.`,
      }),
    );
  }

  const adminEmail = getAdminEmail();
  if (adminEmail) {
    tasks.push(
      sendEmail({
        to: adminEmail,
        replyTo: patient.email ?? undefined,
        subject: `Yeni randevu talebi: ${patient.name}`,
        html: layout(
          "Yeni bir randevu talebiniz var",
          `${detailsTable([
            ["Hasta", patient.name],
            ["E-posta", patient.email || "-"],
            ["Telefon", patient.phone || "-"],
            ...appointmentRows(appointment),
            ["Not", appointment.notes || "-"],
          ])}
          ${button(`${baseUrl()}/admin`, "Panelde Görüntüle")}`,
        ),
        text: `Yeni bir randevu talebiniz var.\nHasta: ${patient.name}\nHizmet: ${appointment.serviceName}\nTarih: ${when}\nNot: ${appointment.notes || "-"}`,
      }),
    );
  }

  await Promise.all(tasks);
}

const STATUS_MESSAGES: Partial<Record<AppointmentStatus, { subject: string; message: string }>> = {
  approved: {
    subject: "Randevunuz Onaylandı!",
    message: "Randevunuz onaylanmıştır. Belirtilen tarih ve saatte sizi bekliyoruz.",
  },
  rejected: {
    subject: "Randevu talebiniz hakkında",
    message:
      "Maalesef randevu talebiniz onaylanamadı. Farklı bir tarih veya saat için yeni bir randevu talebi oluşturabilir ya da bizimle iletişime geçebilirsiniz.",
  },
  cancelled: {
    subject: "Randevunuz iptal edildi",
    message:
      "Randevunuz fizyoterapist tarafından iptal edilmiştir. Yeni bir randevu için panelinizi kullanabilir veya bizimle iletişime geçebilirsiniz.",
  },
};

/** Admin durum güncellediğinde hastaya bildirim (onay / red / iptal) */
export async function sendStatusUpdateEmail(
  appointment: EmailAppointment,
  patient: OptionalEmailPatient,
  status: AppointmentStatus,
) {
  const content = STATUS_MESSAGES[status];
  if (!content || !patient.email) return;

  await sendEmail({
    to: patient.email,
    subject: content.subject,
    html: layout(
      content.subject,
      `<p>Merhaba ${escapeHtml(patient.name)},</p>
       <p>${escapeHtml(content.message)}</p>
       ${detailsTable([...appointmentRows(appointment), ["Durum", STATUS_LABELS[status]]])}
       ${button(`${baseUrl()}/hasta-paneli/randevularim`, "Randevularımı Görüntüle")}
       ${status === "approved" ? calendarLink(appointment) : ""}`,
    ),
    text: `Merhaba ${patient.name},\n\n${content.message}\n\nHizmet: ${appointment.serviceName}\nTarih: ${formatDateLong(appointment.date)} ${appointment.timeSlot}\nDurum: ${STATUS_LABELS[status]}`,
  });
}

function calendarLink(appointment: EmailAppointment): string {
  return `<p style="margin:16px 0 0;font-size:14px"><a href="${escapeHtml(googleCalendarTemplateUrl(appointment))}" style="color:#0f766e;font-weight:bold">+ Google Takvime Ekle</a></p>`;
}

/** Hasta randevusunu iptal ettiğinde admin'e bilgi */
export async function sendPatientCancelledEmail(appointment: EmailAppointment, patient: EmailPatient) {
  const adminEmail = getAdminEmail();
  if (!adminEmail) return;

  await sendEmail({
    to: adminEmail,
    subject: `Randevu iptali: ${patient.name}`,
    html: layout(
      "Hasta randevusunu iptal etti",
      `${detailsTable([["Hasta", patient.name], ["E-posta", patient.email], ...appointmentRows(appointment)])}
       <p>Bu saat dilimi yeniden randevuya açılmıştır.</p>`,
    ),
    text: `${patient.name} randevusunu iptal etti.\nHizmet: ${appointment.serviceName}\nTarih: ${formatDateLong(appointment.date)} ${appointment.timeSlot}`,
  });
}

/** Kayıt sonrası e-posta doğrulama bağlantısı */
export async function sendVerificationEmail(patient: EmailPatient, link: string, ttlHours: number) {
  // Geliştirme ortamında Resend olmadan da test edilebilmesi için link terminale yazılır
  if (process.env.NODE_ENV !== "production") {
    console.info(`[email] Doğrulama bağlantısı (${patient.email}): ${link}`);
  }

  await sendEmail({
    to: patient.email,
    subject: "E-posta adresinizi doğrulayın",
    html: layout(
      "E-posta adresinizi doğrulayın",
      `<p>Merhaba ${escapeHtml(patient.name)},</p>
       <p>Hesabınızı etkinleştirmek ve online randevu alabilmek için aşağıdaki butona tıklayarak e-posta adresinizi doğrulayın.</p>
       ${button(link, "E-postamı Doğrula")}
       <p style="margin-top:24px;font-size:13px;color:#64748b">Bu bağlantı ${ttlHours} saat geçerlidir ve yalnızca bir kez kullanılabilir. Bu kaydı siz yapmadıysanız bu e-postayı dikkate almayın.</p>`,
    ),
    text: `Merhaba ${patient.name},\n\nE-posta adresinizi doğrulamak için bağlantıyı açın:\n${link}\n\nBağlantı ${ttlHours} saat geçerlidir. Bu kaydı siz yapmadıysanız bu e-postayı dikkate almayın.`,
  });
}

/** Zaten kayıtlı bir adresle tekrar kayıt denendiğinde hesap sahibine bilgi */
export async function sendAccountExistsEmail(patient: EmailPatient, loginUrl: string) {
  await sendEmail({
    to: patient.email,
    subject: "Hesabınız zaten mevcut",
    html: layout(
      "Bu e-posta adresiyle zaten bir hesabınız var",
      `<p>Merhaba ${escapeHtml(patient.name)},</p>
       <p>Bu e-posta adresiyle yeni bir kayıt denemesi yapıldı. Hesabınız zaten mevcut olduğu için yeni hesap oluşturulmadı; mevcut şifrenizle giriş yapabilirsiniz.</p>
       ${button(loginUrl, "Giriş Yap")}
       <p style="margin-top:24px;font-size:13px;color:#64748b">Bu denemeyi siz yapmadıysanız herhangi bir işlem yapmanıza gerek yoktur.</p>`,
    ),
    text: `Merhaba ${patient.name},\n\nBu e-posta adresiyle yeni bir kayıt denemesi yapıldı. Hesabınız zaten mevcut; mevcut şifrenizle giriş yapabilirsiniz: ${loginUrl}`,
  });
}

/** Fizyoterapistin oluşturduğu (onaylı) randevu için hastaya bilgi */
export async function sendClinicAppointmentEmail(
  appointment: EmailAppointment,
  patient: OptionalEmailPatient,
  hasAccount: boolean,
) {
  if (!patient.email) return;
  await sendEmail({
    to: patient.email,
    subject: "Randevunuz oluşturuldu",
    html: layout(
      "Randevunuz oluşturuldu",
      `<p>Merhaba ${escapeHtml(patient.name)},</p>
       <p>Sizin için aşağıdaki randevu oluşturulmuştur. Belirtilen tarih ve saatte sizi bekliyoruz.</p>
       ${detailsTable(appointmentRows(appointment))}
       ${hasAccount ? button(`${baseUrl()}/hasta-paneli/randevularim`, "Randevularımı Görüntüle") : ""}
       ${calendarLink(appointment)}
       <p style="margin-top:24px;font-size:13px;color:#64748b">Değişiklik veya iptal için lütfen ${escapeHtml(siteConfig.phoneDisplay)} numarasından bize ulaşın.</p>`,
    ),
    text: `Merhaba ${patient.name},\n\nSizin için randevu oluşturuldu.\nHizmet: ${appointment.serviceName}\nTarih: ${formatDateLong(appointment.date)} ${appointment.timeSlot}\n\nDeğişiklik için: ${siteConfig.phoneDisplay}`,
  });
}

/** Randevu tarih/saati değiştirildiğinde hastaya bilgi */
export async function sendRescheduledEmail(
  previous: { date: string; timeSlot: string },
  appointment: EmailAppointment,
  patient: OptionalEmailPatient,
  hasAccount: boolean,
) {
  if (!patient.email) return;
  await sendEmail({
    to: patient.email,
    subject: "Randevunuzun tarihi değişti",
    html: layout(
      "Randevunuz güncellendi",
      `<p>Merhaba ${escapeHtml(patient.name)},</p>
       <p>Randevunuzun tarihi ve/veya saati güncellenmiştir.</p>
       ${detailsTable([
         ["Eski tarih", `${formatDateLong(previous.date)} ${previous.timeSlot}`],
         ...appointmentRows(appointment).map(([k, v]): [string, string] => [k === "Tarih" ? "Yeni tarih" : k === "Saat" ? "Yeni saat" : k, v]),
       ])}
       ${hasAccount ? button(`${baseUrl()}/hasta-paneli/randevularim`, "Randevularımı Görüntüle") : ""}
       ${calendarLink(appointment)}`,
    ),
    text: `Merhaba ${patient.name},\n\nRandevunuz güncellendi.\nEski: ${formatDateLong(previous.date)} ${previous.timeSlot}\nYeni: ${formatDateLong(appointment.date)} ${appointment.timeSlot}\nHizmet: ${appointment.serviceName}`,
  });
}

/** Randevudan bir gün önce hatırlatma */
export async function sendReminderEmail(appointment: EmailAppointment, patient: EmailPatient, hasAccount: boolean) {
  await sendEmail({
    to: patient.email,
    subject: `Randevu hatırlatması: Yarın ${appointment.timeSlot.split(" - ")[0]}`,
    html: layout(
      "Yarın randevunuz var",
      `<p>Merhaba ${escapeHtml(patient.name)},</p>
       <p>Yarınki randevunuzu hatırlatmak isteriz.</p>
       ${detailsTable([...appointmentRows(appointment), ["Adres", siteConfig.address.full]])}
       ${hasAccount ? button(`${baseUrl()}/hasta-paneli/randevularim`, "Randevularımı Görüntüle") : ""}
       <p style="margin-top:24px;font-size:13px;color:#64748b">Gelemeyecekseniz lütfen en kısa sürede ${escapeHtml(siteConfig.phoneDisplay)} numarasından bize bilgi verin.</p>`,
    ),
    text: `Merhaba ${patient.name},\n\nYarınki randevunuzu hatırlatırız.\nHizmet: ${appointment.serviceName}\nTarih: ${formatDateLong(appointment.date)} ${appointment.timeSlot}\nAdres: ${siteConfig.address.full}\n\nGelemeyecekseniz lütfen arayın: ${siteConfig.phoneDisplay}`,
  });
}

/** Şifre sıfırlama bağlantısı */
export async function sendPasswordResetEmail(user: EmailPatient, link: string, ttlMinutes: number) {
  if (process.env.NODE_ENV !== "production") {
    console.info(`[email] Şifre sıfırlama bağlantısı (${user.email}): ${link}`);
  }
  await sendEmail({
    to: user.email,
    subject: "Şifre sıfırlama",
    html: layout(
      "Şifrenizi sıfırlayın",
      `<p>Merhaba ${escapeHtml(user.name)},</p>
       <p>Hesabınız için şifre sıfırlama talebi aldık. Yeni şifre belirlemek için aşağıdaki butona tıklayın.</p>
       ${button(link, "Yeni Şifre Belirle")}
       <p style="margin-top:24px;font-size:13px;color:#64748b">Bu bağlantı ${ttlMinutes} dakika geçerlidir ve yalnızca bir kez kullanılabilir. Bu talebi siz yapmadıysanız bu e-postayı dikkate almayın; şifreniz değişmez.</p>`,
    ),
    text: `Merhaba ${user.name},\n\nYeni şifre belirlemek için bağlantıyı açın:\n${link}\n\nBağlantı ${ttlMinutes} dakika geçerlidir. Bu talebi siz yapmadıysanız dikkate almayın.`,
  });
}
