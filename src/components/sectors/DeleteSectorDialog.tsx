import React, { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EnhancedSector } from "@/types/sector";
import { useTranslation } from "@/contexts/TranslationContext";
import { Loader2, AlertTriangle, School, User, Database } from "lucide-react";
import useDeleteSector from "@/hooks/sectors/useDeleteSector";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface DeleteSectorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (hardDelete?: boolean) => void;
  sector: EnhancedSector;
  isSubmitting?: boolean;
}

const DeleteSectorDialog: React.FC<DeleteSectorDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  sector,
  isSubmitting = false,
}) => {
  const { t } = useTranslation();
  const { checkDependencies, checkingDependencies } = useDeleteSector();
  const [dependencies, setDependencies] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Sector dəyişdikdə dependency yoxlaması et
  useEffect(() => {
    if (isOpen && sector?.id) {
      const loadDependencies = async () => {
        try {
          const deps = await checkDependencies(sector.id);
          setDependencies(deps);
          
          // Əgər dependency varsa, detailləri göstər
          if (deps.schoolCount > 0 || deps.adminCount > 0 || deps.dataEntries > 0) {
            setShowDetails(true);
          }
        } catch (error) {
          console.error('Dependency yoxlama xətası:', error);
        }
      };
      
      loadDependencies();
    }
  }, [isOpen, sector?.id, checkDependencies]);

  const hasDependencies = dependencies && 
    (dependencies.schoolCount > 0 || dependencies.adminCount > 0 || dependencies.dataEntries > 0);

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md sm:max-w-lg mx-4">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            {t("sectors.deleteSector")}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <div>
              {t("sectors.deleteSectorConfirmation")}
              {sector && (
                <span className="font-semibold block mt-2 text-foreground">
                  {sector.name}
                </span>
              )}
            </div>
            
            {checkingDependencies && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Təbəli məlumatlar yoxlanılır...</span>
              </div>
            )}
            
            {dependencies && hasDependencies && (
              <div className="space-y-3 p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2 text-amber-800">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  <span className="font-medium text-sm sm:text-base">DİQQƏT</span>
                </div>
                
                <div className="space-y-2 text-sm text-amber-700">
                  <p className="text-xs sm:text-sm">Bu sektor deaktiv edilsə aşağıdakı təsirlər olacaq:</p>
                  
                  {dependencies.schoolCount > 0 && (
                    <div className="flex items-center gap-2">
                      <School className="h-4 w-4 flex-shrink-0" />
                      <span className="text-xs sm:text-sm">
                        <Badge variant="outline" className="mr-1 text-xs">
                          {dependencies.schoolCount}
                        </Badge>
                        məktəb deaktiv olacaq (qorunacaq)
                      </span>
                    </div>
                  )}
                  
                  {dependencies.adminCount > 0 && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 flex-shrink-0" />
                      <span className="text-xs sm:text-sm">
                        <Badge variant="outline" className="mr-1 text-xs">
                          {dependencies.adminCount}
                        </Badge>
                        admin rolunda dəyişiklik olmayacaq
                      </span>
                    </div>
                  )}
                  
                  {dependencies.dataEntries > 0 && (
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 flex-shrink-0" />
                      <span className="text-xs sm:text-sm">
                        <Badge variant="outline" className="mr-1 text-xs">
                          {dependencies.dataEntries}
                        </Badge>
                        məlumat girişi qorunacaq
                      </span>
                    </div>
                  )}
                  
                  <Separator className="my-2" />
                  <p className="text-xs text-green-600 font-medium">
                    ✅ Tövsiyə: İlk olaraq deaktiv edin. Lazim gəlsə sonra tam silə bilərsiniz.
                  </p>
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                    <p className="text-xs text-red-700">
                      ⚠️ “Tam sil” variantinda bütün əlaqəli məlumatlar da silinəcək!
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {dependencies && !hasDependencies && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">
                  ✅ Bu sektorda təbəli məlumat tapılmadı. Təhlükəsiz silinə bilər.
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-3 sm:gap-2">
          <div className="flex flex-col sm:flex-row justify-end gap-2 w-full">
            <AlertDialogCancel disabled={isSubmitting} className="w-full sm:w-auto">
              {t("common.cancel")}
            </AlertDialogCancel>
            
            {/* İlk təklif - Soft Delete */}
            <AlertDialogAction
              onClick={() => onConfirm(false)}
              disabled={isSubmitting || checkingDependencies}
              className="bg-amber-600 hover:bg-amber-700 w-full sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deaktiv edir...
                </>
              ) : (
                <>
                  📎 Deaktiv et
                  <span className="ml-1 text-xs hidden sm:inline">(tövsiyə edilir)</span>
                </>
              )}
            </AlertDialogAction>
          </div>
          
          {/* Hard Delete - təbəli məlumatlar varsa göstər */}
          {hasDependencies && (
            <div className="w-full">
              <div className="border-t pt-3">
                <p className="text-xs text-muted-foreground mb-2 text-center">
                  ⚠️ Təhlükəli əməliyyat - yalnız əmin olduğunuz halda istifadə edin
                </p>
                <AlertDialogAction
                  onClick={() => onConfirm(true)}
                  disabled={isSubmitting || checkingDependencies}
                  className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  variant="destructive"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Tamamilə silir...
                    </>
                  ) : (
                    <>
                      🗑️ Tamamilə sil
                      <span className="hidden sm:inline">
                        {" "}(geri qaytarıla bilməz)
                      </span>
                    </>
                  )}
                </AlertDialogAction>
              </div>
            </div>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteSectorDialog;
