import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  getWebsiteConfig, 
  getMenusWithPublishStatus, 
  publishMenu, 
  unpublishMenu,
  initializeWebsiteConfig 
} from '../services/websiteService';
import { WebsiteConfig, MenuWithPublishStatus } from '@sebastians/shared-types';

const Website: React.FC = () => {
  const [websiteConfig, setWebsiteConfig] = useState<WebsiteConfig | null>(null);
  const [menus, setMenus] = useState<MenuWithPublishStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [publishingMenus, setPublishingMenus] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'menus' | 'settings'>('menus');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Initialize config if it doesn't exist
      let config = await getWebsiteConfig();
      if (!config || !config.id) {
        config = await initializeWebsiteConfig();
      }
      
      const menusData = await getMenusWithPublishStatus();
      
      setWebsiteConfig(config);
      setMenus(menusData);
    } catch (err) {
      console.error('Error loading website data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load website data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMenu = async (menuId: string) => {
    if (publishingMenus.has(menuId)) return;

    try {
      setPublishingMenus(prev => new Set(prev).add(menuId));
      
      // Update uses the same publish logic - just re-exports the menu
      const result = await publishMenu(menuId);
      
      if (result.success) {
        // Reload data to get updated status
        await loadData();
        alert(`Menu updated successfully! URL: ${result.url}`);
      } else {
        alert(`Failed to update menu: ${result.error}`);
      }
    } catch (error) {
      console.error('Error updating menu:', error);
      alert('Error updating menu. Please try again.');
    } finally {
      setPublishingMenus(prev => {
        const newSet = new Set(prev);
        newSet.delete(menuId);
        return newSet;
      });
    }
  };

  const handlePublishMenu = async (menuId: string) => {
    if (publishingMenus.has(menuId)) return;

    try {
      setPublishingMenus(prev => new Set(prev).add(menuId));
      
      const result = await publishMenu(menuId);
      
      if (result.success) {
        // Reload data to get updated status
        await loadData();
        alert(`Menu published successfully! URL: ${result.url}`);
      } else {
        alert(`Failed to publish menu: ${result.error}`);
      }
    } catch (error) {
      console.error('Error publishing menu:', error);
      alert('Error publishing menu. Please try again.');
    } finally {
      setPublishingMenus(prev => {
        const newSet = new Set(prev);
        newSet.delete(menuId);
        return newSet;
      });
    }
  };

  const handleUnpublishMenu = async (menuId: string) => {
    if (publishingMenus.has(menuId)) return;

    try {
      setPublishingMenus(prev => new Set(prev).add(menuId));
      
      const result = await unpublishMenu(menuId);
      
      if (result.success) {
        // Reload data to get updated status
        await loadData();
        alert('Menu unpublished successfully!');
      } else {
        alert(`Failed to unpublish menu: ${result.error}`);
      }
    } catch (error) {
      console.error('Error unpublishing menu:', error);
      alert('Error unpublishing menu. Please try again.');
    } finally {
      setPublishingMenus(prev => {
        const newSet = new Set(prev);
        newSet.delete(menuId);
        return newSet;
      });
    }
  };

  const getStatusBadge = (status: string, isActive: boolean) => {
    if (!isActive) {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
          Inactive
        </span>
      );
    }

    switch (status) {
      case 'published':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
            Published
          </span>
        );
      case 'unpublished':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
            Unpublished
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
            Draft
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
        <button 
          onClick={loadData}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Website Management</h1>
        <p className="text-gray-600 mt-2">
          Manage your restaurant's website, published menus, and settings
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('menus')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'menus'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Menu Publishing
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'settings'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Website Settings
          </button>
        </nav>
      </div>

      {/* Menu Publishing Tab */}
      {activeTab === 'menus' && (
        <div>
          {/* Published Menus Summary */}
          {websiteConfig && websiteConfig.publishedMenus.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Currently Published Menus
              </h3>
              <div className="space-y-2">
                {websiteConfig.publishedMenus.map((menu) => (
                  <div key={menu.menuId} className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-green-700">{menu.name}</span>
                      <span className="text-green-600 text-sm ml-2">
                        (Published: {menu.publishedAt.toLocaleDateString()})
                      </span>
                    </div>
                    {menu.publishedUrl && (
                      <a
                        href={menu.publishedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View JSON →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Menus Table */}
          <div className="bg-white shadow-sm rounded-lg border">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">All Menus</h2>
                <Link
                  to="/menus"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Manage Menus
                </Link>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Menu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Publication Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Published
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {menus.map((menu) => (
                    <tr key={menu.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {menu.menu_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {menu.menu_description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          menu.menu_type === 'web' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {menu.menu_type === 'web' ? 'Web Menu' : 'Printable'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(menu.publishStatus || 'draft', menu.isActive)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {menu.publishStatus === 'published' ? (
                          <span className="text-green-600 text-sm">
                            ✅ Live
                          </span>
                        ) : (
                          <span className="text-gray-500 text-sm">
                            Not published
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {menu.publishedAt ? (
                          menu.publishedAt.toLocaleDateString()
                        ) : (
                          'Never'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {menu.publishedUrl && (
                            <a
                              href={menu.publishedUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Preview
                            </a>
                          )}
                          
                          {menu.isActive && menu.publishStatus !== 'published' && (
                            <button
                              onClick={() => handlePublishMenu(menu.id!)}
                              disabled={publishingMenus.has(menu.id!)}
                              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                            >
                              {publishingMenus.has(menu.id!) ? 'Publishing...' : 'Publish'}
                            </button>
                          )}

                          {/* NEW: Update button - shows when menu is published but content is newer */}
                          {menu.publishStatus === 'published' && 
                          menu.updatedAt && 
                          menu.lastPublished && 
                          menu.updatedAt > menu.lastPublished && (
                            <button
                              onClick={() => handleUpdateMenu(menu.id!)}
                              disabled={publishingMenus.has(menu.id!)}
                              className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
                            >
                              {publishingMenus.has(menu.id!) ? 'Updating...' : 'Update'}
                            </button>
                          )}

                          {/* MODIFIED: Unpublish button - only shows when published AND no updates needed */}
                          {menu.publishStatus === 'published' && 
                          (!menu.updatedAt || !menu.lastPublished || menu.updatedAt <= menu.lastPublished) && (
                            <button
                              onClick={() => handleUnpublishMenu(menu.id!)}
                              disabled={publishingMenus.has(menu.id!)}
                              className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
                            >
                              {publishingMenus.has(menu.id!) ? 'Unpublishing...' : 'Unpublish'}
                            </button>
                          )}
                          
                          <Link
                            to={`/menus/${menu.id}`}
                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {menus.length === 0 && (
              <div className="py-6 text-center text-gray-500">
                No menus found. 
                <Link to="/menus" className="text-blue-600 hover:text-blue-800 ml-1">
                  Create your first menu
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Website Settings Tab */}
      {activeTab === 'settings' && (
        <div>
          {websiteConfig && (
            <div className="space-y-6">
              {/* Restaurant Information */}
              <div className="bg-white shadow-sm rounded-lg border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Restaurant Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Restaurant Name
                    </label>
                    <p className="text-gray-900">{websiteConfig.restaurant.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <p className="text-gray-900">{websiteConfig.restaurant.contactInfo.email || 'Not set'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <p className="text-gray-900">{websiteConfig.restaurant.description || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <p className="text-gray-900">{websiteConfig.restaurant.contactInfo.phone || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    <p className="text-gray-900">{websiteConfig.restaurant.contactInfo.website || 'Not set'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <p className="text-gray-900">{websiteConfig.restaurant.contactInfo.address || 'Not set'}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                    Edit Restaurant Info
                  </button>
                </div>
              </div>

              {/* Theme Settings */}
              <div className="bg-white shadow-sm rounded-lg border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Theme Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Primary Color
                    </label>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-6 h-6 rounded border border-gray-300"
                        style={{ backgroundColor: websiteConfig.theme.primaryColor }}
                      ></div>
                      <span className="text-gray-900">{websiteConfig.theme.primaryColor}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Secondary Color
                    </label>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-6 h-6 rounded border border-gray-300"
                        style={{ backgroundColor: websiteConfig.theme.secondaryColor }}
                      ></div>
                      <span className="text-gray-900">{websiteConfig.theme.secondaryColor}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Background Color
                    </label>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-6 h-6 rounded border border-gray-300"
                        style={{ backgroundColor: websiteConfig.theme.backgroundColor }}
                      ></div>
                      <span className="text-gray-900">{websiteConfig.theme.backgroundColor}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Font Family
                    </label>
                    <p className="text-gray-900">{websiteConfig.theme.fontFamily}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                    Edit Theme
                  </button>
                </div>
              </div>

              {/* SEO Settings */}
              <div className="bg-white shadow-sm rounded-lg border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  SEO Settings
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meta Title
                    </label>
                    <p className="text-gray-900">{websiteConfig.seo.metaTitle}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meta Description
                    </label>
                    <p className="text-gray-900">{websiteConfig.seo.metaDescription}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Keywords
                    </label>
                    <p className="text-gray-900">{websiteConfig.seo.keywords.join(', ')}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                    Edit SEO Settings
                  </button>
                </div>
              </div>

              {/* Website Statistics */}
              <div className="bg-white shadow-sm rounded-lg border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Website Statistics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {websiteConfig.publishedMenus.length}
                    </div>
                    <div className="text-sm text-gray-600">Published Menus</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {websiteConfig.publishedMenus.filter(m => m.isActive).length}
                    </div>
                    <div className="text-sm text-gray-600">Active Menus</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {websiteConfig.lastUpdated.toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-600">Last Updated</div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <button className="flex items-center justify-center px-4 py-3 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors">
                    <span className="text-blue-700 font-medium">Generate QR Code</span>
                  </button>
                  <button className="flex items-center justify-center px-4 py-3 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors">
                    <span className="text-blue-700 font-medium">Export All Menus</span>
                  </button>
                  <button 
                    onClick={loadData}
                    className="flex items-center justify-center px-4 py-3 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <span className="text-blue-700 font-medium">Refresh Data</span>
                  </button>
                  <Link
                    to="/menus"
                    className="flex items-center justify-center px-4 py-3 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <span className="text-blue-700 font-medium">Manage Menus</span>
                  </Link>
                </div>
              </div>

              {/* Helpful Information */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  How Website Publishing Works
                </h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium">1</span>
                    <p>Create and organize your menus using the admin interface</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium">2</span>
                    <p>Click "Publish" on any active menu to generate a public JSON file</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium">3</span>
                    <p>The menu app automatically loads these JSON files for fast performance</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium">4</span>
                    <p>Customers access your menus instantly via QR codes or direct links</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Website;