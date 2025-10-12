// frontend/src/pages/MedicalEquipments.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function MedicalEquipments() {
    const [equipments, setEquipments] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/equipments')
            .then(res => setEquipments(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <h2>Medical Equipments</h2>
            {equipments.map((e) => (
                <div key={e.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
                    <h4>{e.name}</h4>
                    <p>{e.description}</p>
                    <p>Quantity: {e.quantity}</p>
                    <p>Status: {e.condition || 'Good'}</p>
                </div>
            ))}
        </div>
    );
}

export default MedicalEquipments;
