import { ShareManager } from "../components/ShareManager";

export const ShareManagerPage = ({ onClose }: { onClose: () => void }) => {
  return <ShareManager onClose={onClose} />;
};
