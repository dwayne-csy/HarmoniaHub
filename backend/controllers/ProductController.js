const Product = require('../models/ProductModels');
const Supplier = require('../models/SupplierModels');


// Create new product   =>  /api/v1/admin/products
exports.createProduct = async (req, res, next) => {
    try {
        // If supplier is provided, check if it exists and is active
        if (req.body.supplier) {
            const supplier = await Supplier.findOne({
                _id: req.body.supplier,
                isActive: true
            });
            
            if (!supplier) {
                return res.status(404).json({
                    success: false,
                    message: 'Supplier not found or inactive'
                });
            }
        }

        const product = await Product.create(req.body);

        res.status(201).json({
            success: true,
            product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get all products   =>  /api/v1/products
exports.getAllProducts = async (req, res, next) => {
    try {
        const products = await Product.find({ isActive: true })
            .populate('supplier', 'name email')
            .populate('reviews.user', 'name');

        res.status(200).json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getProduct = async (req, res, next) => {
  try {
    // Admin can fetch any product
    const product = await Product.findById(req.params.id)
      .populate('supplier', 'name email phone address')
      .populate('reviews.user', 'name');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update product   =>  /api/v1/admin/products/:id
exports.updateProduct = async (req, res, next) => {
    try {
        // If supplier is provided in update, check if it exists and is active
        if (req.body.supplier) {
            const supplier = await Supplier.findOne({
                _id: req.body.supplier,
                isActive: true
            });
            
            if (!supplier) {
                return res.status(404).json({
                    success: false,
                    message: 'Supplier not found or inactive'
                });
            }
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        ).populate('supplier', 'name email');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Soft delete product   =>  /api/v1/admin/products/:id
exports.softDeleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get active suppliers for dropdown   =>  /api/v1/suppliers/dropdown
exports.getActiveSuppliers = async (req, res, next) => {
    try {
        const suppliers = await Supplier.find({ isActive: true })
            .select('name email');

        res.status(200).json({
            success: true,
            suppliers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ✅ Soft delete product   =>  /api/v1/admin/products/:id
exports.softDeleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product soft-deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ProductController.js
exports.getDeletedProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: false }).sort({ updatedAt: -1 }).populate('supplier', 'name');
    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.restoreProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Product restored successfully',
      product
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};