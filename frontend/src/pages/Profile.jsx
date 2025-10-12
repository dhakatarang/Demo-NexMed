import React, { useState, useEffect } from "react";


import { Button } from "../components/button";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfile();
        const userData = res.data; // Access response data
        setUser(userData);
        setFormData({
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          address: userData.address || ""
        });
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    fetchProfile();
  }, []);

  const handleEdit = () => setEditing(true);
  const handleCancel = () => {
    setEditing(false);
    // Reset form data to original user data
    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || ""
    });
  };

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const res = await updateProfile(formData);
      setUser(res.data); // Access response data
      setEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  if (!user) return <div className="text-center mt-10 text-gray-600">Loading...</div>;

  return (
    <div className="p-6 flex flex-col items-center">
      <Card className="w-full max-w-2xl shadow-lg rounded-2xl">
        <CardContent className="p-6">
          <h2 className="text-2xl font-semibold text-center text-blue-700 mb-4">My Profile</h2>
          
          <div className="flex flex-col gap-4">
            <div>
              <label className="block font-medium">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                disabled={!editing}
                onChange={handleChange}
                className={`w-full p-2 rounded-lg border ${editing ? "border-blue-400" : "border-gray-300"} focus:outline-none`}
              />
            </div>
            <div>
              <label className="block font-medium">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="w-full p-2 rounded-lg border border-gray-300 bg-gray-100"
              />
            </div>
            <div>
              <label className="block font-medium">Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                disabled={!editing}
                onChange={handleChange}
                className={`w-full p-2 rounded-lg border ${editing ? "border-blue-400" : "border-gray-300"} focus:outline-none`}
              />
            </div>
            <div>
              <label className="block font-medium">Address</label>
              <textarea
                name="address"
                value={formData.address}
                disabled={!editing}
                onChange={handleChange}
                className={`w-full p-2 rounded-lg border ${editing ? "border-blue-400" : "border-gray-300"} focus:outline-none`}
                rows="3"
              />
            </div>
          </div>

          <div className="flex justify-center gap-3 mt-6">
            {!editing ? (
              <Button onClick={handleEdit}>Edit Profile</Button>
            ) : (
              <>
                <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">Save Changes</Button>
                <Button onClick={handleCancel} className="bg-gray-400 hover:bg-gray-500">Cancel</Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="mt-10 w-full max-w-2xl">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">My Donations</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {user.donations && user.donations.length > 0 ? (
            user.donations.map((item, i) => (
              <Card key={i} className="p-4 shadow rounded-xl bg-gray-50">
                <h4 className="font-semibold text-blue-700">{item.type}</h4>
                <p className="text-sm text-gray-700">{item.name}</p>
                <p className="text-xs text-gray-500">Expiry: {item.expiryDate}</p>
              </Card>
            ))
          ) : (
            <p className="text-gray-500 text-center col-span-2">No donations yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;