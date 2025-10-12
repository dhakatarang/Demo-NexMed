// frontend/src/components/Card.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

function Card({ title, description, link }) {
    const navigate = useNavigate();
    return (
        <div onClick={() => navigate(link)} style={{ border: '1px solid #ddd', padding: '20px', margin: '10px', cursor: 'pointer', borderRadius: '10px', boxShadow: '0 0 5px #ccc' }}>
            <h3>{title}</h3>
            <p>{description}</p>
        </div>
    );
}

export default Card;
