import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const EmailVerificationBanner: React.FC = () => {
  const { user, sendVerificationEmail } = useAuth();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  if (!user || user.emailVerified) return null;

  const handleResend = async () => {
    try {
      setSending(true);
      setError('');
      await sendVerificationEmail();
      setSent(true);
    } catch (err) {
      setError('Failed to send verification email. Please try again later.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            Please verify your email address to access all features.
          </p>
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
          {sent && (
            <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
              <CheckCircle2 size={16} />
              Verification email sent! Please check your inbox.
            </p>
          )}
          <div className="mt-4">
            <button
              onClick={handleResend}
              disabled={sending || sent}
              className="flex items-center gap-2 text-sm text-yellow-700 hover:text-yellow-600 font-medium disabled:opacity-50"
            >
              <Mail size={16} />
              {sending ? 'Sending...' : sent ? 'Email Sent' : 'Resend Verification Email'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationBanner;