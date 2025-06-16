import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { UserRole } from "@/types/auth";
import { useSmartTranslation } from "@/hooks/translation/useSmartTranslation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useRegions } from "@/hooks/regions";
import { useSectorsStore } from "@/hooks/useSectorsStore";
import { useSchools } from "@/hooks/schools";
import { Region } from "@/types/school";
import { Sector } from "@/types/school";
import { School } from "@/types/school";

interface AddUserDialogProps {
  open: boolean;
  onClose: () => void;
  onComplete?: () => void;
  entityTypes?: Array<"region" | "sector" | "school">;
}

interface UserFormData {
  email: string;
  full_name: string;
  role: UserRole;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
}

const AddUserDialog: React.FC<AddUserDialogProps> = ({
  open,
  onClose,
  onComplete,
  entityTypes = ["region", "sector", "school"],
}) => {
  const { tSafe, tModule, tValidation } = useSmartTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { regions } = useRegions();
  const { sectors } = useSectorsStore();
  const { schools } = useSchools();

  const initialRole: UserRole = entityTypes.includes("school")
    ? "schooladmin"
    : entityTypes.includes("sector")
      ? "sectoradmin"
      : entityTypes.includes("region")
        ? "regionadmin"
        : "schooladmin";

  const [formData, setFormData] = useState<UserFormData>(() => ({
    email: "",
    full_name: "",
    role: initialRole,
    region_id: "",
    sector_id: "",
    school_id: "",
  }));

  const formSchema = z.object({
    email: z.string().email({ 
      message: tValidation("email", "invalid_email")
    }),
    full_name: z.string().min(2, { 
      message: tValidation("full_name", "min_length", { min: 2 })
    }),
    role: z.enum(["superadmin", "regionadmin", "sectoradmin", "schooladmin"], {
      required_error: tValidation("role", "required"),
    }),
    region_id: z.string().optional(),
    sector_id: z.string().optional(),
    school_id: z.string().optional(),
  });

  const form = useForm<UserFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      full_name: "",
      role: initialRole,
      region_id: "",
      sector_id: "",
      school_id: "",
    },
  });

  const availableRoles = [
    { 
      value: "schooladmin" as UserRole, 
      label: tModule("userManagement", "roles.schooladmin") 
    },
    { 
      value: "sectoradmin" as UserRole, 
      label: tModule("userManagement", "roles.sectoradmin") 
    },
    { 
      value: "regionadmin" as UserRole, 
      label: tModule("userManagement", "roles.regionadmin") 
    },
  ];

  const handleRoleChange = (value: string) => {
    const newRole = value as UserRole;
    setFormData((prevData) => ({
      ...prevData,
      role: newRole,
      region_id:
        newRole === "regionadmin" || newRole === "sectoradmin"
          ? prevData.region_id
          : "",
      sector_id: newRole === "sectoradmin" ? prevData.sector_id : "",
      school_id: newRole === "schooladmin" ? prevData.school_id : "",
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const onSubmit = async (data: UserFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate success
      toast.success(tModule("userManagement", "messages.user_created"));
      onComplete?.();
      onClose();
      form.reset();
    } catch (error: any) {
      const errorMessage = error.message || tModule("userManagement", "messages.user_not_found");
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {tModule("userManagement", "actions.create_user")}
          </DialogTitle>
          <DialogDescription>
            {tSafe("userManagement.form.description", 
              "İstifadəçi məlumatlarını daxil edib yeni hesab yaradın")}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="text-red-500 text-sm bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {tModule("userManagement", "form.email")}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={tSafe("userManagement.form.enter_email", "example@example.com")}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {tModule("userManagement", "form.full_name")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={tModule("userManagement", "form.enter_full_name")}
                      {...field}
                      value={formData.full_name}
                      onChange={(e) => {
                        field.onChange(e);
                        handleInputChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {tModule("userManagement", "form.role")}
                  </FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleRoleChange(value);
                    }}
                    value={formData.role}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={tModule("userManagement", "form.select_role")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableRoles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(formData.role === "regionadmin" ||
              formData.role === "sectoradmin") && (
              <FormField
                control={form.control}
                name="region_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {tModule("userManagement", "form.region")}
                    </FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setFormData((prev) => ({
                          ...prev,
                          region_id: value,
                          sector_id: "",
                        }));
                      }}
                      value={formData.region_id}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={tModule("userManagement", "form.select_region")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {regions?.map((region) => (
                          <SelectItem key={region.id} value={region.id}>
                            {region.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {formData.role === "sectoradmin" && formData.region_id && (
              <FormField
                control={form.control}
                name="sector_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {tModule("userManagement", "form.sector")}
                    </FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setFormData((prev) => ({
                          ...prev,
                          sector_id: value,
                        }));
                      }}
                      value={formData.sector_id}
                      disabled={isLoading || !formData.region_id}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={tModule("userManagement", "form.select_sector")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sectors?.map((sector) => (
                          <SelectItem key={sector.id} value={sector.id}>
                            {sector.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {formData.role === "schooladmin" && (
              <FormField
                control={form.control}
                name="school_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {tModule("userManagement", "form.school")}
                    </FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setFormData((prev) => ({
                          ...prev,
                          school_id: value,
                        }));
                      }}
                      value={formData.school_id}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={tModule("userManagement", "form.select_school")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {schools?.map((school) => (
                          <SelectItem key={school.id} value={school.id}>
                            {school.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isLoading}
                className="flex-1"
              >
                {tSafe("core.actions.cancel")}
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    {tSafe("core.loading.creating")}
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent ml-2"></div>
                  </>
                ) : (
                  tModule("userManagement", "actions.create_user")
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserDialog;