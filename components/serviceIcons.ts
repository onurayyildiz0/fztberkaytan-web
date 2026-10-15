import { Activity, ClipboardCheck, MessagesSquare, PersonStanding, type LucideIcon } from "lucide-react";
import type { SERVICES } from "@/lib/services";

export const SERVICE_ICONS: Record<(typeof SERVICES)[number]["slug"], LucideIcon> = {
  "on-degerlendirme": ClipboardCheck,
  fizyoterapi: Activity,
  "fizyoterapi-danismanligi": MessagesSquare,
  "klinik-pilates": PersonStanding,
};
