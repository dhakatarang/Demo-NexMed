// backend/controllers/donaterentController.js - Updated create function
const create = (req, res) => {
  try {
    console.log('📦 Received donation request from user:', req.user);

    const {
      itemType,
      optionType,
      name,
      description,
      quantity,
      price,
      rentPrice,
      duration
    } = req.body;

    // Use authenticated user's ID
    const effectiveUserId = req.user.id;

    // Handle file upload
    let imagePath = '';
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
      console.log('📁 File uploaded:', imagePath);
    }

    // Validate required fields
    if (!name || !description || !quantity) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ 
        error: 'Name, description, and quantity are required',
        received: { name, description, quantity }
      });
    }

    // Rest of the create function remains the same, but uses effectiveUserId
    // ... (same as before but using effectiveUserId instead of userId from body)
    
    if (itemType === 'medicine') {
      const medicineData = {
        name,
        description,
        quantity: parseInt(quantity),
        price: optionType === 'sell' ? parseFloat(price || 0) : 0,
        is_donated: optionType === 'donate',
        image_path: imagePath,
        option_type: optionType,
        added_by: effectiveUserId, // Use authenticated user
        expiry_date: req.body.expiryDate || null
      };

      // ... rest of medicine creation logic

    } else if (itemType === 'equipment') {
      const equipmentData = {
        name,
        description,
        quantity: parseInt(quantity),
        price: optionType === 'sell' ? parseFloat(price || 0) : 0,
        rent_price: optionType === 'rent' ? parseFloat(rentPrice || 0) : 0,
        min_rental_days: optionType === 'rent' ? parseInt(duration || 1) : 0,
        is_for_rent: optionType === 'rent',
        is_donated: optionType === 'donate',
        image_path: imagePath,
        option_type: optionType,
        condition: req.body.condition || 'good',
        added_by: effectiveUserId // Use authenticated user
      };

      // ... rest of equipment creation logic
    }

  } catch (error) {
    console.error('💥 Unexpected error in create:', error);
    res.status(500).json({ 
      error: 'Internal server error: ' + error.message
    });
  }
};