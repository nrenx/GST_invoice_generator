import { useProfiles } from "@/hooks/useProfiles";
import { ProfileSelector } from "@/components/ProfileSelector";

const ProfileSelection = () => {
  const { profiles, selectProfile, resetToDefaults } = useProfiles();

  return <ProfileSelector profiles={profiles} onSelectProfile={selectProfile} onResetToDefaults={resetToDefaults} />;
};

export default ProfileSelection;
