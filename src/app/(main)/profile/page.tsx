"use client";

import ProfileView from "@/components/profile/profile-view";

export default function ProfilePage() {
  return (
    <div className="flex justify-center items-center h-full">
      <div className="w-full max-w-lg">
        <ProfileView />
      </div>
    </div>
  );
}
