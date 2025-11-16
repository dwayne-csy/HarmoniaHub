const User = require('../models/UserModels');
const crypto = require('crypto');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/Cloudinary');
const Mailer = require('../utils/Mailer');
const admin = require('../utils/firebaseAdmin');

// ========== REGISTER USER ==========
exports.registerUser = async (req, res) => {
  try {
    console.log('📝 Register user request received');
    const { name, email, password, avatar, authProvider = 'local' } = req.body;

    // Remove avatar from required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    console.log('✅ Basic validation passed');

    // Check if user already exists in our database
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    let user;
    
    // ========== FIREBASE REGISTRATION ==========
    if (authProvider === 'firebase-email') {
      console.log('🔥 Creating AUTO-VERIFIED user in Firebase...');
      const firebaseUser = await admin.auth().createUser({
        email,
        password,
        displayName: name,
        emailVerified: true // ✅ AUTO-VERIFY FIREBASE USERS
      });

      console.log('✅ Firebase user created (auto-verified):', firebaseUser.uid);

      // Generate avatar URL from user's name
      const encodedName = encodeURIComponent(name);
      const avatarData = {
        public_id: 'avatar_' + Date.now(),
        url: `https://ui-avatars.com/api/?name=${encodedName}&background=random&color=fff&size=150`
      };

      console.log('👤 Creating Firebase user in database...');
      // Create new user in our database - AUTO VERIFIED
      user = await User.create({
        name,
        email,
        password: firebaseUser.uid, // Store Firebase UID as password
        avatar: avatarData,
        isVerified: true, // ✅ AUTO-VERIFIED FOR FIREBASE
        isActive: true,
        firebaseUID: firebaseUser.uid,
        authProvider: 'firebase-email'
      });
      console.log('✅ Firebase user created in database (auto-verified):', user.email);

      // ✅ NO VERIFICATION EMAIL NEEDED FOR FIREBASE USERS

      return res.status(201).json({
        success: true,
        message: `Firebase registration successful! Your account has been automatically verified and is ready to use.`,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isVerified: user.isVerified,
          authProvider: user.authProvider
        }
      });

    } 
    // ========== LOCAL REGISTRATION ==========
    else {
      console.log('👤 Creating LOCAL user in database...');
      
      // Generate avatar URL from user's name
      const encodedName = encodeURIComponent(name);
      const avatarData = {
        public_id: 'avatar_' + Date.now(),
        url: `https://ui-avatars.com/api/?name=${encodedName}&background=random&color=fff&size=150`
      };

      // Create new user in our database - NOT VERIFIED
      user = await User.create({
        name,
        email,
        password, // Store actual password for local users
        avatar: avatarData,
        isVerified: false, // ❌ NOT VERIFIED FOR LOCAL USERS
        isActive: true,
        authProvider: 'local'
      });
      console.log('✅ Local user created in database (requires verification):', user.email);

      // Generate email verification token for local users
      const verificationToken = user.getEmailVerificationToken();
      await user.save({ validateBeforeSave: false });

      // Generate verification URL for local users
      const verificationUrl = `${req.protocol}://${req.get('host')}/api/v1/verify-email/${verificationToken}`;

      const message = `
        <h2>Welcome to ${process.env.APP_NAME}</h2>
        <p>Click the link below to verify your email and activate your account:</p>
        <a href="${verificationUrl}" target="_blank" style="padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">Verify Your Email</a>
        <br><br>
        <p>If you didn't request this, please ignore this email.</p>
        <p><small>Or copy this link: ${verificationUrl}</small></p>
      `;

      console.log('📨 Sending verification email to local user:', user.email);
      await Mailer({
        email: user.email,
        subject: 'Verify your email - ' + process.env.APP_NAME,
        message
      });
      console.log('✅ Verification email sent to local user');

      return res.status(201).json({
        success: true,
        message: `Registration successful! Verification email sent to ${user.email}. Please verify your email before logging in.`,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isVerified: user.isVerified,
          authProvider: user.authProvider
        }
      });
    }

  } catch (error) {
    console.error('❌ REGISTER ERROR DETAILS:');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    
    // Check for specific Firebase errors
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already exists in Firebase' 
      });
    }
    
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

    // Firebase specific errors
    if (error.code === 'auth/invalid-email') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email address' 
      });
    }

    if (error.code === 'auth/weak-password') {
      return res.status(400).json({ 
        success: false, 
        message: 'Password should be at least 6 characters' 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Registration failed. Please try again.' 
    });
  }
};

