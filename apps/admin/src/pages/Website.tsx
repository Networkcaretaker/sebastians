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
import DevMessage from '../components/common/devMessage';

// Updated types for the new tab structure
type TabType = 'web' | 'printable' | 'settings';

const Website: React.FC = () => {
  const [websiteConfig, setWebsiteConfig] = useState<WebsiteConfig | null>(null);
  const [menus, setMenus] = useState<MenuWithPublishStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [publishingMenus, setPublishingMenus] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<TabType>('printable');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

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
      const result = await publishMenu(menuId);
      if (result.success) {
        await loadData();
        alert(`Menu updated successfully!`);
      } else {
        alert(`Failed to update menu: ${result.error}`);
      }
    } catch (error) {
      console.error('Error updating menu:', error);
      alert('Error updating menu.');
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
        await loadData();
        alert(`Menu published successfully!`);
      } else {
        alert(`Failed to publish menu: ${result.error}`);
      }
    } catch (error) {
      console.error('Error publishing menu:', error);
      alert('Error publishing menu.');
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
        await loadData();
        alert('Menu unpublished successfully!');
      } else {
        alert(`Failed to unpublish menu: ${result.error}`);
      }
    } catch (error) {
      console.error('Error unpublishing menu:', error);
      alert('Error unpublishing menu.');
    } finally {
      setPublishingMenus(prev => {
        const newSet = new Set(prev);
        newSet.delete(menuId);
        return newSet;
      });
    }
  };

  const getStatusBadge = (status: string, isActive: boolean) => {
    if (!isActive) return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">Inactive</span>;
    switch (status) {
      case 'published': return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Published</span>;
      case 'unpublished': return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Unpublished</span>;
      default: return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">Draft</span>;
    }
  };

  // Logic to filter menus based on the active tab
  const filteredMenus = menus.filter(menu => {
    if (activeTab === 'web') return menu.menu_type === 'web';
    if (activeTab === 'printable') return menu.menu_type === 'printable';
    return false;
  });

  if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;

  if (error) return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6"><p className="font-bold">Error</p><p>{error}</p></div>
      <button onClick={loadData} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Retry</button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Menu Publishing</h1>
        <p className="text-gray-600 mt-2">Manage your restaurant's website and physical menus.</p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('printable')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'printable' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Printable Menus
          </button>
          <button
            onClick={() => setActiveTab('web')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'web' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Website Publishing
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'settings' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Website Settings
          </button>
        </nav>
      </div>

      {/* Menu Tables (Shared for 'web' and 'printable' tabs) */}
      {(activeTab === 'web' || activeTab === 'printable') && (
        <div>
          <div className="bg-white shadow-sm rounded-lg border">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Menu</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Publication Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Published</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMenus.map((menu) => (
                    <tr key={menu.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{menu.menu_name}</div>
                        <div className="text-sm text-gray-500">{menu.menu_description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${menu.menu_type === 'web' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                          {menu.menu_type === 'web' ? 'Web Menu' : 'Printable'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(menu.publishStatus || 'draft', menu.isActive)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {menu.publishStatus === 'published' ? <span className="text-green-600 text-sm">✅ Live</span> : <span className="text-gray-500 text-sm">Not published</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {menu.publishedAt ? menu.publishedAt.toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {menu.publishedUrl && (
                            <a href={menu.publishedUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">Preview</a>
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
                          {menu.publishStatus === 'published' && menu.updatedAt && menu.lastPublished && menu.updatedAt > menu.lastPublished && (
                            <button
                              onClick={() => handleUpdateMenu(menu.id!)}
                              disabled={publishingMenus.has(menu.id!)}
                              className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
                            >
                              {publishingMenus.has(menu.id!) ? 'Updating...' : 'Update'}
                            </button>
                          )}
                          {menu.publishStatus === 'published' && (!menu.updatedAt || !menu.lastPublished || menu.updatedAt <= menu.lastPublished) && (
                            <button
                              onClick={() => handleUnpublishMenu(menu.id!)}
                              disabled={publishingMenus.has(menu.id!)}
                              className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
                            >
                              {publishingMenus.has(menu.id!) ? 'Unpublishing...' : 'Unpublish'}
                            </button>
                          )}
                          <Link to={`/menus/${menu.id}`} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">Edit</Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredMenus.length === 0 && (
              <div className="py-6 text-center text-gray-500">
                No {activeTab} menus found. 
                <Link to="/menus" className="text-blue-600 hover:text-blue-800 ml-1">Create one</Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Website Settings Tab */}
      {activeTab === 'settings' && websiteConfig && (
        <div className="space-y-6">
           <DevMessage />
           {/* ... Keep the existing Restaurant Information, Theme, SEO, etc. sections here ... */}
           <div className="bg-white shadow-sm rounded-lg border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Restaurant Information</h3>
              <p className="text-gray-900">{websiteConfig.restaurant.name}</p>
              {/* Rest of settings content... */}
           </div>
        </div>
      )}
    </div>
  );
};

export default Website;