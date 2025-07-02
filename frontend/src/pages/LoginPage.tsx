
import { LoginForm } from '../components/LoginForm';

export const LoginPage = ({ onSuccess }: { onSuccess: () => void }) => {
  return (
    <div className="App">
      <LoginForm onSuccess={onSuccess} />
    </div>
  );
};
