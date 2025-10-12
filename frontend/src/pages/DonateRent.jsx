// frontend/src/pages/DonateRent.jsx
import React, { useState } from 'react';
import axios from 'axios';

function DonateRent() {
    const [itemType, setItemType] = useState('medicine');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [quantity, setQuantity] = useState('');

    const handleAddItem = () => {
        const endpoint = itemType === 'medicine' ? 'medicines' : 'equipments';
        axios.post(`http://localhost:5000/${endpoint}`, { name, description, quantity })
            .then(res => alert('Item added successfully'))
            .catch(err => console.error(err));
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Donate/Rent Item</h2>
            <select value={itemType} onChange={(e) => setItemType(e.target.value)}>
                <option value="medicine">Medicine</option>
                <option value="equipment">Medical Equipment</option>
            </select><br/>
            <input type="text" placeholder="Name" value={name} onChange={(e)=>setName(e.target.value)} /><br/>
            <input type="text" placeholder="Description" value={description} onChange={(e)=>setDescription(e.target.value)} /><br/>
            <input type="number" placeholder="Quantity" value={quantity} onChange={(e)=>setQuantity(e.target.value)} /><br/>
            <button onClick={handleAddItem}>Add Item</button>
        </div>
    );
}

export default DonateRent;
