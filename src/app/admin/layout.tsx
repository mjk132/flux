"use client";

import { AdminLayout } from "@/components/layout/admin-layout";

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  // Toasts render from <ToastContainer /> in the root layout — mounting a
  // second one here would duplicate every notification.
  return <AdminLayout>{children}</AdminLayout>;
}
