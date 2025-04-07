
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./config.ts";
import { authenticateAndAuthorize } from "./auth.ts";
import { validateRequiredParams, validateRegionAdminAccess, validateSectorAdminExists } from "./validators.ts";
import { callAssignSectorAdminFunction } from "./service.ts";

console.log("assign-existing-user-as-sector-admin Edge funksiyası başladıldı");

serve(async (req) => {
  // CORS preflight sorğuları
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    console.log("Yeni sorğu qəbul edildi:", req.method);
    
    // Headers-i daha detallı loqla
    const headersObj = Object.fromEntries(req.headers.entries());
    console.log("Bütün headers:", JSON.stringify(headersObj, null, 2));
    
    // İstifadəçi autentifikasiyasını yoxla
    const authHeader = req.headers.get("Authorization");
    console.log("Auth header alındı:", authHeader ? "Var" : "Yoxdur");
    
    if (!authHeader) {
      console.error("Autorizasiya başlığı yoxdur");
      return new Response(
        JSON.stringify({ success: false, error: "Autorizasiya başlığı tələb olunur" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }
    
    const authResult = await authenticateAndAuthorize(authHeader);
    
    if (!authResult.authorized) {
      console.error("Autorizasiya uğursuz:", authResult.error);
      return new Response(
        JSON.stringify({ success: false, error: authResult.error }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: authResult.status || 401 }
      );
    }

    console.log("Auth uğurludur, userData:", authResult.userData);

    // İstəyin məlumatlarını əldə et
    let requestData;
    try {
      const requestText = await req.text();
      console.log("Raw request body:", requestText);
      
      if (!requestText || requestText.trim() === '') {
        console.error("Request body boşdur");
        return new Response(
          JSON.stringify({ success: false, error: "Sorğu məlumatları təqdim edilməyib" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
      
      // Gələn məlumatları JSON formatında parse et
      try {
        requestData = JSON.parse(requestText);
        console.log("Gələn sorğu məlumatları (parsed):", JSON.stringify(requestData, null, 2));
      } catch (parseError) {
        console.error("JSON parse xətası:", parseError);
        return new Response(
          JSON.stringify({ success: false, error: "Sorğu məlumatları düzgün JSON formatında deyil" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
    } catch (error) {
      console.error("Sorğu məlumatları oxunarkən xəta:", error);
      return new Response(
        JSON.stringify({ success: false, error: "Sorğu məlumatları oxunarkən xəta baş verdi" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Parametrləri yoxla
    const userId = requestData?.userId;
    const sectorId = requestData?.sectorId;
    
    console.log("Parametrlər:", { userId, sectorId });
    
    if (!userId || !sectorId) {
      const errorMessage = !userId 
        ? "İstifadəçi ID təyin edilməyib"
        : "Sektor ID təyin edilməyib";
        
      console.error("Parametr doğrulama xətası:", errorMessage);
      
      return new Response(
        JSON.stringify({ success: false, error: errorMessage }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    const paramValidation = await validateRequiredParams(sectorId, userId);
    
    if (!paramValidation.valid) {
      console.error("Parametr doğrulama xətası:", paramValidation.error);
      return new Response(
        JSON.stringify({ success: false, error: paramValidation.error }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log(`Sektor admin təyinatı başlayır - Sektor ID: ${sectorId}, User ID: ${userId}`);

    // Region admini üçün əlavə yoxlamalar
    if (authResult.userData && authResult.userData.role === 'regionadmin') {
      const regionAccessResult = await validateRegionAdminAccess(authResult.userData, sectorId);
      
      if (!regionAccessResult.valid) {
        console.error("Region giriş hüququ xətası:", regionAccessResult.error);
        return new Response(
          JSON.stringify({ success: false, error: regionAccessResult.error }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
        );
      }
    }

    // Sektorun statusunu yoxla
    const adminExistsResult = await validateSectorAdminExists(sectorId);
    if (!adminExistsResult.valid) {
      console.error("Sektor admin yoxlaması xətası:", adminExistsResult.error);
      return new Response(
        JSON.stringify({ success: false, error: adminExistsResult.error }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log("Region giriş hüququ və admin mövcudluğu təsdiqləndi, SQL funksiyası çağırılır");

    // SQL funksiyasını çağır və admin təyin et
    const assignResult = await callAssignSectorAdminFunction(userId, sectorId);
    
    if (!assignResult.success) {
      console.error("Admin təyin etmə xətası:", assignResult.error);
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
