// frontend/src/pages/admin/AdminUsers.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/admin/users');
      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setMessage('Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      const response = await axios.put(`http://localhost:5001/api/admin/users/${userId}/role`, {
        role: newRole
      });
      
      if (response.data.success) {
        setMessage('User role updated successfully');
        // Update local state
        setUsers(users.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        ));
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      setMessage('Error updating user role');
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const response = await axios.put(`http://localhost:5001/api/admin/users/${userId}/status`, {
        is_active: !currentStatus
      });
      
      if (response.data.success) {
        setMessage(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        // Update local state
        setUsers(users.map(user => 
          user.id === userId ? { ...user, is_active: !currentStatus } : user
        ));
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      setMessage('Error updating user status');
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-table-header">
        <h1>User Management</h1>
        <button onClick={fetchUsers} className="btn btn-primary">
          Refresh
        </button>
      </div>

      {message && (
        <div style={{
          padding: '15px',
          marginBottom: '20px',
          background: message.includes('Error') ? '#f8d7da' : '#d4edda',
          color: message.includes('Error') ? '#721c24' : '#155724',
          borderRadius: '5px'
        }}>
          {message}
        </div>
      )}

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>User Type</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>#{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.user_type}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={(e) => updateUserRole(user.id, e.target.value)}
                    style={{
                      padding: '5px',
                      borderRadius: '3px',
                      border: '1px solid #ddd'
                    }}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>
                  <span className={`status-badge ${user.is_active ? 'status-active' : 'status-inactive'}`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>{new Date(user.created_at).toLocaleDateString()}</td>
                <td>
                  <button
                    onClick={() => toggleUserStatus(user.id, user.is_active)}
                    className={`btn btn-sm ${user.is_active ? 'btn-warning' : 'btn-success'}`}
                  >
                    {user.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;