import { useNavigate } from "react-router-dom";
import { Plus, User } from "lucide-react";
import { Profile } from "@/types/profile";
import { Card } from "@/components/ui/card";

interface ProfileSelectorProps {
  profiles: Profile[];
  onSelectProfile: (profileId: string) => void;
}

export const ProfileSelector = ({ profiles, onSelectProfile }: ProfileSelectorProps) => {
  const navigate = useNavigate();

  const handleProfileClick = (profileId: string) => {
    onSelectProfile(profileId);
    navigate("/");
  };

  const handleCustomizeClick = () => {
    navigate("/profile/new");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-primary/85 flex items-center justify-center p-8">
      <div className="max-w-6xl w-full space-y-12 animate-fade-in">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold text-primary-foreground tracking-tight">
            Select Your Profile
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            Choose a profile to begin creating invoices with pre-filled company details
          </p>
        </div>
        
        {/* Profiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((profile) => (
            <Card
              key={profile.id}
              onClick={() => handleProfileClick(profile.id)}
              className="group relative cursor-pointer bg-background/95 backdrop-blur-sm border-2 border-transparent hover:border-accent hover:shadow-2xl transition-all duration-300 overflow-hidden"
            >
              {/* Hover Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent/0 via-accent/0 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative p-8 space-y-6">
                {/* Avatar */}
                <div className="flex justify-center">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-lg">
                    <User className="w-12 h-12 text-accent" strokeWidth={2.5} />
                  </div>
                </div>
                
                {/* Profile Info */}
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold text-foreground group-hover:text-accent transition-colors">
                    {profile.name}
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium">
                    {profile.companyDetails.companyName}
                  </p>
                  <p className="text-xs text-muted-foreground/60">
                    {profile.companyDetails.city}, {profile.companyDetails.state}
                  </p>
                </div>
                
                {/* Hover Indicator */}
                <div className="flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                    Click to select →
                  </span>
                </div>
              </div>
            </Card>
          ))}

          {/* Create New Profile Card */}
          <Card
            onClick={handleCustomizeClick}
            className="group relative cursor-pointer bg-gradient-to-br from-background/95 to-background/90 backdrop-blur-sm border-2 border-dashed border-accent/40 hover:border-accent hover:shadow-2xl transition-all duration-300 overflow-hidden"
          >
            {/* Hover Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-accent/0 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative p-8 space-y-6 flex flex-col justify-center h-full">
              {/* Icon */}
              <div className="flex justify-center">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Plus className="w-12 h-12 text-accent group-hover:rotate-90 transition-transform duration-300" strokeWidth={2.5} />
                </div>
              </div>
              
              {/* Text */}
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-foreground group-hover:text-accent transition-colors">
                  Create New Profile
                </h3>
                <p className="text-sm text-muted-foreground">
                  Set up a new profile with custom company details
                </p>
              </div>
              
              {/* Hover Indicator */}
              <div className="flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                  Get started →
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
