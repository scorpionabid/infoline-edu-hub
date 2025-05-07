
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguageSafe } from "@/context/LanguageContext";
import { useAuth } from "@/context/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/hooks/auth/useAuthStore";

const ProfileSettings = () => {
  const { t } = useLanguageSafe();
  const { user } = useAuth();
  const { updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [position, setPosition] = useState(user?.position || "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatar || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updates = {
        full_name: fullName,
        phone: phone,
        position: position,
        avatar: avatarUrl,
      };

      if (avatarFile) {
        // Dosya yükleme işlemi
        const timestamp = Date.now();
        const fileExt = avatarFile.name.split(".").pop();
        const filePath = `avatars/${user?.id}-${timestamp}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, avatarFile);

        if (uploadError) {
          throw uploadError;
        }

        // Dosya URL'ini al
        const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
        updates.avatar = data.publicUrl;
        setAvatarUrl(data.publicUrl);
      }

      // Profili güncelle
      await updateUser(updates);

      toast.success(t("profileUpdated"), {
        description: t("profileUpdatedDesc"),
      });
    } catch (error: any) {
      console.error("Profile update error:", error);
      toast.error(t("profileUpdateError"), {
        description: error.message || t("unexpectedError"),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    const file = e.target.files[0];
    if (file.size > 2 * 1024 * 1024) {
      // 2MB limit
      toast.error(t("fileSizeError"), {
        description: t("fileSizeErrorDesc"),
      });
      return;
    }
    setAvatarFile(file);
    setAvatarUrl(URL.createObjectURL(file));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("profileSettings")}</CardTitle>
        <CardDescription>{t("profileSettingsDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center mb-6">
            <div className="relative mb-4">
              <Avatar className="h-24 w-24">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt={user?.full_name || ""} />
                ) : (
                  <AvatarFallback>
                    {user?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
                  </AvatarFallback>
                )}
              </Avatar>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1 cursor-pointer hover:opacity-90 transition-opacity"
              >
                <Camera className="h-4 w-4" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </label>
            </div>
            <p className="text-sm text-muted-foreground">{t("avatarRecommendation")}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">{t("fullName")}</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled // Email değiştirmeye izin vermiyoruz
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{t("phone")}</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t("enterPhone")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">{t("position")}</Label>
              <Input
                id="position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder={t("enterPosition")}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? t("saving") : t("saveChanges")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileSettings;
