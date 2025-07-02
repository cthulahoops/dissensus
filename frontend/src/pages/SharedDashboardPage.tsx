import { SharedDashboard } from "../components/SharedDashboard";

export const SharedDashboardPage = ({ token }: { token: string }) => {
  return (
    <div className="App">
      <SharedDashboard token={token} />
    </div>
  );
};
