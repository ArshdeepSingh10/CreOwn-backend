const bcrypt = require('bcryptjs');

// Admin password to hash
const password = 'Chawla4grt785uhgr81';

// Generate a salt with bcrypt
const salt = bcrypt.genSaltSync(10);

// Hash the password with the generated salt
const hash = bcrypt.hashSync(password, salt);

console.log(hash);
