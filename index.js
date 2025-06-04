const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const app = express();
const PORT = 3001;
const SECRET_KEY = 'idgfgcbicg872875345o$$%&#^gG$&##R&RfR#'; // Replace with your secret key

mongoose.connect('mongodb+srv://arshdeep725199:NCJqFzws2nPLT2HN@cluster0.3tvhxfz.mongodb.net/viewOnline?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

app.use(bodyParser.json());
app.use(cors({
    origin: "https://cre-own-fronend.vercel.app",
    credentials: true,
}));
const Category = require('./categore')
const Product = require('./ProductSchema')
const Admin = require('./AdminSchema')
const Company = require('./CompanyInfo');

// Middleware to authenticate JWT tokens
const authenticateToken =  (req, res, next) => {
  const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY,async (err, user) => {
    if (err) return res.sendStatus(403);    
  
    req.user = user;
    const company = await Company.findOne({ adminId: user.id });
    if (!company) {
      return res.status(403).json({
        error: 'No company found for this admin',
        redirectTo: 'http://localhost:3000/admin/EditPage',
      });
    }
    next();
  });
};
const userauthenticateToken =  (req, res, next) => {
  const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY,async (err, user) => {
    if (err) return res.sendStatus(403);    
  
    req.user = user;
   
    next();
  });
};
// Existing middleware and routes...

