import { CircleAlert, CircleCheck } from "lucide-react";

type FormAlertProps = {
  type: "error" | "success";
  message: string;
};

export default function FormAlert({ type, message }: FormAlertProps) {
  const isError = type === "error";
  const Icon = isError ? CircleAlert : CircleCheck;

  return (
    <div
      role={isError ? "alert" : "status"}
      className={`flex items-start gap-3 rounded-lg p-3.5 text-sm ${
        isError ? "bg-red-50 text-red-800 ring-1 ring-red-200" : "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200"
      }`}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
