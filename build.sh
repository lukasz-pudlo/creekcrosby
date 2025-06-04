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

# Create superuser if none exists
echo "Creating superuser if needed..."
python manage.py create_superuser_if_none

# Create band story about section
echo "Creating band story about section..."
python manage.py create_band_story

echo "Build process completed successfully!" 