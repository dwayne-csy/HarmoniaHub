const User = require('../models/UserModels');
const crypto = require('crypto');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/Cloudinary');
const Mailer = require('../utils/Mailer');

// ========== REGISTER USER ==========
exports.registerUser = async (req, res) => {
  try {
    console.log('📝 Register user request received');
    const { name, email, password, avatar } = req.body;

    // Remove avatar from required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    console.log('✅ Basic validation passed');

    // Generate avatar URL from user's name (bypass Cloudinary)
    const encodedName = encodeURIComponent(name);
    const avatarData = {
      public_id: 'avatar_' + Date.now(),
      url: `https://ui-avatars.com/api/?name=${encodedName}&background=random&color=fff&size=150`
    };

    console.log('👤 Creating user in database...');
    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      avatar: avatarData
    });
    console.log('✅ User created in database:', user.email);

    // Generate email verification token
    console.log('🔐 Generating verification token...');
    const verificationToken = user.getEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Create verification link
    const verificationUrl = `${req.protocol}://${req.get('host')}/api/v1/verify-email/${verificationToken}`;
    console.log('📧 Verification URL:', verificationUrl);

    const message = `
      <h2>Welcome to ${process.env.APP_NAME}</h2>
      <p>Click the link below to verify your email and activate your account:</p>
      <a href="${verificationUrl}" target="_blank">${verificationUrl}</a>
      <br><br>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    console.log('📨 Sending verification email to:', user.email);
    await Mailer({
      email: user.email,
      subject: 'Verify your email - ' + process.env.APP_NAME,
      message
    });
    console.log('✅ Verification email sent');

    res.status(201).json({
      success: true,
      message: `Verification email sent to ${user.email}. Please verify before logging in.`,
    });

  } catch (error) {
    console.error('❌ REGISTER ERROR DETAILS:');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    
    // Check for specific MongoDB errors
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already exists' 
      });
    }
    
    // Check for validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ 
        success: false, 
        message: messages.join(', ') 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Registration failed. Please try again.' 
    });
  }
};
// ========== VERIFY EMAIL ==========
exports.verifyEmail = async (req, res) => {
  try {
    const verificationToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      emailVerificationToken: verificationToken,
      emailVerificationExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification link' });
    }

    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully. You can now log in.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========== LOGIN USER ==========
// ========== LOGIN USER ==========
exports.loginUser = async (req, res) => {
  try {
    console.log('🔐 Login attempt for:', req.body.email);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter email and password' });
    }

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      console.log('❌ User not verified:', email);
      return res.status(403).json({ message: 'Please verify your email first' });
    }

    // Debug: Check if comparePassword method exists
    console.log('🔍 User methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(user)));
    console.log('🔍 comparePassword type:', typeof user.comparePassword);

    if (typeof user.comparePassword !== 'function') {
      console.error('❌ comparePassword is not a function!');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
      console.log('❌ Password mismatch for:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log('✅ Login successful for:', email);
    const token = user.getJwtToken();
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({ 
      success: true, 
      token, 
      user: userResponse 
    });

  } catch (error) {
    console.error('❌ LOGIN ERROR:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Login failed. Please try again.',
      error: error.message 
    });
  }
};

// ========== FORGOT PASSWORD ==========
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user)
      return res.status(404).json({ message: 'User not found with this email' });

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // FIX: Point to FRONTEND (React app) not backend
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    const message = `
      <h2>Password Reset Request</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}" target="_blank" style="padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Your Password</a>
      <br><br>
      <p>If you did not request this email, please ignore it.</p>
      <p><small>Or copy this link: ${resetUrl}</small></p>
    `;

    await Mailer({
      email: user.email,
      subject: 'Password Recovery - ' + process.env.APP_NAME,
      message
    });

    res.status(200).json({ success: true, message: `Password reset email sent to: ${user.email}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// ========== RESET PASSWORD ==========
exports.resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user)
      return res.status(400).json({ message: 'Password reset token is invalid or expired' });

    // Check if passwords are provided and match
    if (!req.body.password || !req.body.confirmPassword) {
      return res.status(400).json({ message: 'Password and confirm password are required' });
    }

    if (req.body.password !== req.body.confirmPassword)
      return res.status(400).json({ message: 'Passwords do not match' });

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const token = user.getJwtToken();
    res.status(200).json({ success: true, token, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========== GET USER PROFILE ==========
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user)
      return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========== UPDATE PROFILE ==========
exports.updateProfile = async (req, res) => {
  try {
    console.log('📝 Update profile request received');
    const newUserData = {
      name: req.body.name,
      email: req.body.email
    };

    if (req.body.avatar) {
      console.log('🖼️ Avatar update requested');
      
      // Generate a unique avatar using the uploaded image data
      // Convert base64 to a data URL and use it directly
      let avatarUrl = req.body.avatar;
      
      // Ensure it's a proper data URL
      if (!avatarUrl.startsWith('data:')) {
        avatarUrl = `data:image/jpeg;base64,${avatarUrl}`;
      }
      
      newUserData.avatar = {
        public_id: 'user_avatar_' + Date.now(),
        url: avatarUrl // Store the base64 image data directly
      };
      
      console.log('✅ Avatar updated with uploaded image');
    }

    console.log('👤 Updating user in database...');
    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
      new: true,
      runValidators: true
    });

    console.log('✅ Profile updated successfully');
    res.status(200).json({ 
      success: true, 
      user,
      message: 'Profile updated successfully' 
    });

  } catch (error) {
    console.error('❌ UPDATE PROFILE ERROR:');
    console.error('Error message:', error.message);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already exists' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Profile update failed. Please try again.' 
    });
  }
};
// ========== UPDATE PASSWORD ==========
exports.updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password');
    const isMatched = await user.comparePassword(req.body.oldPassword);

    if (!isMatched)
      return res.status(400).json({ message: 'Old password is incorrect' });

    user.password = req.body.password;
    await user.save();

    const token = user.getJwtToken();
    res.status(200).json({ success: true, token, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
