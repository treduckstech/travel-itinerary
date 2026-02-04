import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdmin(user.email)) {
    redirect("/");
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-auto bg-background p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
