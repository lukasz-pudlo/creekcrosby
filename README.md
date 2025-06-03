# Creek Crosby Band Website

A website for Creek Crosby band built with Django and React.

## Features
- Modern, responsive design
- Single scrollable page layout
- Sections for About, Events, Band, and Contact
- Accessible design
- Secure implementation

## Tech Stack
- Backend: Django, Django REST Framework
- Frontend: React
- Database: SQLite (development), PostgreSQL (production)

## Setup Instructions

### Prerequisites
- Python 3.12
- Node.js and npm
- pipenv

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd creek-crosby

# Staff Editing Instructions

## Setting Up Staff Users

1. **Create a staff user** (run this command in your project directory):
   ```bash
   python manage.py create_staff_user
   ```
   Follow the prompts to create a username, email, and password.

2. **Alternative: Use Django admin to create staff users**:
   - Create a superuser: `python manage.py createsuperuser`
   - Log into `/admin/`
   - Go to Users → Add User
   - Check "Staff status" when creating/editing the user

## How to Edit Content

### For Staff Users:

1. **Login**: Navigate to `/admin/` and log in with your staff credentials
2. **Return to main site**: Navigate back to the main website (`/`)
3. **Edit Mode**: You'll see an "Edit Mode" indicator in the top-right corner
4. **Click to edit**: 
   - **Text**: Click on any text to edit it inline
   - **Images**: Click on images to upload new ones
   - **Sections**: Add or delete about sections using the buttons

### What You Can Edit:

- **About Section**: 
  - Edit titles and content by clicking
  - Upload images by clicking on existing images or placeholders
  - Add new sections with the "+ Add New Section" button
  - Delete sections with the × button

- **Events**: 
  - Edit event details inline
  - Add new events
  - Upload event images

- **Band Members**:
  - Edit member information
  - Upload member photos
  - Add or remove band members

- **Contact Information**:
  - Update contact details
  - Modify social media links

### Staff Controls:

- **Edit Mode Indicator**: Shows when you're logged in as staff
- **Admin Button**: Quick access to Django admin
- **Logout Button**: Log out when done editing

### Tips:

- Changes are saved immediately when you click "Save"
- Press Escape while editing to cancel changes
- For text fields, press Enter to save (Shift+Enter for new lines in multi-line fields)
- Images should be under 5MB
- Only staff users can see edit controls - regular visitors see the normal website

## Installation Notes

Make sure to update your files with the new components and run:

```bash
# Install new dependencies if needed
cd frontend
npm install

# Apply any database migrations
cd ..
python manage.py makemigrations
python manage.py migrate

# Create sample data (optional)
python manage.py create_sample_data

# Create a staff user
python manage.py create_staff_user
```