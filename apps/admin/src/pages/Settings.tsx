import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'account' | 'usage'>('general');

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your application settings
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('general')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'general'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            General Settings
          </button>
          <button
            onClick={() => setActiveTab('account')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'account'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Account Settings
          </button>
          <button
            onClick={() => setActiveTab('usage')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'usage'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Account Usage
          </button>
        </nav>
      </div>

      {/* General Settings Tab */}
      {activeTab === 'general' && (
        <div className="bg-white shadow-sm rounded-lg border p-6">
          <h3 className="text-2xl font-semibold text-gray-900 pb-6 border-b">General Settings</h3>
          <div className="py-4 border-b">
            <p className="text-lg font-semibold text-gray-900 pb-2">Import/Export Data</p>
            <Link 
              to={`/test-import`}
              className="px-3 py-1 m-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
            >
              Import
            </Link>
            <Link 
              to={`/test-export`}
              className="px-3 py-1 m-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
            >
              Export
            </Link>
          </div>
        </div>
      )}

      {/* Account Settings Tab */}
      {activeTab === 'account' && (
        <div className="bg-white shadow-sm rounded-lg border p-6">
          <h3 className="text-2xl font-semibold text-gray-900 pb-6 border-b">Account Settings</h3>
          <div className="py-4 border-b"></div>
        </div>   
      )}

      {/* Account Settings Tab */}
      {activeTab === 'usage' && (
        <div className="bg-white shadow-sm rounded-lg border p-6">
          <h3 className="text-2xl font-semibold text-gray-900 pb-6 border-b">Account Usage</h3>
          <div className="py-4 border-b">
             <p className="text-lg font-semibold text-gray-900 pb-2">Google Translate API</p>
             <p>Characters: <span className="text-gray-500 italic">Max 500,000 per month</span></p>
             <p>Requests: <span className="text-gray-500 italic">Max ? per day</span></p>
          </div>
          <div className="py-4 border-b">
             <p className="text-lg font-semibold text-gray-900 pb-2">Google Gemini API</p>
             <p>Tokens: <span className="text-gray-500 italic">Max 1,000,000 per month</span></p>
          </div>
          <div className="py-4 border-b">
             <p className="text-lg font-semibold text-gray-900 pb-2">Firestore Database</p>
             <p>Usage: <span className="text-gray-500 italic">Max ? GB</span></p>
          </div>
          <div className="py-4 border-b">
             <p className="text-lg font-semibold text-gray-900 pb-2">Firebase Storage</p>
             <p>Usage: <span className="text-gray-500 italic">Max ? GB</span></p>
          </div>      
        </div>   
      )}

    </div>
  );
};

export default Settings;