// ========== VERIFY EMAIL ==========
// ========== VERIFY EMAIL ==========
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // For Firebase users, we don't use token verification
    // But for LOCAL users, we need to handle verification
    if (!token) {
      return res.status(400).json({ 
        success: false, 
        message: 'Verification token is required' 
      });
    }

    // Find user by verification token
    const user = await User.findOne({
      emailVerificationToken: crypto.createHash('sha256').update(token).digest('hex'),
      emailVerificationExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email verification token is invalid or has expired' 
      });
    }

    // Verify the user
    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    console.log('✅ Email verified for local user:', user.email);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now login to your account.'
    });

  } catch (error) {
    console.error('❌ VERIFY EMAIL ERROR:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Email verification failed' 
    });
  }
};
// ========== CHECK EMAIL VERIFICATION STATUS ==========
exports.checkEmailVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Get user from Firebase to check verification status
    try {
      const firebaseUser = await admin.auth().getUserByEmail(email);
      
      res.status(200).json({
        success: true,
        isVerified: firebaseUser.emailVerified,
        message: firebaseUser.emailVerified ? 'Email is verified' : 'Email is not verified'
      });
    } catch (firebaseError) {
      // If user not found in Firebase, check our database
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.status(200).json({
        success: true,
        isVerified: user.isVerified,
        message: user.isVerified ? 'Email is verified' : 'Email is not verified'
      });
    }

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========== LOGIN USER ==========
exports.loginUser = async (req, res) => {
  try {
    console.log('🔐 Login attempt for:', req.body.email);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter email and password' });
    }

    // Find user in database
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // 🚫 Check if user is deleted (in trash)
    if (user.isDeleted) {
      console.log('🗑️ Deleted user attempted login:', email);
      return res.status(403).json({ message: 'Your account has been deleted. Please contact support.' });
    }

    // 🚫 Check if user is inactive
    if (!user.isActive) {
      console.log('❌ Inactive user attempted login:', email);
      return res.status(403).json({ message: 'Your account is inactive. Please contact support.' });
    }

    // For Firebase email users, check Firebase verification status
    if (user.authProvider === 'firebase-email') {
      try {
        const firebaseUser = await admin.auth().getUser(user.firebaseUID);
        if (!firebaseUser.emailVerified) {
          console.log('❌ Firebase user not verified:', email);
          
          // Resend verification email if not verified
          try {
            const verificationLink = await admin.auth().generateEmailVerificationLink(email);
            const message = `
              <h2>Email Verification Required</h2>
              <p>Your email is not verified. Click the link below to verify your email:</p>
              <a href="${verificationLink}" target="_blank" style="padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">Verify Your Email</a>
              <br><br>
              <p>If you already verified your email, please try logging in again.</p>
            `;

            await Mailer({
              email: user.email,
              subject: 'Verify your email - ' + process.env.APP_NAME,
              message
            });
          } catch (emailError) {
            console.warn('Could not resend verification email:', emailError.message);
          }

          return res.status(403).json({ 
            message: 'Please verify your email first. A new verification email has been sent.' 
          });
        }
        
        // Update our database if Firebase user is verified
        if (firebaseUser.emailVerified && !user.isVerified) {
          user.isVerified = true;
          await user.save({ validateBeforeSave: false });
        }
      } catch (firebaseError) {
        console.error('Error checking Firebase verification:', firebaseError);
      }
    }

    // 🚫 Check if user is verified (for local users)
    if (user.authProvider === 'local' && !user.isVerified) {
      console.log('❌ Local user not verified:', email);
      return res.status(403).json({ message: 'Please verify your email first.' });
    }

    // ✅ For Firebase users, they should use Firebase login
    if (user.authProvider === 'firebase-email' || user.authProvider === 'google') {
      return res.status(400).json({ 
        message: 'Please use Firebase authentication for this account. Use Firebase email login or Google login.' 
      });
    }

    // ✅ For local users, check password
    if (user.authProvider === 'local') {
      const userWithPassword = await User.findOne({ email }).select('+password');
      const isPasswordMatched = await userWithPassword.comparePassword(password);
      if (!isPasswordMatched) {
        console.log('❌ Password mismatch for:', email);
        return res.status(401).json({ message: 'Invalid email or password' });
      }
    }

    // ✅ Successful login
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

    // For Firebase users, use Firebase password reset but send via Mailtrap
    if (user.authProvider === 'firebase-email' || user.authProvider === 'google') {
      try {
        const resetLink = await admin.auth().generatePasswordResetLink(user.email);
        
        const message = `
          <h2>Password Reset Request</h2>
          <p>Click the link below to reset your password:</p>
          <a href="${resetLink}" target="_blank" style="padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Your Password</a>
          <br><br>
          <p>If you did not request this email, please ignore it.</p>
          <p><small>Or copy this link: ${resetLink}</small></p>
        `;

        console.log('📨 Sending Firebase password reset email via Mailtrap to:', user.email);
        await Mailer({
          email: user.email,
          subject: 'Password Recovery - ' + process.env.APP_NAME,
          message
        });

        return res.status(200).json({ 
          success: true, 
          message: `Password reset email sent to: ${user.email}` 
        });
      } catch (firebaseError) {
        console.error('Firebase password reset error:', firebaseError);
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to send password reset email. Please try again.' 
        });
      }
    }

    // For local users, use existing system with Mailtrap
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    const message = `
      <h2>Password Reset Request</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}" target="_blank" style="padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Your Password</a>
      <br><br>
      <p>If you did not request this email, please ignore it.</p>
      <p><small>Or copy this link: ${resetUrl}</small></p>
    `;

    console.log('📨 Sending local password reset email via Mailtrap to:', user.email);
    await Mailer({
      email: user.email,
      subject: 'Password Recovery - ' + process.env.APP_NAME,
      message
    });

    res.status(200).json({ 
      success: true, 
      message: `Password reset email sent to: ${user.email}` 
    });
  } catch (error) {
    console.error('❌ FORGOT PASSWORD ERROR:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};


// ========== FIREBASE EMAIL/PASSWORD LOGIN ==========
exports.firebaseEmailLogin = async (req, res) => {
  try {
    console.log('🔥 Firebase email login attempt');
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: 'Firebase ID token is required' });
    }

    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { email, uid, email_verified } = decodedToken;

    console.log('✅ Firebase token verified for:', email);

    // ✅ REMOVED EMAIL VERIFICATION CHECK - TRUST FIREBASE AUTHENTICATION
    // Users are now auto-verified during registration, so no need to check

    // Find or create user in database
    let user = await User.findOne({ email });
    
    if (!user) {
      // Auto-create user if not exists (for Firebase auth)
      user = await User.create({
        name: email.split('@')[0], // Default name from email
        email: email,
        password: uid,
        avatar: {
          public_id: `firebase_${uid}`,
          url: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=random&color=fff&size=150`
        },
        isVerified: true, // Auto-verified for new Firebase users
        isActive: true,
        firebaseUID: uid,
        authProvider: 'firebase-email'
      });
      console.log('✅ User auto-created for Firebase login');
    } else {
      // Update user verification status if needed
      if (!user.isVerified) {
        user.isVerified = true; // Ensure user is marked as verified
        await user.save({ validateBeforeSave: false });
      }
    }

    // 🚫 Check if user is deleted or inactive
    if (user.isDeleted) {
      return res.status(403).json({ message: 'Your account has been deleted. Please contact support.' });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: 'Your account is inactive. Please contact support.' });
    }

    // Generate our JWT token
    const token = user.getJwtToken();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    console.log('✅ Firebase email login successful for:', email);
    res.status(200).json({
      success: true,
      token,
      user: userResponse,
      message: 'Firebase authentication successful'
    });

  } catch (error) {
    console.error('❌ FIREBASE EMAIL LOGIN ERROR:', error);
    
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ message: 'Firebase token expired' });
    }
    if (error.code === 'auth/invalid-id-token') {
      return res.status(401).json({ message: 'Invalid Firebase token' });
    }

    res.status(500).json({
      success: false,
      message: 'Firebase authentication failed',
      error: error.message
    });
  }
};
// ========== RESEND VERIFICATION EMAIL ==========
exports.resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // For Firebase users, use Firebase verification
    if (user.authProvider === 'firebase-email') {
      const verificationLink = await admin.auth().generateEmailVerificationLink(email);
      
      const message = `
        <h2>Email Verification</h2>
        <p>Click the link below to verify your email:</p>
        <a href="${verificationLink}" target="_blank" style="padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">Verify Your Email</a>
        <br><br>
        <p>If you didn't request this, please ignore this email.</p>
      `;

      await Mailer({
        email: user.email,
        subject: 'Verify your email - ' + process.env.APP_NAME,
        message
      });

      return res.status(200).json({
        success: true,
        message: 'Verification email sent successfully'
      });
    }

    // For local users, use existing system
    const verificationToken = user.getEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    const verificationUrl = `${req.protocol}://${req.get('host')}/api/v1/verify-email/${verificationToken}`;

    const message = `
      <h2>Email Verification</h2>
      <p>Click the link below to verify your email:</p>
      <a href="${verificationUrl}" target="_blank">${verificationUrl}</a>
      <br><br>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    await Mailer({
      email: user.email,
      subject: 'Verify your email - ' + process.env.APP_NAME,
      message
    });

    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully'
    });

  } catch (error) {
    console.error('❌ RESEND VERIFICATION ERROR:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send verification email' 
    });
  }
};

// KEEP ALL YOUR EXISTING METHODS BELOW (they remain the same)
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
    const user = await User.findById(req.user.id).select('-password');
    if (!user)
      return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ 
      success: true, 
      user: {
        name: user.name,
        email: user.email,
        contact: user.contact,
        address: user.address,
        avatar: user.avatar,
        role: user.role,
        isVerified: user.isVerified,
        authProvider: user.authProvider,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========== UPDATE PROFILE ==========
exports.updateProfile = async (req, res) => {
  try {
    console.log('📝 Update profile request received for user:', req.user.id);

    const newUserData = {
      name: req.body.name,
      contact: req.body.contact,
      address: {
        city: req.body.city,
        barangay: req.body.barangay,
        street: req.body.street,
        zipcode: req.body.zipcode
      }
    };

    // Remove undefined address fields
    Object.keys(newUserData.address).forEach(key => {
      if (!newUserData.address[key]) delete newUserData.address[key];
    });

    // Handle avatar upload
    if (req.file) {
      console.log('🖼️ Avatar file detected:', req.file.path);
      const currentUser = await User.findById(req.user.id);

      // Delete old avatar if exists and not default ui-avatars
      if (currentUser.avatar?.public_id && !currentUser.avatar.url.includes('ui-avatars.com')) {
        try {
          await deleteFromCloudinary(currentUser.avatar.public_id);
          console.log('✅ Old avatar deleted from Cloudinary');
        } catch (err) {
          console.warn('⚠️ Could not delete old avatar:', err.message);
        }
      }

      // Upload new avatar
      const avatarResult = await uploadToCloudinary(req.file.path, 'harmoniahub/avatars');
      newUserData.avatar = {
        public_id: avatarResult.public_id,
        url: avatarResult.url
      };

      // Remove temp file
      const fs = require('fs');
      fs.unlink(req.file.path, err => {
        if (err) console.warn('⚠️ Failed to delete temp avatar file:', err.message);
      });

      console.log('✅ Avatar uploaded to Cloudinary');
    }

    // Update user in DB
    const updatedUser = await User.findByIdAndUpdate(req.user.id, newUserData, {
      new: true,
      runValidators: true
    });

    console.log('✅ Profile updated successfully');
    res.status(200).json({
      success: true,
      user: updatedUser,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('❌ UPDATE PROFILE ERROR:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }
    res.status(500).json({ success: false, message: 'Profile update failed. Please try again.' });
  }
};

// ========== UPDATE PASSWORD ==========
exports.updatePassword = async (req, res) => {
  try {
    console.log("🔐 Password update request received for user:", req.user.id);

    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
      console.log("❌ User not found");
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // For Firebase users, password updates should happen through Firebase
    if (user.authProvider !== 'local') {
      return res.status(400).json({ 
        success: false, 
        message: "Please update your password through Firebase authentication" 
      });
    }

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);
    if (!isPasswordMatched) {
      console.log("❌ Old password incorrect");
      return res.status(400).json({ success: false, message: "Old password is incorrect" });
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
      console.log("❌ New passwords do not match");
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    // Update the password
    user.password = req.body.newPassword;

    // Save the user without triggering re-validation of required fields
    await user.save({ validateBeforeSave: false });

    console.log("✅ Password updated successfully");
    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("❌ UPDATE PASSWORD ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update password",
    });
  }
};

// ========== FIREBASE GOOGLE AUTH ==========
exports.firebaseGoogleAuth = async (req, res) => {
  try {
    console.log('🔥 Firebase Google auth attempt');
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: 'Firebase ID token is required' });
    }

    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { email, uid, name, picture } = decodedToken;

    console.log('✅ Firebase Google token verified for:', email);

    // Find or create user in database
    let user = await User.findOne({ email });
    
    if (!user) {
      // Auto-create user for Google auth
      user = await User.create({
        name: name || email.split('@')[0],
        email: email,
        password: uid,
        avatar: {
          public_id: `google_${uid}`,
          url: picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || email.split('@')[0])}&background=random&color=fff&size=150`
        },
        isVerified: true,
        isActive: true,
        firebaseUID: uid,
        authProvider: 'google'
      });
      console.log('✅ User auto-created for Google login');
    } else {
      // Update existing user with Google info if needed
      if (!user.firebaseUID) {
        user.firebaseUID = uid;
        user.authProvider = 'google';
        await user.save({ validateBeforeSave: false });
      }
    }

    // Check if user is deleted or inactive
    if (user.isDeleted) {
      return res.status(403).json({ message: 'Your account has been deleted. Please contact support.' });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: 'Your account is inactive. Please contact support.' });
    }

    // ✅ GENERATE JWT TOKEN (This is what you're missing!)
    const token = user.getJwtToken();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    console.log('✅ Firebase Google auth successful for:', email);
    console.log('✅ JWT Token generated:', token ? 'Yes' : 'No');
    
    res.status(200).json({
      success: true,
      token, // This sends the token to frontend
      user: userResponse,
      message: 'Google authentication successful'
    });

  } catch (error) {
    console.error('❌ FIREBASE GOOGLE AUTH ERROR:', error);
    
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ message: 'Google token expired' });
    }
    if (error.code === 'auth/invalid-id-token') {
      return res.status(401).json({ message: 'Invalid Google token' });
    }

    res.status(500).json({
      success: false,
      message: 'Google authentication failed',
      error: error.message
    });
  }
};


