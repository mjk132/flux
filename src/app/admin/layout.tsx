"use client";

import { AdminLayout } from "@/components/layout/admin-layout";
import { ToastContainer } from "@/components/ui/toast";

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminLayout>
      {children}
      <ToastContainer />
    </AdminLayout>
  );
}
