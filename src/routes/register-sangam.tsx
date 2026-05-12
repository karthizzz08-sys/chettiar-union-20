// src/routes/register-sangam.tsx
import { createFileRoute } from '@tanstack/react-router';
import { RegisterSangamForm } from '@/components/sangam/RegisterSangamForm';
import { useLanguage } from '@/context/LanguageContext';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';

export const Route = createFileRoute('/register-sangam')({
  component: RegisterSangamPage,
});

function RegisterSangamPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-red-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-red-600 py-12 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">{t('sangam.register_sangam')}</h1>
          <p className="text-amber-100">{t('register_form.description')}</p>
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {submitted ? (
          <div className="bg-green-50 border-2 border-green-600 rounded-lg p-12 text-center max-w-2xl mx-auto">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-900 mb-2">
              {t('register_form.success')}
            </h2>
            <p className="text-green-800 mb-6">
              Thank you for registering your Sangam. Our admin team will review and approve it shortly.
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => navigate({ to: '/' })}
                className="bg-green-600 hover:bg-green-700"
              >
                Go to Home
              </Button>
              <Button
                onClick={() => navigate({ to: '/sangam' })}
                variant="outline"
                className="border-green-600 text-green-600"
              >
                View Sangams
              </Button>
            </div>
          </div>
        ) : (
          <RegisterSangamForm onSuccess={() => setSubmitted(true)} />
        )}
      </div>
    </div>
  );
}
