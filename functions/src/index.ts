import {onCall} from "firebase-functions/v2/https";
import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK
admin.initializeApp();

// Get Firestore instance
const db = admin.firestore();

export { autoTranslateItem } from './translate';
export { autoTranslateCategory } from './translate';
export { autoTranslateMenu } from './translate';
export { exportMenuJson } from './publish';
// export { processMenuImage } from './image';

/**
 * Export Menu Function
 * Takes a menuId and returns complete menu data as JSON
 */
export const exportMenu = onCall(async (request: any) => {
  // Initialize variables with default values
  let menuId: string = '';
  let action: string = '';
  
  try {
    // Safely destructure the request data
    const data = request.data || {};
    menuId = data.menuId;
    action = data.action;
    
    if (!menuId) {
      throw new Error("Menu ID is required");
    }

    if (!action || !['publish', 'unpublish'].includes(action)) {
      throw new Error("Action must be 'publish' or 'unpublish'");
    }

    logger.info(`${action} menu: ${menuId}`);

    if (action === 'unpublish') {
      // Handle unpublish - remove JSON file from storage
      const bucket = admin.storage().bucket();
      const fileName = `menus/menu-${menuId}.json`;
      const file = bucket.file(fileName);
      
      try {
        // Check if file exists before trying to delete
        const [exists] = await file.exists();
        if (exists) {
          await file.delete();
          logger.info(`Deleted menu file: ${fileName}`);
        } else {
          logger.info(`Menu file not found (already deleted?): ${fileName}`);
        }
      } catch (deleteError) {
        logger.warn(`Could not delete menu file ${fileName}:`, deleteError);
        // Don't throw error - unpublish should succeed even if file doesn't exist
      }

      return {
        success: true,
        message: `Menu unpublished successfully`,
        action: 'unpublish',
        menuId
      };
    }

    // If we get here, action is 'publish'
    logger.info(`Exporting menu: ${menuId}`);

    // Get the menu
    const menuDoc = await db.collection('menus').doc(menuId).get();
    if (!menuDoc.exists) {
      throw new Error(`Menu not found: ${menuId}`);
    }

    const menuData: any = menuDoc.data();
    
    // Get categories
    const categoryPromises = menuData.categories.map((categoryId: string) => 
      db.collection('categories').doc(categoryId).get()
    );
    const categoryDocs = await Promise.all(categoryPromises);
    
    // Get menu items for each category
    const categories = [];
    for (const categoryDoc of categoryDocs) {
      if (categoryDoc.exists) {
        const categoryData: any = categoryDoc.data();
        
        // Get items for this category
        const items = [];
        if (categoryData.items && categoryData.items.length > 0) {
          const itemPromises = categoryData.items.map((itemId: string) => 
            db.collection('menu_items').doc(itemId).get()
          );
          const itemDocs = await Promise.all(itemPromises);
          
          for (const itemDoc of itemDocs) {
            if (itemDoc.exists) {
              items.push({
                id: itemDoc.id,
                ...itemDoc.data()
              });
            }
          }
          
          // Sort items by menu_order
          items.sort((a: any, b: any) => (a.menu_order || 0) - (b.menu_order || 0));
        }
        
        categories.push({
          id: categoryDoc.id,
          name: categoryData.cat_name,
          header: categoryData.header,
          description: categoryData.cat_description,
          footer: categoryData.footer,
          items: items,
          addons: categoryData.addons,
          extras: categoryData.extras
        });
      }
    }

    // Build the complete menu JSON
    const completeMenu = {
      menu: {
        id: menuId,
        name: menuData.menu_name,
        description: menuData.menu_description,
        type: menuData.menu_type
      },
      categories: categories,
      lastUpdated: new Date().toISOString()
    };

    // Save JSON to Firebase Storage
    const bucket = admin.storage().bucket();
    const fileName = `menus/menu-${menuId}.json`;
    const file = bucket.file(fileName);
    
    const jsonString = JSON.stringify(completeMenu, null, 2);
    
    await file.save(jsonString, {
      metadata: {
        contentType: 'application/json',
        cacheControl: 'public, max-age=300', // 5 minutes cache
      },
    });

    // Make the file publicly readable
    await file.makePublic();

    // Get the public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

    logger.info(`Menu export completed: ${categories.length} categories, saved to ${publicUrl}`);

    return {
      success: true,
      message: `Menu exported successfully`,
      data: completeMenu,
      url: publicUrl
    };

  } catch (error: any) {
    logger.error(`Error in ${action || 'unknown action'}:`, error);
    return {
      success: false,
      message: error.message || `Operation failed`,
      action: action || 'unknown',
      menuId: menuId || 'unknown'
    };
  }
});

