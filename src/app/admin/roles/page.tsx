"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/store/auth";
import { authFetch } from "@/store/auth";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Shield, Users, Crown, User } from "lucide-react";

interface RoleData {
  role: string;
  permissions: string[];
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

const roleLabels: Record<string, string> = {
  OWNER: "المالك",
  ADMIN: "مدير",
  SELLER: "بائع",
  CUSTOMER: "عميل",
};

const roleIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  OWNER: Crown,
  ADMIN: Shield,
  SELLER: Users,
  CUSTOMER: User,
};

const roleColors: Record<string, string> = {
  OWNER: "bg-amber-500/10 text-amber-500",
  ADMIN: "bg-purple-accent/10 text-purple-accent",
  SELLER: "bg-info/10 text-info",
  CUSTOMER: "bg-gray-text/10 text-gray-text",
};

export default function AdminRoles() {
  const [roles, setRoles] = useState<RoleData[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [updating, setUpdating] = useState(false);
  const { user: currentUser } = useAuthStore();

  const isOwner = currentUser?.role === "OWNER";

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [rolesRes, usersRes] = await Promise.all([
        authFetch("/api/admin/roles"),
        authFetch("/api/admin/users?limit=100"),
      ]);
      const rolesJson = await rolesRes.json();
      const usersJson = await usersRes.json();
      setRoles(rolesJson.roles || []);
      setUsers(usersJson.users || []);
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleRoleChange() {
    if (!selectedUser || !selectedRole || !isOwner) return;
    setUpdating(true);
    try {
      await authFetch("/api/admin/roles", {
        method: "PUT",
        body: JSON.stringify({ userId: selectedUser, role: selectedRole }),
      });
      setSelectedUser("");
      setSelectedRole("");
      fetchData();
    } catch {
      /* empty */
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">الأدوار والصلاحيات</h1>

      {/* Roles Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-40 w-full" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {roles.map((role) => {
            const Icon = roleIcons[role.role] || Shield;
            const color = roleColors[role.role] || "bg-gray-text/10 text-gray-text";
            return (
              <Card key={role.role}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`rounded-lg p-2 ${color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{roleLabels[role.role] || role.role}</h3>
                    <p className="text-xs text-gray-text">{role.permissions.length} صلاحية</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {role.permissions.slice(0, 6).map((perm) => (
                    <Badge key={perm} variant="default" className="text-[10px]">
                      {perm}
                    </Badge>
                  ))}
                  {role.permissions.length > 6 && (
                    <Badge variant="default" className="text-[10px]">
                      +{role.permissions.length - 6}
                    </Badge>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Change Role (OWNER only) */}
      {isOwner && (
        <Card>
          <CardHeader>
            <CardTitle>تغيير دور مستخدم</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex-1 sm:max-w-xs">
                <label className="mb-1.5 block text-sm font-medium text-gray-text">المستخدم</label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر مستخدم" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 sm:max-w-xs">
                <label className="mb-1.5 block text-sm font-medium text-gray-text">الدور الجديد</label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الدور" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r.role} value={r.role}>
                        {roleLabels[r.role] || r.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <button
                onClick={handleRoleChange}
                disabled={!selectedUser || !selectedRole || updating}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-purple-accent px-4 text-sm font-medium text-white transition-colors hover:bg-violet disabled:pointer-events-none disabled:opacity-50"
              >
                {updating ? "جاري التحديث..." : "تحديث الدور"}
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {!isOwner && (
        <Card className="border-warning/30 bg-warning/5">
          <p className="text-sm text-warning">فقط المالك يمكنه تغيير أدوار المستخدمين</p>
        </Card>
      )}
    </div>
  );
}
