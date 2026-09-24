import { useState } from "react";
import { AppShell } from "@/components/vcet/AppShell";
import { VcetLogo } from "@/components/vcet/VcetLogo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { api } from "@/convex/_generated/api";
import { useAction, useMutation, useQuery } from "convex/react";
import { useAuth } from "@/hooks/use-auth";
import { Mail, Phone, Save, Hash, GraduationCap, Building2, Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function Profile() {
  const { user } = useAuth();
  const viewer = useQuery(api.portal.getViewer, {});
  const updateProfile = useMutation(api.portal.updateProfile);
  const uploadAvatar = useAction(api.supabaseStorage.uploadFile);
  const storageStatus = useQuery(api.supabaseStatus.storageStatus);

  const [name, setName] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  if (viewer === undefined) {
    return (
      <AppShell>
        <div className="mx-auto max-w-2xl space-y-4">
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </AppShell>
    );
  }

  const currentName = name ?? viewer?.user.name ?? "";
  const currentPhone = phone ?? viewer?.user.phone ?? "";
  const student = viewer?.student;

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-5">
        {/* Header card */}
        <Card className="vcet-card border-[#E5EAF2] shadow-none">
          <CardContent className="flex items-center gap-5 p-6">
            <div className="relative shrink-0">
              <Avatar className="size-20 border-2 border-[#EAF2FC]">
                <AvatarImage src={viewer?.user.image ?? undefined} alt={currentName} />
                <AvatarFallback className="bg-[#0B3B78] text-xl font-semibold text-white">
                  {currentName
                    .split(" ")
                    .map((p: string) => p[0])
                    .slice(0, 2)
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <label
                className={cn(
                  "absolute -bottom-1 -right-1 flex size-7 cursor-pointer items-center justify-center rounded-full bg-[#0B3B78] text-white shadow-md transition-colors hover:bg-[#08315F]",
                  (uploading || storageStatus && !storageStatus.configured) &&
                    "cursor-not-allowed opacity-60",
                )}
                title={
                  storageStatus && !storageStatus.configured
                    ? "Storage not configured — ask the admin to add Supabase keys"
                    : "Upload photo"
                }
              >
                {uploading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Camera className="size-3.5" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    e.target.value = ""; // allow re-picking the same file
                    if (!file) return;
                    if (file.size > 2 * 1024 * 1024) {
                      toast.error("Image is too large. Maximum size is 2 MB.");
                      return;
                    }
                    setUploading(true);
                    try {
                      const base64 = await new Promise<string>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => {
                          const result = String(reader.result);
                          resolve(result.slice(result.indexOf(",") + 1));
                        };
                        reader.onerror = () => reject(reader.error);
                        reader.readAsDataURL(file);
                      });
                      const res = await uploadAvatar({
                        folder: "avatars",
                        filename: file.name,
                        contentType: file.type || "image/jpeg",
                        base64,
                      });
                      await updateProfile({ image: res.url });
                      toast.success("Profile photo updated");
                    } catch (err) {
                      toast.error(
                        err instanceof Error ? err.message : "Upload failed. Try again.",
                      );
                    } finally {
                      setUploading(false);
                    }
                  }}
                />
              </label>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-xl font-bold text-[#0F2542]">
                {currentName || "Student"}
              </h1>
              <p className="mt-0.5 text-sm text-[#5B6B83]">
                {student
                  ? `${student.program} · Year ${student.year}`
                  : viewer?.user.email}
              </p>
              {student && (
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge className="bg-[#EAF2FC] text-[#0B3B78] hover:bg-[#EAF2FC]">
                    <Hash className="mr-1 size-3" /> {student.rollNo}
                  </Badge>
                  <Badge className="bg-[#EAF2FC] text-[#0B3B78] hover:bg-[#EAF2FC]">
                    <Building2 className="mr-1 size-3" /> {student.department}
                  </Badge>
                  <Badge className="bg-[#EAF2FC] text-[#0B3B78] hover:bg-[#EAF2FC]">
                    <GraduationCap className="mr-1 size-3" /> Section {student.section}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Editable details */}
        <Card className="vcet-card border-[#E5EAF2] shadow-none">
          <CardHeader>
            <CardTitle className="text-base text-[#0F2542]">Personal details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="pf-name" className="text-[#0F2542]">
                Full name
              </Label>
              <Input
                id="pf-name"
                value={currentName}
                onChange={(e) => setName(e.target.value)}
                className="h-10 rounded-lg border-[#E5EAF2]"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pf-phone" className="text-[#0F2542]">
                Phone
              </Label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#5B6B83]" />
                <Input
                  id="pf-phone"
                  value={currentPhone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="h-10 rounded-lg border-[#E5EAF2] pl-9"
                  placeholder="10-digit mobile number"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[#0F2542]">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#5B6B83]" />
                <Input
                  value={viewer?.user.email ?? ""}
                  disabled
                  className="h-10 rounded-lg border-[#E5EAF2] bg-[#F4F7FC] pl-9 text-[#5B6B83]"
                />
              </div>
              <p className="text-xs text-[#5B6B83]">Email can't be changed.</p>
            </div>

            <Button
              className="bg-[#0B3B78] hover:bg-[#08315F]"
              disabled={!user}
              onClick={async () => {
                try {
                  await updateProfile({
                    name: currentName.trim() || undefined,
                    phone: currentPhone.trim() || undefined,
                  });
                  setName(null);
                  setPhone(null);
                  toast.success("Profile updated");
                } catch {
                  toast.error("Could not update profile");
                }
              }}
            >
              <Save className="mr-2 size-4" /> Save changes
            </Button>
          </CardContent>
        </Card>

        {/* Academic info */}
        {student && (
          <Card className="vcet-card border-[#E5EAF2] shadow-none">
            <CardHeader>
              <CardTitle className="text-base text-[#0F2542]">Academic info</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <InfoRow label="Roll No" value={student.rollNo} />
              <InfoRow label="Program" value={student.program} />
              <InfoRow label="Department" value={student.department} />
              <InfoRow label="Year / Section" value={`Year ${student.year} · ${student.section}`} />
            </CardContent>
          </Card>
        )}

        <div className="flex justify-center py-4">
          <VcetLogo size={30} />
        </div>
      </div>
    </AppShell>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[#F4F7FC] px-4 py-3">
      <p className="text-xs text-[#5B6B83]">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-[#0F2542]">{value}</p>
    </div>
  );
}
