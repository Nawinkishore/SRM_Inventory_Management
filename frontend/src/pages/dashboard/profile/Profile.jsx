import { useUser } from "@clerk/clerk-react";

const Profile = () => {
  const { user } = useUser();

  return (
    <div>
      <p>Name: {user?.fullName}</p>
      <p>Email: {user?.primaryEmailAddress?.emailAddress}</p>
    </div>
  );
};
export default Profile;
