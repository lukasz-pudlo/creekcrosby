# Creek Crosby Deployment Guide

This guide covers how to deploy the Creek Crosby website both locally for development and to Render for production.

## Project Structure

The project now uses a modular settings structure:

```
config/
├── __init__.py
└── settings/
    ├── __init__.py
    ├── base.py          # Common settings
    ├── development.py   # Local development settings
    └── production.py    # Production settings for Render
```

## Local Development Setup

### 1. Clone and Setup

```bash
git clone <repository-url>
cd creekcrosby
```

### 2. Install Dependencies

Using Pipenv (recommended):
```bash
pipenv install --dev
pipenv shell
```

Or using pip:
```bash
pip install -r requirements.txt
```

### 3. Environment Variables

Copy the example environment file:
```bash
cp env.example .env
```

Edit `.env` with your local settings:
```env
SECRET_KEY=your-local-secret-key
DEBUG=True
DJANGO_SETTINGS_MODULE=config.settings.development
```

### 4. Database Setup

```bash
python manage.py migrate
python manage.py createsuperuser
```

### 5. Run Development Server

```bash
python manage.py runserver
```

The development settings automatically support:
- ✅ ngrok tunnels (auto-detected)
- ✅ Local development (127.0.0.1, localhost)
- ✅ Debug mode enabled
- ✅ Console email backend
- ✅ SQLite database

## Production Deployment on Render

### 1. Render Service Setup

1. Create a new **Web Service** on Render
2. Connect your GitHub repository
3. Use these settings:
   - **Environment**: `Python 3`
   - **Build Command**: `./build.sh`
   - **Start Command**: `gunicorn creek_crosby.wsgi:application`

### 2. Environment Variables

Set these environment variables in Render dashboard:

#### Required:
```env
DJANGO_SETTINGS_MODULE=config.settings.production
SECRET_KEY=your-production-secret-key-here
```

#### Database (if using PostgreSQL):
```env
DATABASE_URL=postgresql://user:password@host:port/database
```
*Note: Render provides this automatically if you add a PostgreSQL database*

#### Optional but Recommended:
```env
# Custom domain
CUSTOM_DOMAIN=yourdomain.com

# Email configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@creekcrosby.com

# Redis cache
REDIS_URL=redis://localhost:6379/1

# Error tracking
SENTRY_DSN=your-sentry-dsn-here

# Admin security
ADMIN_URL=secure-admin-path/
```

### 3. Database Setup

If using PostgreSQL on Render:
1. Add a PostgreSQL database to your service
2. Render will automatically set `DATABASE_URL`
3. The build script will run migrations automatically

### 4. Static Files

Static files are handled by WhiteNoise automatically. The build script runs `collectstatic`.

### 5. Domain Configuration

Update `config/settings/production.py` with your actual Render domain:
```python
ALLOWED_HOSTS = [
    'your-app-name.onrender.com',  # Replace with your actual domain
    '.onrender.com',
]

CSRF_TRUSTED_ORIGINS = [
    'https://your-app-name.onrender.com',  # Replace with your actual domain
    'https://*.onrender.com',
]
```

## Settings Overview

### Development Settings (`config.settings.development`)
- ✅ Debug mode enabled
- ✅ SQLite database
- ✅ ngrok auto-detection
- ✅ Console email backend
- ✅ Permissive CORS
- ✅ Detailed logging

### Production Settings (`config.settings.production`)
- ✅ Debug mode disabled
- ✅ PostgreSQL database support
- ✅ WhiteNoise for static files
- ✅ Security headers enabled
- ✅ Redis caching
- ✅ SMTP email backend
- ✅ Error tracking with Sentry

## Security Features

Production deployment includes:
- HTTPS enforcement
- HSTS headers
- Secure cookies
- XSS protection
- Content type sniffing protection
- Referrer policy
- Frame options

## Troubleshooting

### Common Issues

1. **Static files not loading**: Ensure `collectstatic` runs in build script
2. **Database connection errors**: Check `DATABASE_URL` environment variable
3. **CSRF errors**: Verify `CSRF_TRUSTED_ORIGINS` includes your domain
4. **ngrok not working locally**: Ensure ngrok is running on port 4040

### Logs

Check Render logs for deployment issues:
```bash
# In Render dashboard, go to your service > Logs
```

For local development:
```bash
python manage.py runserver --verbosity=2
```

## File Structure

```
creekcrosby/
├── config/
│   └── settings/
│       ├── base.py
│       ├── development.py
│       └── production.py
├── core/                 # Django app
├── templates/           # HTML templates
├── static/             # CSS, JS, images
├── media/              # User uploads
├── build.sh            # Render build script
├── requirements.txt    # Production dependencies
├── Pipfile            # Development dependencies
├── env.example        # Environment variables example
└── manage.py          # Django management
```

## Next Steps

1. Update domain names in production settings
2. Set up email configuration
3. Configure custom domain (optional)
4. Set up monitoring with Sentry (optional)
5. Configure Redis for caching (optional) 