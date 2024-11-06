import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";


const ProtectRoute = () => {
    const { isAuthenticated } = useAuth();
    console.log(`protected`,isAuthenticated);
    if (isAuthenticated) {
      alert("You need to be logged in to access this page");
      return <Navigate to="/" />;
    }

  };
  

export default ProtectRoute;
