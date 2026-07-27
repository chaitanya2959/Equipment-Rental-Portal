import {
  FaHome,
  FaBoxOpen,
  FaPlusCircle,
  FaClipboardList,
  FaTruck,
  FaHistory,
  FaMoneyBillWave,
  FaStar,
  FaBell,
  FaUser,
  FaCog,
  FaSignOutAlt
} from "react-icons/fa";

import { Link, useLocation, useNavigate } from "react-router-dom";

function Sidebar() {

    const navigate = useNavigate();
    const location = useLocation();

    const user = JSON.parse(localStorage.getItem("user"));

    const logout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");

    };

    const ownerMenu = [

        {
            title: "Dashboard",
            icon: <FaHome />,
            path: "/owner/dashboard"
        },

        {
            title: "My Equipment",
            icon: <FaBoxOpen />,
            path: "/owner/equipment"
        },

        {
            title: "Add Equipment",
            icon: <FaPlusCircle />,
            path: "/owner/add-equipment"
        },

        {
            title: "Booking Requests",
            icon: <FaClipboardList />,
            path: "/owner/bookings"
        },

        {
            title: "Current Rentals",
            icon: <FaTruck />,
            path: "/owner/current-rentals"
        },

        {
            title: "Rental History",
            icon: <FaHistory />,
            path: "/owner/rental-history"
        },

        {
            title: "Earnings",
            icon: <FaMoneyBillWave />,
            path: "/owner/earnings"
        },

        {
            title: "Reviews",
            icon: <FaStar />,
            path: "/owner/reviews"
        },

        {
            title: "Notifications",
            icon: <FaBell />,
            path: "/owner/notifications"
        },

        {
            title: "Profile",
            icon: <FaUser />,
            path: "/owner/profile"
        },

        {
            title: "Settings",
            icon: <FaCog />,
            path: "/owner/settings"
        }

    ];

    return (

        <div
            style={{
                width: "270px",
                minHeight: "100vh",
                background: "#1E293B",
                color: "#fff"
            }}
        >

            <div
                className="text-center py-4 border-bottom"
            >

                <h3>

                    RentHub

                </h3>

            </div>

            <div className="p-3">

                {

                    user?.role === "owner" &&

                    ownerMenu.map((menu) => (

                        <Link

                            key={menu.path}

                            to={menu.path}

                            className={`d-flex align-items-center text-decoration-none mb-2 px-3 py-3 rounded ${
                                location.pathname === menu.path
                                    ? "bg-primary text-white"
                                    : "text-light"
                            }`}

                        >

                            <span className="me-3">

                                {menu.icon}

                            </span>

                            {menu.title}

                        </Link>

                    ))

                }

            </div>

            <div
                className="p-3 mt-auto"
            >

                <button

                    className="btn btn-danger w-100"

                    onClick={logout}

                >

                    <FaSignOutAlt className="me-2"/>

                    Logout

                </button>

            </div>

        </div>

    );

}

export default Sidebar;
