// import React from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import './Navbar.css';

// const Navbar = () => {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     logout();
//     navigate('/');
//   };

//   return (
//     <nav className="navbar">
//       <div className="navbar-container">
//         <Link to="/" className="navbar-brand">
//           Fashion Store
//         </Link>
//         <div className="navbar-links">
//           <Link to="/" className="nav-link">Home</Link>
//           <Link to="/products" className="nav-link">Products</Link>
//           {user ? (
//             <>
//               <Link to="/dashboard" className="nav-link">Dashboard</Link>
//               {user.role === 'admin' && (
//                 <Link to="/admin" className="nav-link">Admin</Link>
//               )}
//               <span className="nav-user">Hello, {user.name}</span>
//               <button onClick={handleLogout} className="nav-button">
//                 Logout
//               </button>
//             </>
//           ) : (
//             <>
//               <Link to="/login" className="nav-link">Login</Link>
//               <Link to="/register" className="nav-link">Register</Link>
//             </>
//           )}
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;