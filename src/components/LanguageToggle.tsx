import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';

export const LanguageToggle = () => {
  const { lang, setLang } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full"
      onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
      title={lang === 'en' ? 'العربية' : 'English'}
    >
      <span className="text-xs font-bold">{lang === 'en' ? 'ع' : 'EN'}</span>
    </Button>
  );
};