// ========== FIREBASE FACEBOOK AUTH ==========
exports.firebaseFacebookAuth = async (req, res) => {
  try {
    console.log('🔥 Firebase Facebook auth attempt');
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: 'Firebase ID token is required' });
    }

    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { email, uid, name, picture } = decodedToken;

    console.log('✅ Firebase Facebook token verified for:', email);

    // Find or create user in database
    let user = await User.findOne({ email });
    
    if (!user) {
      // Auto-create user for Facebook auth
      user = await User.create({
        name: name || email.split('@')[0],
        email: email,
        password: uid,
        avatar: {
          public_id: `facebook_${uid}`,
          url: picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || email.split('@')[0])}&background=random&color=fff&size=150`
        },
        isVerified: true,
        isActive: true,
        firebaseUID: uid,
        authProvider: 'facebook'
      });
      console.log('✅ User auto-created for Facebook login');
    } else {
      // Update existing user with Facebook info if needed
      if (!user.firebaseUID) {
        user.firebaseUID = uid;
        user.authProvider = 'facebook';
        await user.save({ validateBeforeSave: false });
      }
    }

    // Check if user is deleted or inactive
    if (user.isDeleted) {
      return res.status(403).json({ message: 'Your account has been deleted. Please contact support.' });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: 'Your account is inactive. Please contact support.' });
    }

    // Generate JWT token
    const token = user.getJwtToken();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    console.log('✅ Firebase Facebook auth successful for:', email);
    console.log('✅ JWT Token generated:', token ? 'Yes' : 'No');
    
    res.status(200).json({
      success: true,
      token,
      user: userResponse,
      message: 'Facebook authentication successful'
    });

  } catch (error) {
    console.error('❌ FIREBASE FACEBOOK AUTH ERROR:', error);
    
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ message: 'Facebook token expired' });
    }
    if (error.code === 'auth/invalid-id-token') {
      return res.status(401).json({ message: 'Invalid Facebook token' });
    }

    res.status(500).json({
      success: false,
      message: 'Facebook authentication failed',
      error: error.message
    });
  }
};