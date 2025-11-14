import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import EmailCampaignForm from '../components/emailCampaigns/EmailCampaignForm.jsx';
import enhancedApiService from '../services/enhancedApi.js';
import { toast } from 'react-hot-toast';

// Mock enhanced API service
jest.mock('../services/enhancedApi', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn()
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>
  }
}));

describe('EmailCampaignForm', () => {
  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();

  const mockTemplates = [
    {
      _id: 'template1',
      name: 'Welcome Email',
      subject: 'Welcome to our platform',
      htmlContent: '<h1>Welcome!</h1>'
    },
    {
      _id: 'template2',
      name: 'Newsletter',
      subject: 'Monthly Newsletter',
      htmlContent: '<h1>Newsletter</h1>'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock templates API call
    enhancedApiService.get.mockImplementation((url) => {
      if (url === '/admin/email-templates') {
        return Promise.resolve({
          success: true,
          data: mockTemplates
        });
      }
      if (url.startsWith('/admin/email-templates/')) {
        const templateId = url.split('/').pop();
        const template = mockTemplates.find(t => t._id === templateId);
        return Promise.resolve({
          success: true,
          data: template
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });
  });

  it('should render form with all required fields', async () => {
    render(<EmailCampaignForm onSave={mockOnSave} onCancel={mockOnCancel} />);
    
    await waitFor(() => {
      expect(enhancedApiService.get).toHaveBeenCalledWith('/admin/email-templates');
    });

    // Check for required form fields
    expect(screen.getByPlaceholderText('Enter campaign name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter email subject')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter HTML content...')).toBeInTheDocument();
    
    // Check for tabs
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Recipients')).toBeInTheDocument();
    expect(screen.getByText('Scheduling & Settings')).toBeInTheDocument();
  });

  it('should load and populate form with existing campaign data', async () => {
    const existingCampaign = {
      _id: 'campaign1',
      name: 'Existing Campaign',
      subject: 'Existing Subject',
      htmlContent: '<h1>Existing Content</h1>',
      recipientFilter: { type: 'customers' },
      settings: {
        trackOpens: false,
        trackClicks: true,
        fromName: 'Test Company'
      }
    };

    render(
      <EmailCampaignForm 
        campaign={existingCampaign}
        onSave={mockOnSave} 
        onCancel={mockOnCancel}
        isEditing={true}
      />
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Existing Campaign')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Existing Subject')).toBeInTheDocument();
      expect(screen.getByDisplayValue('<h1>Existing Content</h1>')).toBeInTheDocument();
    });
  });

  it('should create new campaign when form is submitted', async () => {
    const mockResponse = {
      success: true,
      data: {
        _id: 'new-campaign',
        name: 'New Campaign',
        status: 'draft'
      }
    };

    enhancedApiService.post.mockResolvedValue(mockResponse);

    render(<EmailCampaignForm onSave={mockOnSave} onCancel={mockOnCancel} />);
    
    await waitFor(() => {
      expect(enhancedApiService.get).toHaveBeenCalledWith('/admin/email-templates');
    });

    // Fill form fields
    fireEvent.change(screen.getByPlaceholderText('Enter campaign name'), {
      target: { value: 'New Campaign' }
    });
    fireEvent.change(screen.getByPlaceholderText('Enter email subject'), {
      target: { value: 'New Subject' }
    });
    fireEvent.change(screen.getByPlaceholderText('Enter HTML content...'), {
      target: { value: '<h1>New Content</h1>' }
    });

    // Submit form
    fireEvent.click(screen.getByText('Save Draft'));

    await waitFor(() => {
      expect(enhancedApiService.post).toHaveBeenCalledWith('/admin/email-campaigns', expect.objectContaining({
        name: 'New Campaign',
        subject: 'New Subject',
        htmlContent: '<h1>New Content</h1>'
      }));
    });

    expect(toast.success).toHaveBeenCalledWith('Campaign created successfully');
    expect(mockOnSave).toHaveBeenCalledWith(mockResponse.data);
  });

  it('should update existing campaign when editing', async () => {
    const existingCampaign = {
      _id: 'campaign1',
      name: 'Existing Campaign',
      subject: 'Existing Subject',
      htmlContent: '<h1>Existing Content</h1>'
    };

    const mockResponse = {
      success: true,
      data: { ...existingCampaign, name: 'Updated Campaign' }
    };

    enhancedApiService.put.mockResolvedValue(mockResponse);

    render(
      <EmailCampaignForm 
        campaign={existingCampaign}
        onSave={mockOnSave} 
        onCancel={mockOnCancel}
        isEditing={true}
      />
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Existing Campaign')).toBeInTheDocument();
    });

    // Update campaign name
    fireEvent.change(screen.getByDisplayValue('Existing Campaign'), {
      target: { value: 'Updated Campaign' }
    });

    // Submit form
    fireEvent.click(screen.getByText('Update'));

    await waitFor(() => {
      expect(enhancedApiService.put).toHaveBeenCalledWith(
        '/admin/email-campaigns/campaign1',
        expect.objectContaining({
          name: 'Updated Campaign'
        })
      );
    });

    expect(toast.success).toHaveBeenCalledWith('Campaign updated successfully');
    expect(mockOnSave).toHaveBeenCalledWith(mockResponse.data);
  });

  it('should switch between tabs', async () => {
    render(<EmailCampaignForm onSave={mockOnSave} onCancel={mockOnCancel} />);
    
    await waitFor(() => {
      expect(enhancedApiService.get).toHaveBeenCalledWith('/admin/email-templates');
    });

    // Initially on Content tab
    expect(screen.getByPlaceholderText('Enter campaign name')).toBeInTheDocument();

    // Switch to Recipients tab
    fireEvent.click(screen.getByText('Recipients'));
    expect(screen.getByText('Recipient Filter')).toBeInTheDocument();

    // Switch to Scheduling tab
    fireEvent.click(screen.getByText('Scheduling & Settings'));
    expect(screen.getByText('Schedule Delivery (Optional)')).toBeInTheDocument();
  });

  it('should handle template selection', async () => {
    render(<EmailCampaignForm onSave={mockOnSave} onCancel={mockOnCancel} />);
    
    await waitFor(() => {
      expect(enhancedApiService.get).toHaveBeenCalledWith('/admin/email-templates');
    });

    // Select a template
    const templateSelect = screen.getByDisplayValue('Select a template...');
    fireEvent.change(templateSelect, { target: { value: 'template1' } });

    await waitFor(() => {
      expect(enhancedApiService.get).toHaveBeenCalledWith('/admin/email-templates/template1');
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('Welcome to our platform')).toBeInTheDocument();
      expect(screen.getByDisplayValue('<h1>Welcome!</h1>')).toBeInTheDocument();
    });

    expect(toast.success).toHaveBeenCalledWith('Template loaded successfully');
  });

  it('should manage custom recipient list', async () => {
    render(<EmailCampaignForm onSave={mockOnSave} onCancel={mockOnCancel} />);
    
    await waitFor(() => {
      expect(enhancedApiService.get).toHaveBeenCalledWith('/admin/email-templates');
    });

    // Switch to Recipients tab
    fireEvent.click(screen.getByText('Recipients'));

    // Select custom list
    const filterSelect = screen.getByDisplayValue('All Users');
    fireEvent.change(filterSelect, { target: { value: 'custom' } });

    // Add recipient
    fireEvent.click(screen.getByText('Add Recipient'));
    
    const emailInputs = screen.getAllByPlaceholderText('Email address');
    const nameInputs = screen.getAllByPlaceholderText('Name (optional)');
    
    expect(emailInputs).toHaveLength(1);
    expect(nameInputs).toHaveLength(1);

    // Fill recipient details
    fireEvent.change(emailInputs[0], { target: { value: 'test@example.com' } });
    fireEvent.change(nameInputs[0], { target: { value: 'Test User' } });

    // Add another recipient
    fireEvent.click(screen.getByText('Add Recipient'));
    expect(screen.getAllByPlaceholderText('Email address')).toHaveLength(2);

    // Remove first recipient
    const removeButtons = screen.getAllByText('Remove');
    fireEvent.click(removeButtons[0]);
    
    expect(screen.getAllByPlaceholderText('Email address')).toHaveLength(1);
  });

  it('should handle scheduling settings', async () => {
    render(<EmailCampaignForm onSave={mockOnSave} onCancel={mockOnCancel} />);
    
    await waitFor(() => {
      expect(enhancedApiService.get).toHaveBeenCalledWith('/admin/email-templates');
    });

    // Switch to Scheduling tab
    fireEvent.click(screen.getByText('Scheduling & Settings'));

    // Set scheduling
    const scheduleInput = screen.getByDisplayValue('');
    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
    fireEvent.change(scheduleInput, { target: { value: futureDate } });

    // Update settings
    const fromNameInput = screen.getByPlaceholderText('Your Company Name');
    fireEvent.change(fromNameInput, { target: { value: 'My Company' } });

    const replyToInput = screen.getByPlaceholderText('reply@yourcompany.com');
    fireEvent.change(replyToInput, { target: { value: 'reply@mycompany.com' } });

    // Toggle tracking settings
    const trackOpensCheckbox = screen.getByRole('checkbox', { checked: true }); // First checkbox (track opens)
    fireEvent.click(trackOpensCheckbox);

    expect(scheduleInput.value).toBe(futureDate);
    expect(fromNameInput.value).toBe('My Company');
    expect(replyToInput.value).toBe('reply@mycompany.com');
  });

  it('should send campaign immediately when Save & Send is clicked', async () => {
    const mockCreateResponse = {
      success: true,
      data: { _id: 'new-campaign' }
    };

    const mockSendResponse = {
      success: true
    };

    enhancedApiService.post
      .mockResolvedValueOnce(mockCreateResponse)
      .mockResolvedValueOnce(mockSendResponse);

    render(<EmailCampaignForm onSave={mockOnSave} onCancel={mockOnCancel} />);
    
    await waitFor(() => {
      expect(enhancedApiService.get).toHaveBeenCalledWith('/admin/email-templates');
    });

    // Fill required fields
    fireEvent.change(screen.getByPlaceholderText('Enter campaign name'), {
      target: { value: 'Send Now Campaign' }
    });
    fireEvent.change(screen.getByPlaceholderText('Enter email subject'), {
      target: { value: 'Send Now Subject' }
    });
    fireEvent.change(screen.getByPlaceholderText('Enter HTML content...'), {
      target: { value: '<h1>Send Now Content</h1>' }
    });

    // Click Save & Send
    fireEvent.click(screen.getByText('Save & Send'));

    await waitFor(() => {
      expect(enhancedApiService.post).toHaveBeenCalledWith('/admin/email-campaigns', expect.any(Object));
    });

    await waitFor(() => {
      expect(enhancedApiService.post).toHaveBeenCalledWith('/admin/email-campaigns/new-campaign/send');
    });

    expect(toast.success).toHaveBeenCalledWith('Campaign created successfully');
    expect(toast.success).toHaveBeenCalledWith('Campaign sent successfully');
  });

  it('should handle form submission errors', async () => {
    const errorResponse = {
      response: {
        data: {
          error: 'Campaign name is required'
        }
      }
    };

    enhancedApiService.post.mockRejectedValue(errorResponse);

    render(<EmailCampaignForm onSave={mockOnSave} onCancel={mockOnCancel} />);
    
    await waitFor(() => {
      expect(enhancedApiService.get).toHaveBeenCalledWith('/admin/email-templates');
    });

    // Submit form without filling required fields
    fireEvent.click(screen.getByText('Save Draft'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Campaign name is required');
    });
  });

  it('should call onCancel when cancel button is clicked', async () => {
    render(<EmailCampaignForm onSave={mockOnSave} onCancel={mockOnCancel} />);
    
    await waitFor(() => {
      expect(enhancedApiService.get).toHaveBeenCalledWith('/admin/email-templates');
    });

    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should toggle preview mode between desktop and mobile', async () => {
    render(<EmailCampaignForm onSave={mockOnSave} onCancel={mockOnCancel} />);
    
    await waitFor(() => {
      expect(enhancedApiService.get).toHaveBeenCalledWith('/admin/email-templates');
    });

    // Initially desktop preview
    expect(screen.getByText('Mobile Preview')).toBeInTheDocument();

    // Click to switch to mobile
    fireEvent.click(screen.getByText('Mobile Preview'));
    expect(screen.getByText('Desktop Preview')).toBeInTheDocument();
    
    // Preview container should have mobile styling
    expect(screen.getByText('Preview (mobile)')).toBeInTheDocument();
  });
});