// functions/src/image.ts

import {onCall} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
// Remove the global import - we'll import Sharp only when needed

// Get Firestore instance
const db = admin.firestore();

/**
 * Process and upload menu image
 * Takes base64 image data, processes it into small/large sizes, and updates menu document
 */
export const processMenuImage = onCall(async (request) => {
  let menuId: string = '';
  
  try {
    // Safely destructure the request data
    const data = request.data || {};
    menuId = data.menuId;
    const imageData = data.imageData; // base64 encoded image
    const aspectRatio = data.aspectRatio; // '1:1' or '16:9'
    
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

    // Verify menu exists and user has permission
    const menuDoc = await db.collection('menus').doc(menuId).get();
    if (!menuDoc.exists) {
      throw new Error(`Menu not found: ${menuId}`);
    }

    // Convert base64 to buffer (remove data:image/...;base64, prefix if present)
    const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Validate file size (max 10MB)
    if (imageBuffer.length > 10 * 1024 * 1024) {
      throw new Error('File size too large (max 10MB)');
    }

    // Import Sharp only when needed (lazy loading)
    const sharp = (await import("sharp")).default;
    // Get image metadata
    const metadata = await sharp(imageBuffer).metadata();

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

    // Process and upload small image
    const smallBuffer = await processImageToSize(
      imageBuffer, 
      dimensions.small.width, 
      dimensions.small.height, 
      aspectRatio
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
      dimensions.large.height, 
      aspectRatio
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

    return {
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
    };

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
    
    return {
      success: false,
      message: error.message || 'Image processing failed',
      menuId: menuId || 'unknown'
    };
  }
});

/**
 * Helper function to process image to specific size with proper cropping
 */
async function processImageToSize(
  inputBuffer: Buffer, 
  targetWidth: number, 
  targetHeight: number,
  aspectRatio: '1:1' | '16:9'
): Promise<Buffer> {
  
  // Import Sharp only when needed (lazy loading)
  const sharp = (await import("sharp")).default;
  
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

  logger.info(`Processing ${aspectRatio} image: ${metadata.width}x${metadata.height} → crop ${cropWidth}x${cropHeight} → resize ${targetWidth}x${targetHeight}`);

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
}