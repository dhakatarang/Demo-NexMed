// Home.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom'; 
import Card from '../components/Card'; 
import SearchBar from '../components/SearchBar'; 
import demo1 from '../assets/demo1.jpg';
import demo2 from '../assets/demo2.jpg';
import demo3 from '../assets/demo3.jpg';
import demo4 from '../assets/demo4.jpg';
import Homebg from '../assets/Homebg.jpg';
import './Home.css';

function Home() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}'); 
    
    return ( 
        <div className="dashboard-container">
            <div className="welcome-section">
                <h1>Welcome back, {user.name || 'User'}!</h1> 
                <p>What would you like to do today?</p> 
            </div> 
            
            <SearchBar />
            
            <div className="cards-container"> 
                <Card 
                    title="Medicines" 
                    description="Browse and manage medicines" 
                    link="/medicines" 
                    image={demo1}
                /> 
                <Card 
                    title="Medical Equipment" 
                    description="Browse medical equipment" 
                    link="/medicalequipments" 
                    image={demo2}
                /> 
                <Card 
                    title="Donate/Rent" 
                    description="Donate or rent medical items" 
                    link="/donaterent" 
                    image={demo3}
                /> 
                <Card 
                    title="My Profile" 
                    description="Manage your account" 
                    link="/profile" 
                    image={demo4}
                /> 
            </div> 
        </div> 
    );
}

export default Home;