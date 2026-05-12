// src/routes/sangam.tsx
import { createFileRoute } from '@tanstack/react-router';
import { SangamSearch } from '@/components/sangam/SangamSearch';
import { useLanguage } from '@/context/LanguageContext';

export const Route = createFileRoute('/sangam')({
  component: SangamPage,
});

function SangamPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-red-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-red-600 py-12 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">{t('sangam.title')}</h1>
          <p className="text-amber-100">{t('sangam.subtitle')}</p>
        </div>
      </div>

      {/* Search Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <SangamSearch />
      </div>
    </div>
  );
}
