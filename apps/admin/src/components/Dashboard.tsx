// src/components/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

// apps/admin/src/components/Dashboard.tsx
import { Link } from 'react-router-dom';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { MenuItem, MenuCategory, Menu } from '../types/menu.types';
import { getMenusWithPublishStatus } from '../services/websiteService';
import { MenuWithPublishStatus } from '@sebastians/shared-types';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalItems: 0,
    activeItems: 0,
    totalCategories: 0,
    totalMenus: 0,
    publishedMenus: 0,
    menusNeedingUpdate: 0
  });
  const [recentItems, setRecentItems] = useState<MenuItem[]>([]);
  const [recentCategories, setRecentCategories] = useState<MenuCategory[]>([]);
  const [menusWithStatus, setMenusWithStatus] = useState<MenuWithPublishStatus[]>([]);

  useEffect(() => {
    if (currentUser) {
      loadDashboardData();
    }
  }, [currentUser]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load menu items
      const itemsSnapshot = await getDocs(collection(db, 'menu_items'));
      const items = itemsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MenuItem[];

      // Load categories
      const categoriesSnapshot = await getDocs(collection(db, 'categories'));
      const categories = categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MenuCategory[];

      // Load menus with publish status
      const menus = await getMenusWithPublishStatus();

      // Load recent items (last 5)
      const recentItemsQuery = query(
        collection(db, 'menu_items'),
        orderBy('updatedAt', 'desc'),
        limit(5)
      );
      const recentItemsSnapshot = await getDocs(recentItemsQuery);
      const recentItemsData = recentItemsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MenuItem[];

      // Load recent categories (last 3)
      const recentCategoriesQuery = query(
        collection(db, 'categories'),
        orderBy('updatedAt', 'desc'),
        limit(3)
      );
      const recentCategoriesSnapshot = await getDocs(recentCategoriesQuery);
      const recentCategoriesData = recentCategoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MenuCategory[];

      // Calculate stats
      const activeItems = items.filter(item => item.flags?.active).length;
      const publishedMenus = menus.filter(menu => menu.publishStatus === 'published').length;
      const menusNeedingUpdate = menus.filter(menu => 
        menu.publishStatus === 'published' && 
        menu.updatedAt && 
        menu.lastPublished && 
        menu.updatedAt > menu.lastPublished
      ).length;

      setStats({
        totalItems: items.length,
        activeItems,
        totalCategories: categories.length,
        totalMenus: menus.length,
        publishedMenus,
        menusNeedingUpdate
      });

      setRecentItems(recentItemsData);
      setRecentCategories(recentCategoriesData);
      setMenusWithStatus(menus);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Restaurant Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back! Here's an overview of your restaurant management system.
        </p>
      </div>

      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Menu Items */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <div className="w-6 h-6 bg-blue-500 rounded"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalItems}</p>
              <p className="text-sm text-green-600">{stats.activeItems} active</p>
            </div>
          </div>
        </div>

        {/* Total Categories */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <div className="w-6 h-6 bg-purple-500 rounded"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalCategories}</p>
              <p className="text-sm text-gray-500">organized</p>
            </div>
          </div>
        </div>

        {/* Published Menus */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <div className="w-6 h-6 bg-green-500 rounded"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Published Menus</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.publishedMenus}</p>
              <p className="text-sm text-gray-500">of {stats.totalMenus} total</p>
            </div>
          </div>
        </div>

        {/* Updates Needed */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <div className="w-6 h-6 bg-orange-500 rounded"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Need Updates</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.menusNeedingUpdate}</p>
              <p className="text-sm text-orange-600">menus changed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/menu-items?action=create"
            className="flex items-center justify-center px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <span className="font-medium">+ Add New Item</span>
          </Link>
          <Link
            to="/categories?action=create"
            className="flex items-center justify-center px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            <span className="font-medium">+ Add Category</span>
          </Link>
          <Link
            to="/website"
            className="flex items-center justify-center px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <span className="font-medium">Manage Publishing</span>
          </Link>
          <button className="flex items-center justify-center px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
            <span className="font-medium">Export Data</span>
          </button>
        </div>
      </div>

      {/* Content Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Items */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Items</h2>
            <Link to="/menu-items" className="text-blue-600 hover:text-blue-800 text-sm">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {recentItems.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{item.item_name}</p>
                  <p className="text-sm text-gray-600">€{item.price?.toFixed(2)}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  item.flags?.active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {item.flags?.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))}
            {recentItems.length === 0 && (
              <p className="text-gray-500 text-center py-4">No recent items</p>
            )}
          </div>
        </div>

        {/* Recent Categories */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Categories</h2>
            <Link to="/categories" className="text-blue-600 hover:text-blue-800 text-sm">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {recentCategories.map(category => (
              <div key={category.id} className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">{category.cat_name}</p>
                <p className="text-sm text-gray-600">
                  {category.items?.length || 0} items
                </p>
              </div>
            ))}
            {recentCategories.length === 0 && (
              <p className="text-gray-500 text-center py-4">No recent categories</p>
            )}
          </div>
        </div>
      </div>

      {/* Publishing Status */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Menu Publishing Status</h2>
        <div className="space-y-3">
          {menusWithStatus.map(menu => (
            <div key={menu.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{menu.menu_name}</p>
                <p className="text-sm text-gray-600">{menu.menu_description}</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 text-sm rounded-full ${
                  menu.publishStatus === 'published' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {menu.publishStatus === 'published' ? 'Published' : 'Draft'}
                </span>
                {menu.publishStatus === 'published' && 
                 menu.updatedAt && 
                 menu.lastPublished && 
                 menu.updatedAt > menu.lastPublished && (
                  <span className="px-3 py-1 text-sm bg-orange-100 text-orange-800 rounded-full">
                    Update Available
                  </span>
                )}
              </div>
            </div>
          ))}
          {menusWithStatus.length === 0 && (
            <p className="text-gray-500 text-center py-4">No menus created yet</p>
          )}
        </div>
      </div>

      {/* Content Health Check - PLACEHOLDER SECTION */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Content Health Check</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-medium text-yellow-800">Items Missing Images</h3>
            <p className="text-2xl font-bold text-yellow-900">--</p>
            <p className="text-sm text-yellow-600">Placeholder for future feature</p>
          </div>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-800">SEO Optimization</h3>
            <p className="text-2xl font-bold text-blue-900">--%</p>
            <p className="text-sm text-blue-600">Placeholder for SEO scoring</p>
          </div>
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h3 className="font-medium text-purple-800">Translation Ready</h3>
            <p className="text-2xl font-bold text-purple-900">--%</p>
            <p className="text-sm text-purple-600">Placeholder for translations</p>
          </div>
        </div>
      </div>

      {/* Analytics Placeholder */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Analytics Overview</h2>
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Coming Soon</h3>
          <p className="text-gray-600 mb-4">
            Track menu performance, popular items, and customer engagement.
          </p>
          <button className="px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed">
            Enable Analytics (Placeholder)
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;