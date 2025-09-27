import { LoginForm } from "../components/LoginForm";

export const LoginPage = ({ onSuccess }: { onSuccess: () => void }) => {
  return (
    <>
      <LoginForm onSuccess={onSuccess} />
    </>
  );
};
