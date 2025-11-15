import React, { useState } from 'react';
import { 
  X, Download, Upload, FileText, Code, Globe, Copy, Check,
  AlertTriangle, RefreshCw, Save, Eye, FileDown, FileUp
} from 'lucide-react';

const ExportImportModal = ({
  isOpen,
  onClose,
  sections,
  theme,
  onImport
}) => {
  const [activeTab, setActiveTab] = useState('export');
  const [exportFormat, setExportFormat] = useState('json');
  const [importData, setImportData] = useState('');
  const [importError, setImportError] = useState('');
  const [copied, setCopied] = useState(false);

  const exportFormats = [
    {
      id: 'json',
      name: 'JSON',
      description: 'Export as JSON for backup or transfer',
      icon: FileText,
      extension: 'json'
    },
    {
      id: 'html',
      name: 'HTML',
      description: 'Export as HTML for static hosting',
      icon: Code,
      extension: 'html'
    }
  ];

  const generateExportData = () => {
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      theme: theme,
      sections: sections,
      metadata: {
        totalSections: sections.length,
        visibleSections: sections.filter(s => s.visible).length,
        sectionTypes: [...new Set(sections.map(s => s.type))]
      }
    };

    if (exportFormat === 'json') {
      return JSON.stringify(exportData, null, 2);
    } else if (exportFormat === 'html') {
      return generateHTMLExport(exportData);
    }
  };

  const generateHTMLExport = (data) => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exported Website</title>
    <style>
        :root {
            --primary-color: ${data.theme.primaryColor || '#000000'};
            --secondary-color: ${data.theme.secondaryColor || '#ffffff'};
            --accent-color: ${data.theme.accentColor || '#3b82f6'};
            --font-family: ${data.theme.fontFamily || 'Inter'}, sans-serif;
            --heading-font: ${data.theme.headingFont || 'Inter'}, sans-serif;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: var(--font-family);
            line-height: 1.6;
            color: var(--primary-color);
        }
        
        h1, h2, h3, h4, h5, h6 {
            font-family: var(--heading-font);
            margin-bottom: 1rem;
        }
        
        .section {
            padding: 2rem 0;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 1rem;
        }
        
        .hero {
            background: var(--accent-color);
            color: white;
            text-align: center;
            padding: 4rem 0;
        }
        
        .hero h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        
        .products {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
            margin-top: 2rem;
        }
        
        .product-card {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 1rem;
            text-align: center;
        }
        
        .btn {
            display: inline-block;
            padding: 0.75rem 1.5rem;
            background: var(--accent-color);
            color: white;
            text-decoration: none;
            border-radius: 4px;
            margin-top: 1rem;
        }
        
        .footer {
            background: #111;
            color: white;
            text-align: center;
            padding: 2rem 0;
            margin-top: 4rem;
        }
    </style>
