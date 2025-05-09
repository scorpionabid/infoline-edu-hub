
import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguageSafe } from '@/context/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface LanguageSettingsFormProps {
  currentLanguage: string;
  onSubmit: (language: string) => void;
  loading?: boolean;
}

const LanguageSettingsForm: React.FC<LanguageSettingsFormProps> = ({ 
  currentLanguage, 
  onSubmit,
  loading
}) => {
  const { t, languages, supportedLanguages } = useLanguageSafe();
  const [selectedLanguage, setSelectedLanguage] = React.useState(currentLanguage);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(selectedLanguage);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="pt-6">
          <RadioGroup 
            value={selectedLanguage}
            onValueChange={setSelectedLanguage}
            className="space-y-4"
          >
            {supportedLanguages && supportedLanguages.map(lang => (
              <div key={lang.code} className="flex items-center space-x-2">
                <RadioGroupItem value={lang.code} id={`lang-${lang.code}`} />
                <Label htmlFor={`lang-${lang.code}`} className="flex items-center">
                  {languages && languages[lang.code] && (
                    <span className="mr-2">{languages[lang.code].flag}</span>
                  )}
                  {lang.name}
                </Label>
              </div>
            ))}
          </RadioGroup>
          
          <div className="pt-4">
            <Button type="submit" disabled={loading || selectedLanguage === currentLanguage}>
              {loading ? t('saving') : t('saveLanguageSettings')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

export default LanguageSettingsForm;
