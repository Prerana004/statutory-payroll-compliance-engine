import { FaHome, FaChartBar, FaUser, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./MobileNav.css";

function MobileNav() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  {role === "superadmin" && (
  <button>
    <FaUser />
    <span>Audit</span>
  </button>
 )}


  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="mobile-nav">
      <button onClick={() => navigate("/app")}>
        <FaHome />
        <span>Home</span>
      </button>

      <button onClick={() => navigate("/app")}>
        <FaChartBar />
        <span>Stats</span>
      </button>

      <button>
        <FaUser />
        <span>Profile</span>
      </button>

      <button onClick={logout}>
        <FaSignOutAlt />
        <span>Logout</span>
      </button>
    </div>
  );
}

export default MobileNav;
