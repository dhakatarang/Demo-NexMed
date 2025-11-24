// frontend/src/pages/Profile.jsx
import React, { useEffect, useState, useRef } from "react";
import "./Profile.css";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5001/api";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("medicines");
  const navigate = useNavigate();

  // edit form state
  const [form, setForm] = useState({
    name: "",
    email: "",
    user_type: "",
    phone: "",
    address: "",
    date_of_birth: "",
    medical_license_path: ""
  });
  const [photoFile, setPhotoFile] = useState(null);
  const photoPreviewRef = useRef(null);

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getToken = () => localStorage.getItem("token");

  const fetchProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const token = getToken();
      if (!token) {
        setError("Not authenticated. Please log in.");
        setLoading(false);
        navigate("/login");
        return;
      }

      const res = await fetch(`${API_BASE}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }

      const data = await res.json();
      if (!data.success || !data.profile) {
        throw new Error("Invalid response from server");
      }

      const profile = data.profile;
      setUser(profile);

      // set form defaults
      setForm({
        name: profile.name || "",
        email: profile.email || "",
        user_type: profile.user_type || "",
        phone: profile.phone || "",
        address: profile.address || "",
        date_of_birth: profile.date_of_birth || "",
        medical_license_path: profile.medical_license_path || ""
      });

      // contributions (backend may return both lists)
      setMedicines(data.contributions?.medicines || []);
      setEquipments(data.contributions?.equipments || []);
    } catch (err) {
      console.error("Profile fetch error:", err);
      setError("Failed to load profile: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const openEdit = () => setEditing(true);
  const closeEdit = () => {
    setEditing(false);
    setPhotoFile(null);
    if (photoPreviewRef.current) photoPreviewRef.current.src = "";
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      const file = files[0];
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        if (photoPreviewRef.current) photoPreviewRef.current.src = reader.result;
      };
      reader.readAsDataURL(file);
      return;
    }
    setForm((p) => ({ ...p, [name]: value }));
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const token = getToken();
      if (!token) throw new Error("Not authenticated");

      const payload = new FormData();
      payload.append("name", form.name);
      payload.append("email", form.email);
      payload.append("user_type", form.user_type);
      payload.append("phone", form.phone || "");
      payload.append("address", form.address || "");
      // DOB optional
      if (form.date_of_birth) payload.append("date_of_birth", form.date_of_birth);
      // profile photo optional
      if (photoFile) payload.append("profile_photo", photoFile);

      const res = await fetch(`${API_BASE}/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: payload
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(`HTTP ${res.status}: ${t}`);
      }

      const data = await res.json();
      if (!data.success || !data.profile) {
        throw new Error("Update failed");
      }

      setUser(data.profile);
      closeEdit();
    } catch (err) {
      console.error("Profile update error:", err);
      setError("Update failed: " + (err.message || "Unknown error"));
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Your Profile</h1>
        <div className="header-actions">
          <button className="btn btn-outline" onClick={() => navigate("/home")}>Back</button>
          <button className="btn btn-primary" onClick={openEdit}>Edit Profile</button>
        </div>
      </div>

      {error && <div className="message message-error"><p>{error}</p></div>}

      {user && (
        <div className="profile-main">
          <div className="profile-left">
            <div className="profile-card">
              <div className="profile-avatar-large">
                {user.profile_photo ? (
                  <img src={`http://localhost:5001${user.profile_photo}`} alt="profile" />
                ) : (
                  <div className="avatar-initial">{user.name?.charAt(0)?.toUpperCase() || "U"}</div>
                )}
              </div>

              <h2>{user.name}</h2>
              <p className="profile-email">{user.email}</p>

              <div className="profile-info">
                <div><strong>User Type:</strong> <span>{user.user_type || "—"}</span></div>
                <div><strong>License:</strong> <span>{user.medical_license_path ? "Uploaded" : "—"}</span></div>
                <div><strong>Phone:</strong> <span>{user.phone || "—"}</span></div>
                <div><strong>DOB:</strong> <span>{user.date_of_birth || "—"}</span></div>
                <div><strong>Member ID:</strong> <span>{user.id}</span></div>
              </div>
            </div>
          </div>

          <div className="profile-right">
            <div className="contrib-header">
              <h3>Your Contributions</h3>
              <div className="tabs">
                <button className={tab === "medicines" ? "active" : ""} onClick={() => setTab("medicines")}>Medicines</button>
                <button className={tab === "equipments" ? "active" : ""} onClick={() => setTab("equipments")}>Equipments</button>
              </div>
            </div>

            <div className="contrib-list">
              {tab === "medicines" && (
                <div>
                  {medicines.length === 0 && <p>No medicines added yet.</p>}
                  {medicines.map((m) => (
                    <div key={m.id} className="contrib-item">
                      <div className="contrib-left">
                        {m.image_path ? <img src={`http://localhost:5001/uploads/items/${m.image_path}`} alt={m.name} /> : <div className="small-avatar">{m.name?.charAt(0)}</div>}
                      </div>
                      <div className="contrib-body">
                        <strong>{m.name}</strong>
                        <div className="muted">{m.option_type} • qty: {m.quantity} • status: {m.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tab === "equipments" && (
                <div>
                  {equipments.length === 0 && <p>No equipment added yet.</p>}
                  {equipments.map((e) => (
                    <div key={e.id} className="contrib-item">
                      <div className="contrib-left">
                        {e.image_path ? <img src={`http://localhost:5001/uploads/items/${e.image_path}`} alt={e.name} /> : <div className="small-avatar">{e.name?.charAt(0)}</div>}
                      </div>
                      <div className="contrib-body">
                        <strong>{e.name}</strong>
                        <div className="muted">{e.option_type} • qty: {e.quantity} • status: {e.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="edit-modal">
          <div className="edit-panel">
            <div className="edit-header">
              <h3>Edit Profile</h3>
              <button className="close-btn" onClick={closeEdit}>✕</button>
            </div>

            <form onSubmit={submitEdit} className="edit-form">
              <div className="row">
                <label>Name</label>
                <input name="name" value={form.name} onChange={handleChange} required />
              </div>

              <div className="row">
                <label>Email</label>
                <input name="email" value={form.email} onChange={handleChange} type="email" required />
              </div>

              <div className="row">
                <label>User Type</label>
                <input name="user_type" value={form.user_type} onChange={handleChange} />
              </div>

              <div className="row">
                <label>Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} />
              </div>

              <div className="row">
                <label>Address</label>
                <input name="address" value={form.address} onChange={handleChange} />
              </div>

              <div className="row">
                <label>Date of Birth (optional)</label>
                <input name="date_of_birth" value={form.date_of_birth} onChange={handleChange} type="date" />
              </div>

              <div className="row">
                <label>Profile Photo (optional)</label>
                <input type="file" accept="image/*" name="profile_photo" onChange={handleChange} />
                <div className="photo-preview">
                  <img ref={photoPreviewRef} alt="preview" />
                </div>
              </div>

              <div className="edit-actions">
                <button type="button" className="btn btn-outline" onClick={closeEdit}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
