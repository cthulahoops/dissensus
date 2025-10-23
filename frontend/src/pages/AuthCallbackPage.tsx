import { AuthCallback } from "../components/AuthCallback";

export const AuthCallbackPage = ({ onSuccess }: { onSuccess: () => void }) => {
  return <AuthCallback onSuccess={onSuccess} />;
};
