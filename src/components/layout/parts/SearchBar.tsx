import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Search, Command } from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';
import { useGlobalSearch } from '@/hooks/layout/useGlobalSearch';
import { Button } from '@/components/ui/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

const SearchBar: React.FC = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const { query, setQuery, results, recentSearches } = useGlobalSearch();

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelect = useCallback((value: string) => {
    const result = results.find(r => r.id === value);
    if (result) {
      result.action();
      setIsOpen(false);
      setQuery('');
    }
  }, [results, setQuery]); // Add results dependency back

  return (
    <>
      {/* Search Trigger Button */}
      <Button
        variant="outline"
        className="relative w-full justify-start text-sm text-muted-foreground hover:bg-accent/50"
        onClick={() => setIsOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden sm:inline">{t("search") || "Axtar..."}</span>
        <span className="sm:hidden">{t("search") || "Axtar"}</span>
        <div className="ml-auto hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <Command className="h-3 w-3" />
            // K
          </kbd>
        </div>
      </Button>

      {/* Command Dialog */}
      <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
        <CommandInput 
          placeholder={t("search.placeholder") || "Məktəb, istifadəçi, kateqoriya axtarın..."} 
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>
            {t("search.noResults") || "Heç bir nəticə tapılmadı."}
          </CommandEmpty>
          
          {/* Search Results */}
          {results.length > 0 && (
            <CommandGroup heading={t("search.results") || "Nəticələr"}>
              {results.map((result) => (
                <CommandItem 
                  key={result.id} 
                  value={result.id}
                  onSelect={handleSelect}
                  className="flex items-center gap-2 p-3"
                >
                  <div className="flex-1">
                    <div className="font-medium">{result.title}</div>
                    {result.subtitle && (
                      <div className="text-sm text-muted-foreground">{result.subtitle}</div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {result.type}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Recent Searches */}
          {query === '' && recentSearches.length > 0 && (
            <CommandGroup heading={t("search.recent") || "Son axtarışlar"}>
              {recentSearches.slice(0, 5).map((search, index) => (
                <CommandItem 
                  key={index} 
                  value={search}
                  onSelect={() => setQuery(search)}
                  className="flex items-center gap-2 p-3"
                >
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <span>{search}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Quick Actions */}
          {query === '' && (
            <CommandGroup heading={t("search.quickActions") || "Sürətli əməliyyatlar"}>
              <CommandItem 
                value="new-school"
                onSelect={() => handleSelect('new-school')}
                className="flex items-center gap-2 p-3"
              >
                <span>Yeni məktəb əlavə et</span>
              </CommandItem>
              <CommandItem 
                value="excel-upload"
                onSelect={() => handleSelect('excel-upload')}
                className="flex items-center gap-2 p-3"
              >
                <span>Excel faylı yüklə</span>
              </CommandItem>
              <CommandItem 
                value="create-report"
                onSelect={() => handleSelect('create-report')}
                className="flex items-center gap-2 p-3"
              >
                <span>Yeni hesabat yarat</span>
              </CommandItem>
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default SearchBar;