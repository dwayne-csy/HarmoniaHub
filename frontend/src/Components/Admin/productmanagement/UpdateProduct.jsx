import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UpdateProfile = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [user, setUser] = useState({
    name: "",
    email: "",
    contact: "",
    city: "",
    barangay: "",
    street: "",
    zipcode: "",
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Validation errors state
  const [errors, setErrors] = useState({
    contact: "",
    city: "",
    barangay: "",
    street: "",
    zipcode: "",
    avatar: ""
  });

  // Password change toggle and data
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Fetch current user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get("http://localhost:4001/api/v1/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser({
          name: data.user.name,
          email: data.user.email,
          contact: data.user.contact || "",
          city: data.user.address?.city || "",
          barangay: data.user.address?.barangay || "",
          street: data.user.address?.street || "",
          zipcode: data.user.address?.zipcode || "",
        });

        setAvatarPreview(data.user.avatar?.url || "");
      } catch (error) {
        setMessage("Failed to load profile");
        console.error(error);
      }
    };
    fetchProfile();
  }, [token]);

  // Validation functions
  const validateContact = (contact) => {
    if (!contact.trim()) return "Contact number is required";
    if (!/^\d+$/.test(contact)) return "Contact must contain only numbers";
    if (contact.length < 11 || contact.length > 12) return "Contact must be 11 to 12 digits";
    return "";
  };

  const validateCity = (city) => {
    if (!city.trim()) return "City is required";
    if (!/^[A-Z]/.test(city)) return "First letter must be capitalized";
    return "";
  };

  const validateBarangay = (barangay) => {
    if (!barangay.trim()) return "Barangay is required";
    if (!/^[A-Z]/.test(barangay)) return "First letter must be capitalized";
    return "";
  };

  const validateStreet = (street) => {
    if (!street.trim()) return "Street is required";
    if (!/^[A-Z]/.test(street)) return "First letter must be capitalized";
    return "";
  };

  const validateZipcode = (zipcode) => {
    if (!zipcode.trim()) return "Zipcode is required";
    if (!/^\d+$/.test(zipcode)) return "Zipcode must contain only numbers";
    if (zipcode.length !== 4) return "Zipcode must be exactly 4 digits";
    return "";
  };

  const validateAvatar = (avatarFile, currentAvatar) => {
    if (!avatarFile && !currentAvatar) return "Profile image is required";
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
    
    // Validate field in real-time
    let error = "";
    switch (name) {
      case 'contact':
        error = validateContact(value);
        break;
      case 'city':
        error = validateCity(value);
        break;
      case 'barangay':
        error = validateBarangay(value);
        break;
      case 'street':
        error = validateStreet(value);
        break;
      case 'zipcode':
        error = validateZipcode(value);
        break;
      default:
        break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handlePasswordChange = (e) =>
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    // Clear previous file and validation
    setAvatarFile(null);
    setErrors(prev => ({ ...prev, avatar: "" }));

    if (!file) {
      const avatarError = validateAvatar(null, avatarPreview);
      setErrors(prev => ({ ...prev, avatar: avatarError }));
      return;
    }

    if (!file.type.startsWith("image/")) {
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

    // Clear avatar error when file is selected
    setErrors(prev => ({ ...prev, avatar: "" }));
  };

  const validateAllFields = () => {
    const newErrors = {
      contact: validateContact(user.contact),
      city: validateCity(user.city),
      barangay: validateBarangay(user.barangay),
      street: validateStreet(user.street),
      zipcode: validateZipcode(user.zipcode),
      avatar: validateAvatar(avatarFile, avatarPreview)
    };

    setErrors(newErrors);
    return Object.values(newErrors).every(error => error === "");
  };

  // Submit profile update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!validateAllFields()) {
      setMessage("Please fix all validation errors before submitting.");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      Object.entries(user).forEach(([key, value]) => formData.append(key, value));
      if (avatarFile) formData.append("avatar", avatarFile);

      const { data } = await axios.put(
        "http://localhost:4001/api/v1/me/update",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage("Profile updated successfully!");
      setTimeout(() => navigate("/profile"), 1200);
    } catch (error) {
      console.error("Update error:", error);
      setMessage(error.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  // Change password handler
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      await axios.put(
        "http://localhost:4001/api/v1/password/update",
        passwordData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage("Password changed successfully!");
      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswordForm(false);
    } catch (error) {
      setMessage(error.response?.data?.message || "Password update failed");
    } finally {
      setLoading(false);
    }
  };

  const hasErrors = Object.values(errors).some(error => error !== "");

  return (
    <div className="form-container">
      <h2>Update Profile</h2>

      {avatarPreview && (
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <img
            src={avatarPreview}
            alt="Avatar Preview"
            style={{
              width: "150px",
              height: "150px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid #ddd",
            }}
          />
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={user.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          value={user.email}
          readOnly
          style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
        />
        
        <input
          type="text"
          name="contact"
          placeholder="Contact Number (11-12 digits)"
          value={user.contact}
          onChange={handleChange}
          maxLength="12"
        />
        {errors.contact && <div style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>{errors.contact}</div>}
        
        <input
          type="text"
          name="city"
          placeholder="City"
          value={user.city}
          onChange={handleChange}
        />
        {errors.city && <div style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>{errors.city}</div>}
        
        <input
          type="text"
          name="barangay"
          placeholder="Barangay"
          value={user.barangay}
          onChange={handleChange}
        />
        {errors.barangay && <div style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>{errors.barangay}</div>}
        
        <input
          type="text"
          name="street"
          placeholder="Street"
          value={user.street}
          onChange={handleChange}
        />
        {errors.street && <div style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>{errors.street}</div>}
        
        <input
          type="text"
          name="zipcode"
          placeholder="Zipcode (4 digits)"
          value={user.zipcode}
          onChange={handleChange}
          maxLength="4"
        />
        {errors.zipcode && <div style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>{errors.zipcode}</div>}

        <div style={{ margin: "10px 0" }}>
          <label htmlFor="avatar-upload" style={{ display: "block", marginBottom: "5px" }}>
            Profile Picture: *
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ width: "100%" }}
          />
          {errors.avatar && <div style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>{errors.avatar}</div>}
          <small style={{ color: "#666" }}>Supported: JPG, PNG, GIF (Max 2MB)</small>
        </div>

        <button type="submit" disabled={loading || hasErrors}>
          {loading ? "Updating..." : "Update Profile"}
        </button>
      </form>

      <hr style={{ margin: "30px 0" }} />

      <div style={{ textAlign: "center" }}>
        {!showPasswordForm ? (
          <button onClick={() => setShowPasswordForm(true)} className="btn-secondary">
            Change Password
          </button>
        ) : (
          <>
            <h3>Change Password</h3>
            <form onSubmit={handlePasswordSubmit}>
              <input
                type="password"
                name="oldPassword"
                placeholder="Current Password"
                value={passwordData.oldPassword}
                onChange={handlePasswordChange}
                required
              />
              <input
                type="password"
                name="newPassword"
                placeholder="New Password"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
              />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm New Password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
              />
              <button type="submit" disabled={loading}>
                {loading ? "Changing..." : "Save Password"}
              </button>
              <button
                type="button"
                onClick={() => setShowPasswordForm(false)}
                style={{ marginLeft: "10px" }}
              >
                Cancel
              </button>
            </form>
          </>
        )}
      </div>

      {message && (
        <p
          style={{
            color: message.includes("successfully") ? "green" : "red",
            textAlign: "center",
            marginTop: "20px",
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default UpdateProfile;