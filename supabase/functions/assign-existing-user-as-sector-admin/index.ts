
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./config.ts";
import { authenticateAndAuthorize } from "./auth.ts";
import { validateRequiredParams, validateRegionAdminAccess } from "./validators.ts";
import { callAssignSectorAdminFunction } from "./service.ts";

console.log("assign-existing-user-as-sector-admin Edge funksiyası başladıldı");

serve(async (req) => {
  // CORS preflight sorğuları
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // İstifadəçi autentifikasiyasını yoxla
    const authHeader = req.headers.get("Authorization");
    const authResult = await authenticateAndAuthorize(authHeader);
    
    if (!authResult.authorized) {
      return new Response(
        JSON.stringify({ success: false, error: authResult.error }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: authResult.status || 401 }
      );
    }

    // İstəyin məlumatlarını əldə et
    const requestData = await req.json();
    console.log("Gələn sorğu məlumatları:", requestData);

    // Parametrləri yoxla
    const { sectorId, userId } = requestData;
    const paramValidation = validateRequiredParams(sectorId, userId);
    
    if (!paramValidation.valid) {
      return new Response(
        JSON.stringify({ success: false, error: paramValidation.error }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log(`Sektor admin təyinatı başlayır - Sektor ID: ${sectorId}, User ID: ${userId}`);

    // Region admini üçün əlavə yoxlamalar
    const regionAccessResult = await validateRegionAdminAccess(authResult.userData!, sectorId);
    
    if (!regionAccessResult.valid) {
      return new Response(
        JSON.stringify({ success: false, error: regionAccessResult.error }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }

    // SQL funksiyasını çağır və admin təyin et
    const assignResult = await callAssignSectorAdminFunction(userId, sectorId);
    
    if (!assignResult.success) {
      return new Response(
        JSON.stringify({ success: false, error: assignResult.error }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log('Sektor admin uğurla təyin edildi:', assignResult.data);

    // Uğurlu nəticə qaytarma
    return new Response(
      JSON.stringify({
        success: true,
        message: "İstifadəçi sektor admini olaraq təyin edildi",
        data: assignResult.data
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Xəta:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Funksiya icra edilərkən xəta baş verdi",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
