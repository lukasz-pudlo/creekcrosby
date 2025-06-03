# Email Configuration for Creek Crosby Contact Form

This document explains how to set up email functionality for the contact form system.

## Overview

The contact form system:
- Saves all messages to the SQLite database
- Sends email notifications to the band
- Sends confirmation emails to message senders
- Provides admin interface for managing messages

## Environment Variables

Add these variables to your `.env` file:

```bash
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@creekcrosby.com
CONTACT_EMAIL=contact@creekcrosby.com
```

## Email Provider Setup

### Gmail Setup
1. Enable 2-factor authentication on your Google account
2. Go to Google Account settings > Security > App passwords
3. Generate a new app password for "Mail"
4. Use this app password as `EMAIL_HOST_PASSWORD`

### Other Providers
- **Outlook**: `smtp-mail.outlook.com`, port 587
- **Yahoo**: `smtp.mail.yahoo.com`, port 587
- **Custom SMTP**: Use your provider's SMTP settings

## Development vs Production

### Development
- Uses console email backend (emails printed to terminal)
- No real emails sent during development
- Messages still saved to database

### Production
- Uses SMTP backend to send real emails
- Configure with your email provider credentials
- Set up proper `CONTACT_EMAIL` for receiving messages

## Database Storage

All contact messages are stored in the `ContactMessage` model with:
- Name, email, subject, message
- Timestamp, IP address, user agent
- Read/replied status flags
- Admin interface for management

## Admin Interface

Access the Django admin at `/admin/` to:
- View all contact messages
- Mark messages as read/replied
- Search and filter messages
- Export message data

## Testing

To test the contact form:
1. Fill out the form on the website
2. Check the terminal for email output (development)
3. Check the admin interface for saved messages
4. Verify email delivery (production)

## Security Features

- CSRF protection on all forms
- Input validation and sanitization
- Rate limiting (can be added)
- IP address logging for security
- HTML email templates with safe rendering 