import { Button } from "./ui/button";
import { Link } from "react-router-dom";

const MainNav = () => {
  
  return (
    <span className="flex space-x-2 items-center">
        <>
            <Link to="/upload" 
            className="font-bold"
            onMouseOver={(e) => e.currentTarget.style.color = '#FFBD58'}
            onMouseOut={(e) => e.currentTarget.style.color = '#0A0A0A'}
            >
               Upload
            </Link>
            <Link to="/watch" 
            className="font-bold"
            onMouseOver={(e) => e.currentTarget.style.color = '#FFBD58'}
            onMouseOut={(e) => e.currentTarget.style.color = '#0A0A0A'}
            >
               Watch
            </Link>
        </>
    </span>
  );
};

export default MainNav;