</head>
<body>
    ${data.sections.filter(s => s.visible).map(section => {
      let sectionHTML = '';
      const settings = section.settings || {};
      
      if (section.type === 'hero') {
        sectionHTML = `
        <section class="section hero" style="background-color: ${settings.bgColor || '#3b82f6'}; color: ${settings.textColor || '#ffffff'}; padding: ${settings.padding || 120}px 0;">
            <div class="container">
                <h1>${section.content || 'Hero Title'}</h1>
                <p>${section.subtitle || 'Hero subtitle'}</p>
                <a href="#" class="btn">${settings.buttonText || 'Learn More'}</a>
            </div>
        </section>`;
      } else if (section.type === 'products') {
        sectionHTML = `
        <section class="section" style="background-color: ${settings.bgColor || '#ffffff'}; color: ${settings.textColor || '#000000'}; padding: ${settings.padding || 80}px 0;">
            <div class="container">
                <h2>${section.content || 'Products'}</h2>
                <div class="products">
                    <div class="product-card">
                        <h3>Product 1</h3>
                        <p>Product description</p>
                        <a href="#" class="btn">View Product</a>
                    </div>
                    <div class="product-card">
                        <h3>Product 2</h3>
                        <p>Product description</p>
                        <a href="#" class="btn">View Product</a>
                    </div>
                </div>
            </div>
        </section>`;
      } else {
        sectionHTML = `
        <section class="section" style="background-color: ${settings.bgColor || '#ffffff'}; color: ${settings.textColor || '#000000'}; padding: ${settings.padding || 60}px 0;">
            <div class="container">
                <h2>${section.content || 'Section Title'}</h2>
                <p>Section content goes here...</p>
            </div>
        </section>`;
      }
      
      return sectionHTML;
    }).join('\n')}
    
    <footer class="footer">
        <div class="container">
            <p>&copy; 2024 Your Company. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>`;
    
    return html;
  };

  const handleExport = () => {
    const data = generateExportData();
    const format = exportFormats.find(f => f.id === exportFormat);
    
    const blob = new Blob([data], { 
      type: exportFormat === 'json' ? 'application/json' : 'text/html' 
    });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `website-export.${format.extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyToClipboard = async () => {
    try {
      const data = generateExportData();
      await navigator.clipboard.writeText(data);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleImport = () => {
    try {
      setImportError('');
      const data = JSON.parse(importData);
      
      // Validate imported data structure
      if (!data.sections || !Array.isArray(data.sections)) {
        throw new Error('Invalid data structure: sections array is required');
      }
      
      if (!data.theme || typeof data.theme !== 'object') {
        throw new Error('Invalid data structure: theme object is required');
      }
      
      // Apply imported data
      onImport(data);
      setImportData('');
      onClose();
    } catch (error) {
      setImportError(error.message);
    }
  };

  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImportData(e.target.result);
      };
      reader.readAsText(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <FileDown className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Export & Import</h2>
              <p className="text-gray-600">Backup, share, or migrate your website data</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'export'
                ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'import'
                ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <Upload className="w-4 h-4" />
            Import
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'export' && (
            <div className="space-y-6">
              {/* Export Summary */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">What will be exported:</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• {sections.length} sections ({sections.filter(s => s.visible).length} visible)</li>
                  <li>• Theme settings (colors, fonts, layout)</li>
                  <li>• Section configurations and content</li>
                  <li>• Export metadata and version info</li>
                </ul>
              </div>

              {/* Export Format Selection */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Choose Export Format</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {exportFormats.map((format) => (
                    <button
                      key={format.id}
                      onClick={() => setExportFormat(format.id)}
                      className={`p-6 border-2 rounded-xl text-left transition-all ${
                        exportFormat === format.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <format.icon className={`w-8 h-8 ${
                          exportFormat === format.id ? 'text-blue-600' : 'text-gray-600'
                        }`} />
                        <div>
                          <h4 className="font-semibold">{format.name}</h4>
                          <span className="text-sm text-gray-500">.{format.extension}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{format.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Preview</h3>
                <div className="relative">
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-auto max-h-60 font-mono">
                    {generateExportData().substring(0, 500)}...
                  </pre>
                  <button
                    onClick={handleCopyToClipboard}
                    className={`absolute top-2 right-2 p-2 rounded transition-colors ${
                      copied
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Export Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleExport}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download {exportFormat.toUpperCase()}
                </button>
                <button
                  onClick={handleCopyToClipboard}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <Copy className="w-5 h-5" />
                  Copy to Clipboard
                </button>
              </div>
            </div>
          )}

          {activeTab === 'import' && (
            <div className="space-y-6">
              {/* Import Warning */}
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-medium">Warning</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  Importing will replace all current sections and theme settings. 
                  Consider exporting your current data first as a backup.
                </p>
              </div>

              {/* Import Methods */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Import Methods</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      id="file-import"
                      accept=".json"
                      onChange={handleFileImport}
                      className="hidden"
                    />
                    <label htmlFor="file-import" className="cursor-pointer block">
                      <FileUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="font-medium text-gray-700">Upload JSON File</p>
                      <p className="text-sm text-gray-500">Click to browse files</p>
                    </label>
                  </div>
                  <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
                    <Code className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="font-medium text-gray-700 text-center">Paste JSON Data</p>
                    <p className="text-sm text-gray-500 text-center">Use the text area below</p>
                  </div>
                </div>
              </div>

              {/* Import Data Textarea */}
              <div>
                <label className="block text-sm font-medium mb-2">JSON Data</label>
                <textarea
                  value={importData}
                  onChange={(e) => {
                    setImportData(e.target.value);
                    setImportError('');
                  }}
                  className="w-full h-60 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Paste your JSON export data here..."
                />
                {importError && (
                  <p className="text-red-600 text-sm mt-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    {importError}
                  </p>
                )}
              </div>

              {/* Import Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleImport}
                  disabled={!importData.trim()}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Upload className="w-5 h-5" />
                  Import Data
                </button>
                <button
                  onClick={() => {
                    setImportData('');
                    setImportError('');
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {activeTab === 'export' 
                ? 'Export your data for backup or sharing with others'
                : 'Import data to restore or migrate content'
              }
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportImportModal;