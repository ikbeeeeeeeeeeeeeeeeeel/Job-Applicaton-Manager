// src/components/Navbar.jsx (example)

import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-gray-100 p-4 shadow">
      <ul className="flex space-x-6">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/job-offers">Job Offers</Link></li>
        <li><Link to="/my-applications" className="text-blue-500">My Applications</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
