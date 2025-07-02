import { AuthCallback } from "../components/AuthCallback";

export const AuthCallbackPage = ({ onSuccess }: { onSuccess: () => void }) => {
  return (
    <div className="App">
      <AuthCallback onSuccess={onSuccess} />
    </div>
  );
};
