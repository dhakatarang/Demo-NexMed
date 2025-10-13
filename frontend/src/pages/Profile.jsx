import React, { useState, useEffect } from "react"
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/button";
import './Profile.css';


import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [donations, setDonations] = useState([]);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Fetch user profile
      const profileResponse = await getProfile();
      const userData = profileResponse.data;
      setUser(userData);
      
      // Set form data with user data
      setFormData({
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        address: userData.address || ""
      });

      // Fetch all donations and filter for current user
      const donationsResponse = await getDonations();
      const allItems = donationsResponse.data.items || [];
      
      // Get current user ID to filter items
      const userId = localStorage.getItem('userId');
      const userDonations = allItems.filter(item => 
        item.user_id?.toString() === userId
      );
      setDonations(userDonations);

    } catch (err) {
      console.error("Error fetching profile data:", err);
      if (err.response?.status === 401) {
        setError("Please log in to view your profile");
        navigate('/login');
      } else {
        setError("Failed to load profile data. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => setEditing(true);
  
  const handleCancel = () => {
    setEditing(false);
    // Reset form data to original user data
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || ""
      });
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData, 
      [e.target.name]: e.target.value 
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      
      const response = await updateProfile(formData);
      const updatedUser = response.data;
      setUser(updatedUser);
      setEditing(false);
      
      // Refresh donations data
      await fetchUserData();
      
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString();
  };

  const getItemTypeDisplay = (itemType, optionType) => {
    const typeMap = {
      medicine: 'Medicine',
      medicalequipment: 'Medical Equipment'
    };
    
    const optionMap = {
      donate: 'Donated',
      sell: 'For Sale',
      rent: 'For Rent'
    };

    return `${typeMap[itemType] || itemType} - ${optionMap[optionType] || optionType}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Profile Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
        <p className="text-gray-600 mt-2">Manage your personal information and view your contributions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Information Card */}
        <Card className="shadow-lg rounded-xl">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-blue-700 mb-6 border-b pb-2">
              Personal Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  disabled={!editing}
                  onChange={handleChange}
                  className={`w-full p-3 rounded-lg border ${
                    editing 
                      ? "border-blue-400 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                      : "border-gray-300 bg-gray-50"
                  } transition-colors duration-200`}
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full p-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-600"
                  placeholder="Email address"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  disabled={!editing}
                  onChange={handleChange}
                  className={`w-full p-3 rounded-lg border ${
                    editing 
                      ? "border-blue-400 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                      : "border-gray-300 bg-gray-50"
                  } transition-colors duration-200`}
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  disabled={!editing}
                  onChange={handleChange}
                  className={`w-full p-3 rounded-lg border ${
                    editing 
                      ? "border-blue-400 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                      : "border-gray-300 bg-gray-50"
                  } transition-colors duration-200 resize-none`}
                  rows="3"
                  placeholder="Enter your complete address"
                />
              </div>
            </div>

            <div className="flex justify-center gap-3 mt-6 pt-4 border-t">
              {!editing ? (
                <Button 
                  onClick={handleEdit}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                >
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button 
                    onClick={handleCancel}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2"
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* My Contributions Card */}
        <Card className="shadow-lg rounded-xl">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-blue-700 mb-6 border-b pb-2">
              My Contributions
            </h2>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {donations.length > 0 ? (
                donations.map((item, index) => (
                  <div 
                    key={item.id || index}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors duration-200"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-800 text-lg">
                        {item.name}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.optionType === 'donate' 
                          ? 'bg-green-100 text-green-800'
                          : item.optionType === 'sell'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {getItemTypeDisplay(item.itemType, item.optionType)}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                      {item.description}
                    </p>
                    
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Qty: {item.quantity}</span>
                      <span>Added: {formatDate(item.created_at)}</span>
                    </div>
                    
                    {item.price && item.optionType !== 'donate' && (
                      <div className="mt-2 text-sm font-semibold text-gray-700">
                        Price: ${parseFloat(item.price).toFixed(2)}
                      </div>
                    )}
                    
                    {item.rentPrice && (
                      <div className="mt-1 text-sm font-semibold text-blue-600">
                        Rent: ${parseFloat(item.rentPrice).toFixed(2)}/day
                      </div>
                    )}
                    
                    <div className={`mt-2 text-xs px-2 py-1 rounded-full inline-block ${
                      item.quantity > 0 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      Status: {item.quantity > 0 ? 'Available' : 'Out of Stock'}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-6xl mb-4">📦</div>
                  <p className="text-gray-500 text-lg mb-2">No contributions yet</p>
                  <p className="text-gray-400 text-sm">
                    Start by donating or listing medicines and medical equipment
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">
                Total Items: {donations.length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      {donations.length > 0 && (
        <Card className="mt-8 shadow-lg rounded-xl">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Contribution Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{donations.length}</div>
                <div className="text-sm text-gray-600">Total Items</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {donations.filter(item => item.optionType === 'donate').length}
                </div>
                <div className="text-sm text-gray-600">Donated</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {donations.filter(item => item.optionType === 'sell').length}
                </div>
                <div className="text-sm text-gray-600">For Sale</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {donations.filter(item => item.optionType === 'rent').length}
                </div>
                <div className="text-sm text-gray-600">For Rent</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Profile;