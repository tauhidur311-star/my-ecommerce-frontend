// Page Access Control Utility
// This utility handles access control for content pages

export const pageAccessControl = {
  
  // Check if a user can access a specific page
  canAccessPage(page, user = null) {
    if (!page) {
      console.log('❌ No page provided to access control');
      return false;
    }
    
    // Handle case where user might not be logged in (null/empty object)
    let currentUser;
    try {
      currentUser = user || JSON.parse(localStorage.getItem('user') || '{}');
    } catch (error) {
      console.warn('Error parsing user data, treating as guest');
      currentUser = {};
    }
    
    // Enhanced admin detection - check multiple possible role fields
    // Also handle case where user might be null/undefined
    const isAdmin = currentUser && (
                   currentUser.role === 'admin' || 
                   currentUser.role === 'super_admin' ||
                   currentUser.userType === 'admin' ||
                   currentUser.type === 'admin' ||
                   currentUser.isAdmin === true ||
                   currentUser.admin === true
                   );
    
    console.log('🔍 Access Control Check:');
    console.log('   User:', currentUser?.name || currentUser?.email || 'Guest/Not Logged In');
    console.log('   User object:', currentUser);
    console.log('   Is Admin?', isAdmin);
    console.log('   Is Logged In?', !!(currentUser && (currentUser.id || currentUser._id || currentUser.email)));
    console.log('   Page status:', page.status);
    
    switch (page.status) {
      case 'published':
        console.log('✅ Published page - allowing access to everyone');
        return true;
        
      case 'draft':
        if (isAdmin) {
          console.log('✅ Draft page - allowing admin access');
          return true;
        } else {
          console.log('🚫 Draft page - blocking non-admin access');
          return false;
        }
        
      case 'archived':
        console.log('🚫 Archived page - blocking access for everyone');
        return false;
        
      default:
        console.log('❓ Unknown page status - blocking access');
        return false;
    }
  },
  
  // Get access control message for a page
  getAccessMessage(page, user = null) {
    if (!page) return 'Page not found';
    
    const currentUser = user || JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = currentUser.role === 'admin' || currentUser.role === 'super_admin';
    
    switch (page.status) {
      case 'published':
        return 'This page is publicly accessible';
        
      case 'draft':
        if (isAdmin) {
          return 'Admin access: This draft is not public';
        } else {
          return 'Access denied: Draft pages are only accessible to administrators';
        }
        
      case 'archived':
        if (isAdmin) {
          return 'Admin preview: This archived page returns 404 to public users';
        } else {
          return 'Page not found: This page has been archived';
        }
        
      default:
        return 'Unknown page status';
    }
  },
  
  // Check if user can edit a page
  canEditPage(page, user = null) {
    const currentUser = user || JSON.parse(localStorage.getItem('user') || '{}');
    return currentUser.role === 'admin' || currentUser.role === 'super_admin';
  },
  
  // Get the appropriate URL for a page based on access rights
  getPageUrl(page, user = null) {
    if (!page) return null;
    
    const currentUser = user || JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = currentUser.role === 'admin' || currentUser.role === 'super_admin';
    
    switch (page.status) {
      case 'published':
        // Public URL for published pages
        return `/${page.slug}`;
        
      case 'draft':
        if (isAdmin) {
          // Admin preview URL for drafts
          return `/preview/${page.slug}?token=${localStorage.getItem('token')}`;
        } else {
          return null; // No access
        }
        
      case 'archived':
        // No direct URL access for archived pages
        return null;
        
      default:
        return null;
    }
  },
  
  // Filter pages based on user access
  filterAccessiblePages(pages, user = null, includeAdminAccess = false) {
    const currentUser = user || JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = currentUser.role === 'admin' || currentUser.role === 'super_admin';
    
    if (includeAdminAccess && isAdmin) {
      // Admins can see all pages in admin interface
      return pages;
    }
    
    // Regular users only see published pages
    return pages.filter(page => page.status === 'published');
  }
};

export default pageAccessControl;