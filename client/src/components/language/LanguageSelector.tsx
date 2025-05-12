import { useLanguage } from '@/hooks/use-language';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
  variant?: 'default' | 'minimal';
}

const LanguageSelector = ({ variant = 'default' }: LanguageSelectorProps) => {
  const { language, setLanguage } = useLanguage();
  
  const languageOptions = [
    { value: 'pt-PT', label: 'Português 🇵🇹' },
    { value: 'en-US', label: 'English 🇬🇧' }
  ];
  
  if (variant === 'minimal') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Globe className="h-4 w-4" />
            <span className="sr-only">Mudar idioma</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {languageOptions.map(option => (
            <DropdownMenuItem 
              key={option.value}
              onClick={() => setLanguage(option.value as 'pt-PT' | 'en-US')}
              className={language === option.value ? 'bg-accent' : ''}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          {language === 'pt-PT' ? 'Português' : 'English'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languageOptions.map(option => (
          <DropdownMenuItem 
            key={option.value}
            onClick={() => setLanguage(option.value as 'pt-PT' | 'en-US')}
            className={language === option.value ? 'bg-accent' : ''}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;