
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { checkUserEmailExists } from "./auth.ts";
import { validateSector, validateRequiredParams } from "./validators.ts";
import { createAdminUser } from "./service.ts";
import { corsHeaders } from "./config.ts";

/**
 * Sektor admini təyin etmək üçün əsas funksiya
 * @param sectorId Sektor ID
 * @param adminName Admin adı
 * @param adminEmail Admin e-poçtu
 * @param adminPassword Admin şifrəsi
 * @returns İcra nəticəsi
 */
async function assignSectorAdmin(sectorId: string, adminName: string, adminEmail: string, adminPassword: string) {
  try {
    // İstifadəçinin mövcudluğunu yoxlayaq
    const userExists = await checkUserEmailExists(adminEmail);
    
    if (userExists) {
      throw new Error(`"${adminEmail}" email ünvanı ilə istifadəçi artıq mövcuddur.`);
    }

    // Sektorun mövcudluğunu və statusunu yoxlayaq
    const { valid, sector, error } = await validateSector(sectorId);
    
    if (!valid) {
      throw new Error(error || "Sektor yoxlanışı zamanı xəta baş verdi");
    }

    // Admin istifadəçisini yaradaq
    const result = await createAdminUser(adminName, adminEmail, adminPassword, sectorId);
    
    if (!result.success) {
      throw new Error(result.error || "Admin yaradılarkən xəta baş verdi");
    }
    
    return { 
      success: true, 
      message: "Sektor admini uğurla təyin edildi", 
      adminId: result.adminId 
    };
  } catch (error: any) {
    console.error("Sektor admini təyin edilərkən xəta:", error);
    return { 
      success: false, 
      error: error.message || "Sektor admini təyin edilərkən xəta baş verdi" 
    };
  }
}

serve(async (req) => {
  // CORS preflight sorğuları
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    console.log("Auth header:", authHeader ? "Mövcuddur" : "Mövcud deyil");

    // İstəyin məlumatlarını əldə et
    const requestData = await req.json();
    console.log("Gələn məlumatları:", {
      sectorId: requestData.sectorId,
      adminName: "***",
      adminEmail: requestData.adminEmail ? `${requestData.adminEmail.substring(0, 3)}***` : undefined,
      currentUserEmail: requestData.currentUserEmail ? `${requestData.currentUserEmail.substring(0, 3)}***` : undefined,
    });

    // Parametrləri yoxlayaq
    const validationResult = validateRequiredParams(requestData);
    if (!validationResult.valid) {
      return new Response(
        JSON.stringify({
          success: false,
          error: validationResult.error
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Admin təyin et
    const result = await assignSectorAdmin(
      requestData.sectorId,
      requestData.adminName,
      requestData.adminEmail,
      requestData.adminPassword
    );

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: result.success ? 200 : 400,
    });
  } catch (error: any) {
    console.error("Xəta:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Funksiya icra edilərkən xəta baş verdi",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
