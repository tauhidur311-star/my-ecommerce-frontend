import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import pageAccessControl from '../utils/pageAccessControl';

const ContentPageRoute = () => {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  // Debug: Log when component mounts
  console.log('🚀 ContentPageRoute component mounted for slug:', slug);
  console.log('🚀 Current URL:', window.location.href);
  console.log('🚀 Window pathname:', window.location.pathname);

  useEffect(() => {
    const checkPageAccess = async () => {
      setLoading(true);
      
      try {
        // Get all content pages from localStorage or API
        const savedContent = localStorage.getItem('admin-content');
        let allPages = [];
        
        if (savedContent) {
          allPages = JSON.parse(savedContent);
        } else {
          // Try to fetch from API
          const token = localStorage.getItem('token');
          try {
            const response = await fetch('/api/admin/content', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              allPages = data.pages || [];
            }
          } catch (apiError) {
            console.warn('Could not fetch pages from API, using localStorage only');
          }
        }
        
        // Find the page with matching slug
        const foundPage = allPages.find(p => p.slug === slug);
        
        if (!foundPage) {
          // Page doesn't exist
          setPage(null);
          setAccessDenied(true);
          setLoading(false);
          return;
        }
        
        // Check if user can access this page - handle case where user might not be logged in
        let currentUser;
        try {
          currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        } catch (error) {
          console.warn('Error parsing user data, treating as guest');
          currentUser = {};
        }
        
        // Debug logging for user and page info
        console.log('=== ACCESS CONTROL DEBUG ===');
        console.log('Current user:', currentUser);
        console.log('User role:', currentUser.role);
        console.log('User keys:', Object.keys(currentUser));
        console.log('Page:', foundPage.title);
        console.log('Page status:', foundPage.status);
        console.log('Page slug:', foundPage.slug);
        
        const canAccess = pageAccessControl.canAccessPage(foundPage, currentUser);
        
        console.log('Can access result:', canAccess);
        console.log('=== END DEBUG ===');
        
        if (!canAccess) {
          // User cannot access this page - log the attempt
          console.log(`❌ Access denied to page "${foundPage.title}" (${foundPage.status}) for user:`, currentUser.role || 'guest');
          setAccessDenied(true);
          setPage(foundPage); // Set page for logging purposes
        } else {
          // User can access this page
          console.log(`✅ Access granted to page "${foundPage.title}" (${foundPage.status}) for user:`, currentUser.role || 'guest');
          setPage(foundPage);
          setAccessDenied(false);
        }
        
      } catch (error) {
        console.error('Error checking page access:', error);
        setAccessDenied(true);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      checkPageAccess();
    } else {
      setLoading(false);
      setAccessDenied(true);
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading page...</p>
        </div>
      </div>
    );
  }

  if (accessDenied || !page) {
    console.log('🚨 REDIRECT TO 404 - DEBUG:');
    console.log('   accessDenied:', accessDenied);
    console.log('   page exists:', !!page);
    console.log('   page data:', page);
    console.log('   Redirecting to /404');
    return <Navigate to="/404" replace />;
  }

  // Render the page content
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Admin Draft Banner */}
        {page.status === 'draft' && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>⚠️ DRAFT PREVIEW</strong> - This page is only visible to administrators and is not public.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Page Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {page.title}
            {page.status === 'draft' && (
              <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Draft
              </span>
            )}
          </h1>
          {page.metaDescription && (
            <p className="text-xl text-gray-600">{page.metaDescription}</p>
          )}
        </header>

        {/* Page Content */}
        <main className="prose prose-lg max-w-none">
          <div 
            className="text-gray-700 leading-relaxed"
            style={{ whiteSpace: 'pre-line' }}
          >
            {page.content}
          </div>
        </main>

        {/* Page Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <p>Last updated: {new Date(page.updatedAt).toLocaleDateString()}</p>
            <p>Views: {page.views || 0}</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ContentPageRoute;