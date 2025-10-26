const cloudinary = require('cloudinary').v2;

// Configure Cloudinary (but we're not using it for uploads)
console.log('🔧 Cloudinary configured (using local image storage)');

// Upload function that just returns the local image data
exports.uploadToCloudinary = async (file, folder) => {
  try {
    console.log('📸 Using local image storage instead of Cloudinary');
    
    if (!file) {
      throw new Error('No file provided for upload');
    }

    // Return the image data directly without uploading to Cloudinary
    return {
      public_id: 'local_avatar_' + Date.now(),
      url: file // This is the base64 data URL
    };
  } catch (error) {
    console.error('❌ Local image processing error:', error.message);
    throw new Error(`Image processing failed: ${error.message}`);
  }
};

// Delete function - no-op since we're not using Cloudinary
exports.deleteFromCloudinary = async (publicId) => {
  console.log('⚠️ Cloudinary delete skipped (using local storage)');
};