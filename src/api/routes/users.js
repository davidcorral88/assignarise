
const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const bcrypt = require('bcrypt');

// Get all users
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all users');
    const result = await pool.query('SELECT * FROM users ORDER BY id');
    console.log(`Found ${result.rows.length} users`);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user by id or email
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try to parse as integer first for ID lookup
    const numericId = !isNaN(parseInt(id, 10)) ? parseInt(id, 10) : null;
    
    if (numericId !== null) {
      // If id can be parsed as a number, search by id
      console.log(`Looking up user by numeric ID: ${numericId}`);
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [numericId]);
      if (result.rows.length > 0) {
        console.log(`User found by ID: ${numericId}`);
        return res.json(result.rows[0]);
      }
      console.log(`No user found with ID: ${numericId}, trying email lookup`);
    }
    
    // If not found by numeric ID or id is not numeric, try to find by email
    console.log(`Looking up user by email: ${id}`);
    const result2 = await pool.query('SELECT * FROM users WHERE email = $1', [id]);
    if (result2.rows.length === 0) {
      console.log(`No user found with email: ${id}`);
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log(`User found by email: ${id}`);
    res.json(result2.rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create user
router.post('/', async (req, res) => {
  try {
    const { id, name, email, role, avatar, active, password, phone, emailATSXPTPG, organization } = req.body;
    
    // Ensure id is treated as an integer
    const numericId = parseInt(id, 10);
    
    console.log('Creating new user:', { id: numericId, name, email, role, organization });
    
    // Start a transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Check what columns exist in the users table
      const columnsResult = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users'
      `);
      
      const columns = columnsResult.rows.map(row => row.column_name);
      const hasEmailATSXPTPG = columns.includes('emailATSXPTPG');
      const hasOrganization = columns.includes('organization');
      
      console.log('Available columns:', columns);
      console.log('Has emailATSXPTPG column:', hasEmailATSXPTPG);
      console.log('Has organization column:', hasOrganization);
      
      // Build dynamic query based on available columns
      let fields = ['id', 'name', 'email', 'role', 'avatar', 'active', 'phone'];
      let placeholders = ['$1', '$2', '$3', '$4', '$5', '$6', '$7'];
      let values = [numericId, name, email, role, avatar, active || true, phone || null];
      
      let paramCounter = 8;
      
      if (hasEmailATSXPTPG) {
        fields.push('"emailATSXPTPG"');
        placeholders.push(`$${paramCounter}`);
        values.push(emailATSXPTPG || null);
        paramCounter++;
      }
      
      if (hasOrganization) {
        fields.push('organization');
        placeholders.push(`$${paramCounter}`);
        values.push(organization || null);
        paramCounter++;
      }
      
      const insertQuery = `
        INSERT INTO users (${fields.join(', ')}) 
        VALUES (${placeholders.join(', ')}) 
        RETURNING *
      `;
      
      console.log('Insert query:', insertQuery);
      console.log('Values:', values);
      
      // Insert the user
      const userResult = await client.query(insertQuery, values);
      
      // If password is provided, hash it and store it in user_passwords table
      if (password) {
        // Hash the password (10 rounds is recommended for bcrypt)
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // Insert the hashed password
        await client.query(
          'INSERT INTO user_passwords (user_id, password_hash) VALUES ($1, $2)',
          [numericId, hashedPassword]
        );
        
        console.log(`Password created for user: ${numericId}`);
      }
      
      await client.query('COMMIT');
      console.log('User created successfully:', userResult.rows[0]);
      res.status(201).json(userResult.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, avatar, active, phone, emailATSXPTPG, organization } = req.body;
    
    // Ensure id is an integer
    const numericId = parseInt(id, 10);
    
    if (isNaN(numericId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    console.log('Updating user:', { id: numericId, name, email, role, organization });
    
    // Debug the organization value to ensure it's reaching the server correctly
    console.log('Organization value received:', organization);
    console.log('EmailATSXPTPG value received:', emailATSXPTPG);
    
    try {
      // Check what columns exist in the users table
      const columnsResult = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users'
      `);
      
      const columns = columnsResult.rows.map(row => row.column_name);
      const hasEmailATSXPTPG = columns.includes('emailATSXPTPG');
      const hasOrganization = columns.includes('organization');
      
      console.log('Available columns:', columns);
      console.log('Has emailATSXPTPG column:', hasEmailATSXPTPG);
      console.log('Has organization column:', hasOrganization);
      
      // Build dynamic SET part of the query based on available columns
      let setFields = ['name = $1', 'email = $2', 'role = $3', 'avatar = $4', 'active = $5', 'phone = $6'];
      let values = [name, email, role, avatar, active, phone || null];
      
      let paramCounter = 7;
      
      if (hasEmailATSXPTPG) {
        setFields.push(`"emailATSXPTPG" = $${paramCounter}`);
        values.push(emailATSXPTPG || null);
        paramCounter++;
      }
      
      if (hasOrganization) {
        setFields.push(`organization = $${paramCounter}`);
        values.push(organization || null);
        paramCounter++;
      }
      
      // Add user ID as the last parameter
      values.push(numericId);
      
      const updateQuery = `
        UPDATE users 
        SET ${setFields.join(', ')} 
        WHERE id = $${paramCounter}
        RETURNING *
      `;
      
      console.log('Update query:', updateQuery);
      console.log('Values:', values);
      
      const result = await pool.query(updateQuery, values);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      console.log('User updated successfully:', result.rows[0]);
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Database error during update:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Ensure id is an integer
    const numericId = parseInt(id, 10);
    
    if (isNaN(numericId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    console.log('Deleting user with ID:', numericId);
    
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [numericId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('User deleted successfully');
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
