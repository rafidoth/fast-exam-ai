import { useNavigate } from "react-router";
import { useSession } from "../context/SessionContext";
import Auth from "../app/Auth";
import App from "../App";

function AuthWrapper({ children }) {
  const { loading, isAuthenticated } = useSession();
  
  if (loading) return <div>Checking Auth ....</div>;
  
  if (!loading && !isAuthenticated) {
    return (
        <Auth />
    );
  }
  
  return children;
}

export default AuthWrapper;
