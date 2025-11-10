import React, { useState } from 'react';
import { Globe, Check, Plus, Edit, Trash2, Download, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

export default function LanguageSettings() {
  const { t, i18n } = useTranslation();
  const [activeLanguage, setActiveLanguage] = useState(i18n.language);

  const supportedLanguages = [
    {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      flag: '🇺🇸',
      status: 'active',
      completion: 100,
      isDefault: true
    },
    {
      code: 'bn',
      name: 'Bengali',
      nativeName: 'বাংলা',
      flag: '🇧🇩',
      status: 'active',
      completion: 85,
      isDefault: false
    },
    {
      code: 'hi',
      name: 'Hindi',
      nativeName: 'हिन्दी',
      flag: '🇮🇳',
      status: 'draft',
      completion: 60,
      isDefault: false
    }
  ];

  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    setActiveLanguage(langCode);
    localStorage.setItem('language', langCode);
    toast.success(`Language changed to ${supportedLanguages.find(l => l.code === langCode)?.name}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCompletionColor = (completion) => {
    if (completion >= 90) return 'bg-green-500';
    if (completion >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Language Settings</h2>
          <p className="text-gray-600 mt-1">Manage multi-language support for your store</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Download size={18} />
            Export Translations
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus size={18} />
            Add Language
          </button>
        </div>
      </div>

      {/* Current Language */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Current Language</h3>
            <p className="text-gray-600">Language currently being used in the admin panel</p>
          </div>
          <div className="text-center">
            <div className="text-6xl mb-2">
              {supportedLanguages.find(l => l.code === activeLanguage)?.flag}
            </div>
            <div className="text-xl font-bold text-gray-900">
              {supportedLanguages.find(l => l.code === activeLanguage)?.nativeName}
            </div>
            <div className="text-sm text-gray-600">
              {supportedLanguages.find(l => l.code === activeLanguage)?.name}
            </div>
          </div>
        </div>
      </div>

      {/* Language Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Languages</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{supportedLanguages.length}</p>
            </div>
            <Globe className="text-blue-600" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Active Languages</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {supportedLanguages.filter(l => l.status === 'active').length}
              </p>
            </div>
            <Check className="text-green-600" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Avg. Completion</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">
                {Math.round(supportedLanguages.reduce((sum, l) => sum + l.completion, 0) / supportedLanguages.length)}%
              </p>
            </div>
            <div className="text-purple-600 text-2xl">📊</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Default Language</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {supportedLanguages.find(l => l.isDefault)?.flag}
              </p>
            </div>
            <div className="text-orange-600 text-2xl">⭐</div>
          </div>
        </div>
      </div>

      {/* Languages List */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-xl font-semibold text-gray-900">Supported Languages</h3>
          <p className="text-gray-600 mt-1">Manage languages available in your store</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Language</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Completion</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Default</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {supportedLanguages.map((language) => (
                <tr key={language.code} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{language.flag}</div>
                      <div>
                        <div className="font-semibold text-gray-900">{language.nativeName}</div>
                        <div className="text-sm text-gray-500">{language.name} ({language.code})</div>
                      </div>
                      {language.code === activeLanguage && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                          Current
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(language.status)}`}>
                      {language.status.charAt(0).toUpperCase() + language.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${getCompletionColor(language.completion)}`}
                          style={{ width: `${language.completion}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-700">{language.completion}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {language.isDefault ? (
                      <span className="text-yellow-500 text-xl">⭐</span>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => changeLanguage(language.code)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Switch to this language"
                      >
                        <Globe size={16} />
                      </button>
                      <button
                        className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                        title="Edit translations"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors"
                        title="Export translations"
                      >
                        <Download size={16} />
                      </button>
                      {!language.isDefault && (
                        <button
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Remove language"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Translation Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Upload size={20} />
            Import Translations
          </h4>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">Drop translation files here or click to upload</p>
              <p className="text-sm text-gray-500">Supports JSON, CSV, and Excel formats</p>
              <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Choose Files
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Globe size={20} />
            Auto-Translation
          </h4>
          <div className="space-y-4">
            <p className="text-gray-600">Use AI-powered translation to automatically translate your content to supported languages.</p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Source Language</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="en">English</option>
                  <option value="bn">Bengali</option>
                  <option value="hi">Hindi</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Language</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="bn">Bengali</option>
                  <option value="hi">Hindi</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                </select>
              </div>
              <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                Start Auto-Translation
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RTL Support */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Right-to-Left (RTL) Support</h4>
            <p className="text-gray-600">Enable RTL layout for Arabic, Hebrew, and other RTL languages</p>
          </div>
          <label className="flex items-center">
            <input type="checkbox" className="sr-only" />
            <div className="relative w-12 h-6 bg-gray-200 rounded-full transition-colors">
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform"></div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}