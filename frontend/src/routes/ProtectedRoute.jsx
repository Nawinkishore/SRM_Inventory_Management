import { Navigate } from "react-router-dom";


const ProtectedRoute = ({ children }) => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return <p>Checking authentication...</p>;

  return isSignedIn ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
