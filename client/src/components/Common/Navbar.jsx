import { FaUserCircle } from "react-icons/fa";

function Navbar() {

    const user = JSON.parse(localStorage.getItem("user"));

    return (

        <nav className="navbar navbar-light bg-white shadow-sm px-4">

            <h4 className="mb-0">
                Equipment Rental Portal
            </h4>

            <div className="d-flex align-items-center">

                <FaUserCircle
                    size={28}
                    className="me-2"
                />

                <span>

                    {user?.name}

                </span>

            </div>

        </nav>

    );

}

export default Navbar;