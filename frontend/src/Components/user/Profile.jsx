import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return navigate("/login");

    const fetchProfile = async () => {
      try {
        const { data } = await axios.get("http://localhost:4001/api/v1/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(data.user);
      } catch (error) {
        navigate("/login");
      }
    };
    fetchProfile();
  }, [navigate, token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="profile-container">
      {user ? (
        <>
          <img src={user.avatar.url} alt={user.name} className="avatar" />
          <h2>{user.name}</h2>
          <p>{user.email}</p>
          <Link to="/update-profile">Update Profile</Link>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <p>Loading profile...</p>
      )}
    </div>
  );
};

export default Profile;
