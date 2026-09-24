import { StoreLayout } from "@/components/layout/store-layout";

export default function StoreLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StoreLayout>{children}</StoreLayout>;
}
