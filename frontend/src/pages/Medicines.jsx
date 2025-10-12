// frontend/src/pages/Medicines.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Medicines() {
    const [medicines, setMedicines] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/medicines')
            .then(res => setMedicines(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <h2>Medicines</h2>
            {medicines.map((m) => (
                <div key={m.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
                    <h4>{m.name}</h4>
                    <p>{m.description}</p>
                    <p>Quantity: {m.quantity}</p>
                </div>
            ))}
        </div>
    );
}

export default Medicines;