// Simple test function
export const helloWorld = onRequest((request: any, response: any) => {
  response.send("Hello from Firebase Functions!");
});

/**
 * Process Menu Image Function - HTTP Request Version
 * Takes a menuId and base64 image data, processes it into optimized sizes
 */
export const processMenuImage = onRequest({
  cors: true,
  region: 'us-central1',
  memory: '1GiB',
  timeoutSeconds: 60
}, async (req, res) => {
  
  // Set CORS headers explicitly
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method not allowed' });
    return;
  }
  
  let menuId: string = '';
  
  try {
    // Get data from request body
    const { menuId: reqMenuId, imageData, aspectRatio } = req.body;
    menuId = reqMenuId;
    
    if (!menuId) {
      throw new Error("Menu ID is required");
    }
    
    if (!imageData) {
      throw new Error("Image data is required");
    }
    
    if (!aspectRatio || !['1:1', '16:9'].includes(aspectRatio)) {
      throw new Error("Aspect ratio must be '1:1' or '16:9'");
    }

    logger.info(`Processing menu image: ${menuId}, aspect ratio: ${aspectRatio}`);

    // Verify menu exists
    const menuDoc = await db.collection('menus').doc(menuId).get();
    if (!menuDoc.exists) {
      throw new Error(`Menu not found: ${menuId}`);
    }

    // Import Sharp only when needed (lazy loading)
    const sharp = (await import("sharp")).default;

    // Convert base64 to buffer (remove data:image/...;base64, prefix if present)
    const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Validate file size (max 10MB)
    if (imageBuffer.length > 10 * 1024 * 1024) {
      throw new Error('File size too large (max 10MB)');
    }

    // Get image metadata
    const metadata = await sharp(imageBuffer).metadata();
    logger.info(`Original image: ${metadata.width}x${metadata.height}, format: ${metadata.format}`);

    // Define target dimensions based on aspect ratio
    const dimensions = aspectRatio === '1:1' 
      ? { small: { width: 100, height: 100 }, large: { width: 500, height: 500 } }
      : { small: { width: 178, height: 100 }, large: { width: 889, height: 500 } };

    // Generate file paths
    const smallPath = `images/menus/small/${menuId}.webp`;
    const largePath = `images/menus/large/${menuId}.webp`;

    const bucket = admin.storage().bucket();
    const results = {
      smallUrl: '',
      largeUrl: '',
      aspectRatio: aspectRatio
    };

    // Helper function to process image
    const processImageToSize = async (
      inputBuffer: Buffer, 
      targetWidth: number, 
      targetHeight: number
    ): Promise<Buffer> => {
      const image = sharp(inputBuffer);
      const metadata = await image.metadata();
      
      if (!metadata.width || !metadata.height) {
        throw new Error('Invalid image metadata');
      }

      // Calculate crop dimensions to maintain target aspect ratio
      const targetAspectRatio = targetWidth / targetHeight;
      const originalAspectRatio = metadata.width / metadata.height;
      
      let cropWidth = metadata.width;
      let cropHeight = metadata.height;
      
      if (originalAspectRatio > targetAspectRatio) {
        // Image is wider than target - crop width
        cropWidth = Math.round(metadata.height * targetAspectRatio);
      } else if (originalAspectRatio < targetAspectRatio) {
        // Image is taller than target - crop height
        cropHeight = Math.round(metadata.width / targetAspectRatio);
      }
      
      // Center the crop
      const left = Math.round((metadata.width - cropWidth) / 2);
      const top = Math.round((metadata.height - cropHeight) / 2);

      logger.info(`Processing image: ${metadata.width}x${metadata.height} → crop ${cropWidth}x${cropHeight} → resize ${targetWidth}x${targetHeight}`);

      return await image
        .extract({ left, top, width: cropWidth, height: cropHeight })
        .resize(targetWidth, targetHeight, {
          kernel: sharp.kernel.lanczos3,
          fit: 'fill'
        })
        .webp({ 
          quality: 85,
          effort: 6 
        })
        .toBuffer();
    };

    // Process and upload small image
    const smallBuffer = await processImageToSize(
      imageBuffer, 
      dimensions.small.width, 
      dimensions.small.height
    );
    
    const smallFile = bucket.file(smallPath);
    await smallFile.save(smallBuffer, {
      metadata: {
        contentType: 'image/webp',
        metadata: {
          menuId,
          aspectRatio,
          size: 'small',
          dimensions: `${dimensions.small.width}x${dimensions.small.height}`,
          uploadedAt: new Date().toISOString()
        }
      }
    });
    await smallFile.makePublic();
    results.smallUrl = `https://storage.googleapis.com/${bucket.name}/${smallPath}`;

    logger.info(`Small image uploaded: ${smallPath}`);

    // Process and upload large image
    const largeBuffer = await processImageToSize(
      imageBuffer, 
      dimensions.large.width, 
      dimensions.large.height
    );
    
    const largeFile = bucket.file(largePath);
    await largeFile.save(largeBuffer, {
      metadata: {
        contentType: 'image/webp',
        metadata: {
          menuId,
          aspectRatio,
          size: 'large',
          dimensions: `${dimensions.large.width}x${dimensions.large.height}`,
          uploadedAt: new Date().toISOString()
        }
      }
    });
    await largeFile.makePublic();
    results.largeUrl = `https://storage.googleapis.com/${bucket.name}/${largePath}`;

    logger.info(`Large image uploaded: ${largePath}`);

    // Update menu document with image URLs
    await db.collection('menus').doc(menuId).update({
      image: {
        smallUrl: results.smallUrl,
        largeUrl: results.largeUrl,
        aspectRatio: aspectRatio,
        uploadedAt: admin.firestore.FieldValue.serverTimestamp()
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    logger.info(`Menu document updated with image URLs: ${menuId}`);

    // Log compression stats
    const originalSize = imageBuffer.length;
    const totalProcessedSize = smallBuffer.length + largeBuffer.length;
    const compressionRatio = ((originalSize - totalProcessedSize) / originalSize * 100).toFixed(1);
    
    logger.info(`Image processing complete. Original: ${(originalSize/1024).toFixed(1)}KB, Processed: ${(totalProcessedSize/1024).toFixed(1)}KB, Compression: ${compressionRatio}%`);

    // Send success response
    res.status(200).json({
      success: true,
      message: 'Menu image processed and uploaded successfully',
      data: {
        menuId,
        smallUrl: results.smallUrl,
        largeUrl: results.largeUrl,
        aspectRatio: aspectRatio,
        compression: `${compressionRatio}% reduction`,
        originalSize: `${(originalSize/1024).toFixed(1)}KB`,
        processedSize: `${(totalProcessedSize/1024).toFixed(1)}KB`
      }
    });

  } catch (error: any) {
    logger.error(`Error processing menu image for ${menuId}:`, error);
    
    // Clean up any uploaded files on error
    if (menuId) {
      const bucket = admin.storage().bucket();
      await Promise.allSettled([
        bucket.file(`images/menus/small/${menuId}.webp`).delete().catch(() => {}),
        bucket.file(`images/menus/large/${menuId}.webp`).delete().catch(() => {})
      ]);
    }
    
    // Send error response
    res.status(500).json({
      success: false,
      message: error.message || 'Image processing failed',
      menuId: menuId || 'unknown'
    });
  }
});