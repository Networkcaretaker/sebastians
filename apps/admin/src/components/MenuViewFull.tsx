// apps/admin/src/components/MenuViewFull.tsx
import React, { useState } from 'react';
import { Menu } from '../types/menu.types';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import menuService from '../services/menuService';
import { getFunctions, httpsCallable } from 'firebase/functions';

interface MenuViewFullProps {
  menu: Menu;
  onMenuUpdated?: () => void; // Callback to refresh data after update
}

const MenuViewFull: React.FC<MenuViewFullProps> = ({ 
  menu, 
  onMenuUpdated 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isImageUploading, setIsImageUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<'1:1' | '16:9'>('1:1');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Form state for editing
  const [formData, setFormData] = useState({
    menu_name: menu.menu_name,
    menu_description: menu.menu_description || '',
    menu_type: menu.menu_type,
    isActive: menu.isActive
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSave = async () => {
    setError(null);
    
    // Validation
    if (!formData.menu_name.trim()) {
      setError('Menu name is required');
      return;
    }

    setIsLoading(true);
    
    try {
      if (!menu.id) {
        throw new Error('Menu ID is missing');
      }

      const updateData = {
        menu_name: formData.menu_name.trim(),
        menu_description: formData.menu_description.trim(),
        menu_type: formData.menu_type,
        isActive: formData.isActive,
        updatedAt: new Date()
      };

      const menuRef = doc(db, 'menus', menu.id);
      await updateDoc(menuRef, updateData);
      
      setIsEditing(false);
      
      // Call the callback to refresh parent data
      if (onMenuUpdated) {
        onMenuUpdated();
      }
      
    } catch (error) {
      console.error('Error updating menu:', error);
      setError(error instanceof Error ? error.message : 'Failed to update menu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      menu_name: menu.menu_name,
      menu_description: menu.menu_description || '',
      menu_type: menu.menu_type,
      isActive: menu.isActive
    });
    
    setError(null);
    setIsEditing(false);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setImageUploadError('Please select a valid image file');
        return;
      }
      
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setImageUploadError('Image size must be less than 10MB');
        return;
      }
      
      setSelectedImage(file);
      setImageUploadError(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImage || !menu.id) {
      setImageUploadError('Please select an image and ensure menu is saved');
      return;
    }
    
    setIsImageUploading(true);
    setImageUploadError(null);
    
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const base64Data = e.target?.result as string;
          
          console.log('Calling processMenuImage function via HTTP...');
          
          // Make HTTP POST request to the function
          const response = await fetch('https://us-central1-sebastian-cafe.cloudfunctions.net/processMenuImage', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              menuId: menu.id,
              imageData: base64Data,
              aspectRatio: selectedAspectRatio
            })
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const result = await response.json();
          console.log('Image upload result:', result);
          
          // Handle the result
          if (result && result.success) {
            console.log('Image uploaded successfully:', result);
            
            // Clear form
            setSelectedImage(null);
            setImagePreview(null);
            setIsImageUploading(false);
            setImageUploadError(null);
            
            // Refresh menu data
            if (onMenuUpdated) {
              onMenuUpdated();
            }
          } else {
            throw new Error(result?.message || 'Function returned failure');
          }
          
        } catch (error) {
          console.error('Error uploading image:', error);
          setImageUploadError(error instanceof Error ? error.message : 'Failed to upload image');
          setIsImageUploading(false);
        }
      };
      
      reader.onerror = () => {
        setImageUploadError('Failed to read image file');
        setIsImageUploading(false);
      };
      
      reader.readAsDataURL(selectedImage);
      
    } catch (error) {
      console.error('Error processing image:', error);
      setImageUploadError('Failed to process image file');
      setIsImageUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setImageUploadError(null);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  if (!isEditing) {
    // Display mode (original view)
    return (
      <>
        {/* Menu Details Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex gap-2 justify-between items-center">
            <h2 className="text-2xl font-semibold mb-4">Menu Information</h2>
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Edit Menu
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Menu Name:</label>
              <p className="text-lg mt-1">{menu.menu_name}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Description:</label>
              <p className="mt-1">{menu.menu_description || 'None'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Menu Type:</label>
              <p className="mt-1 capitalize">{menu.menu_type}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Status:</label>
              <div className={`inline-block px-2 py-1 rounded text-xs ${
                menu.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {menu.isActive ? 'Active' : 'Inactive'}
              </div>
            </div>
            
            {/* Categories Count */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Total Categories:</label>
              <p className="mt-1">
                {menu.categories && menu.categories.length > 0 
                  ? `${menu.categories.length} ${menu.categories.length === 1 ? 'category' : 'categories'}`
                  : 'No categories assigned'
                }
              </p>
            </div>

            {/* Timestamps */}
            {menu.createdAt && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Created:</label>
                <p className="mt-1 text-sm text-gray-600">
                  {menu.createdAt.toLocaleDateString()} at {menu.createdAt.toLocaleTimeString()}
                </p>
              </div>
            )}

            {menu.updatedAt && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Updated:</label>
                <p className="mt-1 text-sm text-gray-600">
                  {menu.updatedAt.toLocaleDateString()} at {menu.updatedAt.toLocaleTimeString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  // Edit mode
  return (
    <>
      {/* Menu Details Section - Edit Mode */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Action buttons at top */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Edit Menu</h2>
            <div className="flex space-x-2">
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>

          {/* Menu Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Menu Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="menu_name"
              value={formData.menu_name}
              onChange={handleInputChange}
              className="w-full p-2 border rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="menu_description"
              value={formData.menu_description}
              onChange={handleInputChange}
              rows={3}
              className="w-full p-2 border rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Optional description for this menu"
            />
          </div>

          {/* Menu Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Menu Type</label>
            <select
              name="menu_type"
              value={formData.menu_type}
              onChange={handleInputChange}
              className="w-full p-2 border rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="web">Web Menu (Digital Display)</option>
              <option value="printable">Printable Menu (A4 Format)</option>
            </select>
            <p className="text-sm text-gray-600 mt-1">
              {formData.menu_type === 'web' 
                ? 'Optimized for digital viewing and QR code access'
                : 'Formatted for printing on standard A4 paper'
              }
            </p>
          </div>

{/* Menu Image Section */}
<div className="bg-white rounded-lg shadow-md p-6 mb-8">
  <h2 className="text-2xl font-semibold mb-4">Menu Image</h2>
  
  {/* Current Image Display */}
  {menu.image && (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-3">Current Image</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Small Image */}
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">Small (for thumbnails)</p>
          <img 
            src={menu.image.smallUrl} 
            alt="Menu small" 
            className="mx-auto border rounded shadow-sm"
            style={{ 
              width: menu.image.aspectRatio === '1:1' ? '100px' : '178px',
              height: '100px',
              objectFit: 'cover'
            }}
          />
          <p className="text-xs text-gray-500 mt-1">
            {menu.image.aspectRatio === '1:1' ? '100x100px' : '178x100px'}
          </p>
        </div>
        
        {/* Large Image */}
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">Large (for display)</p>
          <img 
            src={menu.image.largeUrl} 
            alt="Menu large" 
            className="mx-auto border rounded shadow-sm max-w-full"
            style={{ 
              width: menu.image.aspectRatio === '1:1' ? '200px' : '356px',
              height: '200px',
              objectFit: 'cover'
            }}
          />
          <p className="text-xs text-gray-500 mt-1">
            {menu.image.aspectRatio === '1:1' ? '500x500px' : '889x500px'}
          </p>
        </div>
      </div>
      
      <div className="mt-3 text-sm text-gray-600">
        <p><strong>Aspect Ratio:</strong> {menu.image.aspectRatio}</p>
        <p><strong>Uploaded:</strong> {
          menu.image.uploadedAt 
            ? menu.image.uploadedAt instanceof Date 
              ? menu.image.uploadedAt.toLocaleDateString()
              : new Date(menu.image.uploadedAt.seconds * 1000).toLocaleDateString()
            : 'Unknown'
        }</p>
      </div>
    </div>
  )}
  
  {/* Upload New Image Section */}
  <div className="border-t pt-6">
    <h3 className="text-lg font-medium mb-4">
      {menu.image ? 'Replace Image' : 'Upload Image'}
    </h3>
    
    {imageUploadError && (
      <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
        {imageUploadError}
      </div>
    )}
    
    {/* Aspect Ratio Selection */}
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Image Aspect Ratio:
      </label>
      <div className="flex space-x-4">
        <label className="flex items-center">
          <input
            type="radio"
            name="aspectRatio"
            value="1:1"
            checked={selectedAspectRatio === '1:1'}
            onChange={(e) => setSelectedAspectRatio(e.target.value as '1:1' | '16:9')}
            className="mr-2"
          />
          <span className="text-sm">1:1 (Square)</span>
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            name="aspectRatio"
            value="16:9"
            checked={selectedAspectRatio === '16:9'}
            onChange={(e) => setSelectedAspectRatio(e.target.value as '1:1' | '16:9')}
            className="mr-2"
          />
          <span className="text-sm">16:9 (Landscape)</span>
        </label>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        {selectedAspectRatio === '1:1' 
          ? 'Creates: 100x100px (small) and 500x500px (large)'
          : 'Creates: 178x100px (small) and 889x500px (large)'
        }
      </p>
    </div>
    
    {/* File Input */}
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Choose Image File:
      </label>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        disabled={isImageUploading}
      />
      <p className="text-xs text-gray-500 mt-1">
        Accepted formats: JPG, PNG, WebP, GIF. Max size: 10MB
      </p>
    </div>
    
    {/* Image Preview */}
    {imagePreview && (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Preview:
        </label>
        <div className="relative inline-block">
          <img 
            src={imagePreview} 
            alt="Preview" 
            className="max-w-xs max-h-48 border rounded shadow-sm"
          />
          <button
            onClick={handleRemoveImage}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
            disabled={isImageUploading}
          >
            ✕
          </button>
        </div>
      </div>
    )}
    
    {/* Upload Button */}
    <div className="flex space-x-3">
      <button
        onClick={handleImageUpload}
        disabled={!selectedImage || isImageUploading}
        className={`px-4 py-2 rounded font-medium ${
          !selectedImage || isImageUploading
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-green-500 text-white hover:bg-green-600'
        }`}
      >
        {isImageUploading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          `Upload ${selectedAspectRatio} Image`
        )}
      </button>
      
      {selectedImage && (
        <button
          onClick={handleRemoveImage}
          disabled={isImageUploading}
          className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
      )}
    </div>
    
    {/* Info Panel */}
    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
      <h4 className="text-sm font-medium text-blue-800 mb-2">Image Processing Info:</h4>
      <ul className="text-sm text-blue-700 space-y-1">
        <li>• Images are automatically cropped to exact aspect ratios</li>
        <li>• Converted to WebP format for optimal performance</li>
        <li>• Two sizes generated: small (thumbnails) and large (display)</li>
        <li>• Files saved to Firebase Storage with public URLs</li>
        <li>• Maximum compression while maintaining quality</li>
      </ul>
    </div>
  </div>
</div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Active Status</label>
            <label className="flex items-center space-x-2">
              <div className="relative">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <div className={`w-12 h-8 py-1 rounded-full cursor-pointer transition-colors ${
                  formData.isActive ? 'bg-blue-500' : 'bg-gray-300'
                }`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform mt-1 ${
                    formData.isActive ? 'translate-x-7' : 'translate-x-1'
                  }`}></div>
                </div>
              </div>
              <span className="text-sm text-gray-600">
                {formData.isActive ? 'Menu is active and can be published' : 'Menu is inactive'}
              </span>
            </label>
          </div>

          {/* Read-only info */}
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Total Categories:</label>
                <p className="mt-1 text-gray-600">
                  {menu.categories && menu.categories.length > 0 
                    ? `${menu.categories.length} ${menu.categories.length === 1 ? 'category' : 'categories'}`
                    : 'No categories assigned'
                  }
                </p>
              </div>

              {menu.createdAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Created:</label>
                  <p className="mt-1 text-sm text-gray-600">
                    {menu.createdAt.toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MenuViewFull;