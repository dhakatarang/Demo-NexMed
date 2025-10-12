import React from 'react';
import { useNavigate } from 'react-router-dom'; 
import Card from '../components/Card'; 
import SearchBar from '../components/SearchBar'; 

function Home() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}'); 
    return ( <div style={{ padding: '20px', minHeight: '80vh' }}> 
    <div style={{ background: '#e8f4fd', padding: '20px', borderRadius: '10px', marginBottom: '30px' }}> <h1>Welcome back, {user.name || 'User'}! 👋</h1> 
    <p>What would you like to do today?</p> 
    </div> <SearchBar />
     <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', marginTop: '30px', gap: '20px' }}> 
      <Card title="Medicines 💊" description="Browse and manage medicines" link="/medicines" /> 
      <Card title="Medical Equipment 🏥" description="Browse medical equipment" link="/medicalequipments" /> 
      <Card title="Donate/Rent 🤝" description="Donate or rent medical items" link="/donaterent" /> 
      <Card title="My Profile 👤" description="Manage your account" link="/profile" /> </div> </div> ); }
      
       export default Home;