app.get('/api/company/unique/:uniqueName', async (req, res) => {
  const { uniqueName } = req.params;
    console.log(uniqueName)
  try {
   //NextGen Gadgets
    const company = await Company.findOne({ uniqueName });
    console.log(company)
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    res.json(company);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});
// Handle admin login
app.post('/api/admin/login', async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body)
  try {
    const admin = await Admin.findOne({ email });
    console.log(admin)

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = jwt.sign(
      { id: admin._id, email: admin.email }, // 👈 include id
      SECRET_KEY,
      { expiresIn: '1d' }
    );
    // const token = jwt.sign({ email: admin.email }, SECRET_KEY, { expiresIn: '1d' });
    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Handle form submission and update productDetail.json
app.post('/api/add-product', authenticateToken, async (req, res) => {
  try {
    const newProduct = new Product({
      ...req.body,
      adminId: req.user.id  // 👈 attaching logged-in admin's id
    });
    await newProduct.save();
    res.status(201).json({ message: 'Product added successfully!' });
  } catch (err) {
    console.error('Error saving product:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get products
app.get('/api/product', authenticateToken, async (req, res) => {
  try {
    // Fetch products for the logged-in admin only
    const products = await Product.find({ adminId: req.user.id }).sort({ id: -1 }); // descending order by id
   const company = await Company.findOne({ adminId: req.user.id }).select('uniqueName');

    // If no company found, return custom message
    if (!company) {
      return res.status(404).json({ message: 'no-company', redirectTo: '/admin/EditPage' });
    }

    res.status(200).json({
      products,
      brandName: company.uniqueName
    });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.get('/api/productsUser/:uniqueName', async (req, res) => {
  try {
    const { uniqueName } = req.params;
    // Fetch products for the logged-in admin only
     const company = await Company.findOne({ uniqueName: uniqueName }).select('adminId');
    const adminID = company?.adminId;
    console.log(adminID)
    const products = await Product.find({ adminId: adminID }).sort({ id: -1 }); // descending order by id
    console.log(products)
    res.status(200).json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get a single product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    console.log(req.params.id +"dbs")
    const product = await Product.findOne({ _id: req.params.id });
console.log(product);
    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Endpoint to update a product by ID
app.put('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    console.log(req.params.id)
    const updated = await Product.findOneAndUpdate(
      { _id: req.params.id },
      { $set: req.body },
      { new: true }
    );

    if (updated) {
      res.status(200).json({ message: 'Product updated successfully!', product: updated });
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to delete a product by ID
app.delete('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    const result = await Product.findOneAndDelete({ id: parseInt(req.params.id) });

    if (result) {
      res.status(200).json({ message: 'Product deleted successfully!' });
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/api/categories', authenticateToken, async (req, res) => {
  try {
    const categories = await Category.find({ adminId: req.user.id });

    if (categories && categories.length > 0) {
      res.status(200).json(categories);
    } else {
      res.status(404).json({ error: 'No categories found' });
    }
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/categories', authenticateToken, async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  try {
    // Check if category already exists
    const existingCategory = await Category.findOne({ adminId: req.user.id, name });

    if (existingCategory) {
      return res.status(400).json({ error: 'Category already exists' });
    }

    // Create and save new category
    const newCategory = new Category({ name, adminId: req.user.id });
    await newCategory.save();

    res.status(201).json({ message: 'Category added successfully!', category: newCategory });
  } catch (err) {
    console.error('Error adding category:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to delete a category
app.delete('/api/categories', authenticateToken, async (req, res) => {
  const categoryName = req.body.category;

  if (!categoryName) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  try {
    // Find and delete the category belonging to the logged-in admin
    const deletedCategory = await Category.findOneAndDelete({ name: categoryName, adminId: req.user.id });

    if (!deletedCategory) {
      return res.status(404).json({ error: 'Category not found or unauthorized' });
    }

    res.status(200).json({ message: 'Category deleted successfully!' });
  } catch (err) {
    console.error('Error deleting category:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
function generateUniqueName(brandName) {
  return brandName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // replace spaces with -
    .replace(/[^a-z0-9\-]/g, ''); // remove all non-alphanumeric except -
}
// Endpoint to handle company submissions
app.post('/api/company/submit',userauthenticateToken, async (req, res) => {
  try {
    console.log(req.user)
    let baseUniqueName = generateUniqueName(req.body.brandName);
    let uniqueName = baseUniqueName;
    let count = 1;

    // Check if uniqueName already exists, and modify if needed
    while (await Company.findOne({ uniqueName })) {
      uniqueName = `${baseUniqueName}-${count}`;
      count++;
    }

    const newCompany = new Company({
      ...req.body,
      uniqueName,          // 👈 set the generated uniqueName
      adminId: req.user.id
    });
    await newCompany.save();
    res.status(201).json({ message: 'Company submitted successfully!', company: newCompany });
  } catch (err) {
    console.error('Error submitting company:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
// Endpoint to update company info
app.put('/api/company/update/:id', userauthenticateToken, async (req, res) => {
  try {
    const updatedCompany = await Company.findOneAndUpdate(
      { _id: req.params.id, adminId: req.user.id }, // Make sure only owner's company is updated
      { $set: req.body },
      { new: true }
    );

    if (!updatedCompany) {
      return res.status(404).json({ error: 'Company not found or unauthorized' });
    }

    res.status(200).json({ message: 'Company updated successfully!', company: updatedCompany });
  } catch (err) {
    console.error('Error updating company:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/company/info',authenticateToken, async (req, res) => {
  try {
    const company = await Company.find({ adminId: req.user.id }); // Assuming only one company info exists
    console.log(company)
    if (!company) {
      return res.status(404).json({ message: 'Company information not found' });
    }
    res.status(200).json(company);
  } catch (err) {
    console.error('Error fetching company info:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
// Handle admin registration
app.post('/api/admin/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and Password are required' });
  }

  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ error: 'Admin already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin
    const newAdmin = new Admin({ email, password: hashedPassword });
    await newAdmin.save();

    res.status(201).json({ message: 'Admin registered successfully!' });
  } catch (err) {
    console.error('Error registering admin:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// app.use((req, res, next) => {
//   res.status(404).send('404 Not Found');
// });
// server.js (add this route)
// server.js
app.get('/check-auth', authenticateToken, (req, res) => {
  res.sendStatus(200); // If authenticated, send 200 OK
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
