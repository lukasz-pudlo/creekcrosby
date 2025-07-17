#!/usr/bin/env bash
# Build script for Render deployment

set -o errexit  # Exit on error

echo "Starting build process..."

# Install dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Set production settings
export DJANGO_SETTINGS_MODULE=config.settings.production

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Run database migrations
echo "Running database migrations..."
python manage.py migrate

# Ensure media directory exists
echo "Ensuring media directory exists..."
python manage.py ensure_media_dir

# Create superuser if none exists
echo "Creating superuser if needed..."
python manage.py create_superuser_if_none

echo "Build process completed successfully!"