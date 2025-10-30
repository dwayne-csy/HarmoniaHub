import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UpdateProfile = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [user, setUser] = useState({ name: "", email: "" });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get("http://localhost:4001/api/v1/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser({ name: data.user.name, email: data.user.email });
        setAvatarPreview(data.user.avatar?.url || '');
      } catch (error) {
        setMessage("Failed to load profile");
      }
    };
    fetchProfile();
  }, [token]);

  const handleChange = (e) => setUser({ ...user, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setAvatarFile(null);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setMessage("Please select an image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage("Image size should be less than 2MB");
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.readyState === 2) setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append('name', user.name);
      formData.append('email', user.email);
      if (avatarFile) formData.append('avatar', avatarFile);

      const { data } = await axios.put(
        "http://localhost:4001/api/v1/me/update",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
            // Do NOT set Content-Type; let axios set multipart boundary
          }
        }
      );

      setMessage("Profile updated successfully!");
      setTimeout(() => navigate("/profile"), 1200);
    } catch (error) {
      console.error('Update error:', error);
      setMessage(error.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Update Profile</h2>

      {avatarPreview && (
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <img
            src={avatarPreview}
            alt="Avatar Preview"
            style={{
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid #ddd'
            }}
          />
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Name" value={user.name} onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" value={user.email} onChange={handleChange} required />

        <div style={{ margin: '10px 0' }}>
          <label htmlFor="avatar-upload" style={{ display: 'block', marginBottom: '5px' }}>
            Profile Picture:
          </label>
          <input id="avatar-upload" type="file" accept="image/*" onChange={handleFileChange} style={{ width: '100%' }} />
          <small style={{ color: '#666' }}>Supported formats: JPG, PNG, GIF. Max size: 2MB</small>
          <br />
          <small style={{ color: '#999' }}>Leave empty to keep current profile picture</small>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update Profile"}
        </button>
      </form>

      {message && <p className={message.includes("successfully") ? "success" : "error"}>{message}</p>}
    </div>
  );
};

export default UpdateProfile;
