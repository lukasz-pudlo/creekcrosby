#!/usr/bin/env python
"""
Test script to verify settings configuration works correctly.
Run this to test both development and production settings.
"""

import os
import sys
from pathlib import Path

# Add the project root to Python path
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

def test_settings(settings_module):
    """Test if a settings module can be imported and basic settings exist."""
    print(f"\n🧪 Testing {settings_module}...")
    
    try:
        # Set the settings module
        os.environ['DJANGO_SETTINGS_MODULE'] = settings_module
        
        # Import Django and configure
        import django
        from django.conf import settings
        
        # Check if settings can be accessed
        print(f"   ✅ Settings imported successfully")
        print(f"   ✅ DEBUG = {settings.DEBUG}")
        print(f"   ✅ SECRET_KEY exists: {bool(settings.SECRET_KEY)}")
        print(f"   ✅ ALLOWED_HOSTS = {settings.ALLOWED_HOSTS}")
        print(f"   ✅ Database engine: {settings.DATABASES['default']['ENGINE']}")
        print(f"   ✅ Static URL: {settings.STATIC_URL}")
        print(f"   ✅ Media URL: {settings.MEDIA_URL}")
        
        # Check middleware
        middleware_count = len(settings.MIDDLEWARE)
        print(f"   ✅ Middleware count: {middleware_count}")
        
        # Check installed apps
        apps_count = len(settings.INSTALLED_APPS)
        print(f"   ✅ Installed apps count: {apps_count}")
        
        return True
        
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def main():
    """Run tests for both settings configurations."""
    print("🚀 Testing Creek Crosby Settings Configuration")
    print("=" * 50)
    
    # Test development settings
    dev_success = test_settings('config.settings.development')
    
    # Test production settings
    prod_success = test_settings('config.settings.production')
    
    print("\n" + "=" * 50)
    print("📊 Test Results:")
    print(f"   Development settings: {'✅ PASS' if dev_success else '❌ FAIL'}")
    print(f"   Production settings:  {'✅ PASS' if prod_success else '❌ FAIL'}")
    
    if dev_success and prod_success:
        print("\n🎉 All settings configurations are working correctly!")
        print("\n📝 Next steps:")
        print("   1. Copy env.example to .env for local development")
        print("   2. Update production settings with your actual domain")
        print("   3. Set environment variables in Render dashboard")
        print("   4. Deploy to Render using the build.sh script")
    else:
        print("\n⚠️  Some settings configurations failed. Check the errors above.")
        sys.exit(1)

if __name__ == '__main__':
    main() 