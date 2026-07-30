import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export const useGoogleAuth = () => {
  const { googleLogin } = useAuth();

  const signIn = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!window.google) {
        reject(new Error('Google Identity Services not loaded. Please refresh the page.'));
        return;
      }

      // Initialize Google One Tap / popup flow
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: async (response) => {
          if (!response.credential) {
            reject(new Error('No credential received from Google.'));
            return;
          }
          try {
            await googleLogin(response.credential);
            resolve();
          } catch (err) {
            reject(err);
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Use popup mode which works without a redirect URI
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // One Tap not shown (e.g. browser blocks it) → fall back to renderButton popup
          const btn = document.createElement('div');
          btn.id = '__gsi_hidden_btn';
          btn.style.display = 'none';
          document.body.appendChild(btn);

          window.google.accounts.id.renderButton(btn, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
          });

          // Trigger click on the rendered button's inner element
          setTimeout(() => {
            const inner = btn.querySelector('div[role=button]');
            if (inner) inner.click();
            btn.remove();
          }, 100);
        }
      });
    });
  }, [googleLogin]);

  return { signIn };
};
