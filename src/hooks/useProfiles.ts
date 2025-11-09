import { useState, useEffect } from 'react';
import { Profile, DEFAULT_PROFILES } from '@/types/profile';

const PROFILES_STORAGE_KEY = 'invoice-profiles';
const SELECTED_PROFILE_KEY = 'selected-profile-id';

export const useProfiles = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(PROFILES_STORAGE_KEY);
    if (stored) {
      setProfiles(JSON.parse(stored));
    } else {
      setProfiles(DEFAULT_PROFILES);
      localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(DEFAULT_PROFILES));
    }

    const selectedId = localStorage.getItem(SELECTED_PROFILE_KEY);
    if (selectedId) {
      setSelectedProfileId(selectedId);
    }
    
    setIsLoading(false);
  }, []);

  const saveProfiles = (newProfiles: Profile[]) => {
    setProfiles(newProfiles);
    localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(newProfiles));
  };

  const addProfile = (profile: Profile) => {
    const newProfiles = [...profiles, profile];
    saveProfiles(newProfiles);
  };

  const updateProfile = (id: string, updatedProfile: Profile) => {
    const newProfiles = profiles.map(p => p.id === id ? updatedProfile : p);
    saveProfiles(newProfiles);
  };

  const deleteProfile = (id: string) => {
    const newProfiles = profiles.filter(p => p.id !== id);
    saveProfiles(newProfiles);
    if (selectedProfileId === id) {
      setSelectedProfileId(null);
      localStorage.removeItem(SELECTED_PROFILE_KEY);
    }
  };

  const selectProfile = (id: string) => {
    setSelectedProfileId(id);
    localStorage.setItem(SELECTED_PROFILE_KEY, id);
  };

  const getSelectedProfile = (): Profile | null => {
    return profiles.find(p => p.id === selectedProfileId) || null;
  };

  const resetToDefaults = () => {
    setProfiles(DEFAULT_PROFILES);
    localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(DEFAULT_PROFILES));
    setSelectedProfileId(null);
    localStorage.removeItem(SELECTED_PROFILE_KEY);
  };

  return {
    profiles,
    selectedProfileId,
    selectedProfile: getSelectedProfile(),
    isLoading,
    addProfile,
    updateProfile,
    deleteProfile,
    selectProfile,
    resetToDefaults
  };
};
