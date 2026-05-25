"""
Development settings for Creek Crosby project.
This file contains settings specific to local development environment.
"""

import re

import requests

from .base import *

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

# Base allowed hosts for development
BASE_ALLOWED_HOSTS = ["127.0.0.1", "localhost", "0.0.0.0"]


# Function to detect ngrok tunnels
def get_ngrok_urls():
    """
    Automatically detect ngrok tunnel URLs and add them to allowed hosts.
    This allows seamless development with ngrok without manual configuration.
    """
    ngrok_urls = []
    try:
        # Try to get active tunnels from ngrok API
        response = requests.get("http://localhost:4040/api/tunnels", timeout=2)
        if response.status_code == 200:
            data = response.json()
            for tunnel in data["tunnels"]:
                url = tunnel.get("public_url", "")
                if url and "ngrok" in url:
                    # Extract hostname without protocol
                    hostname = re.sub(r"^https?://", "", url).split("/")[0]
                    ngrok_urls.append(hostname)
                    print(f"Found ngrok tunnel: {hostname}")
    except (requests.RequestException, Exception):
        # If ngrok API is not available, don't fail
        pass

    return ngrok_urls


# Add ngrok URLs to allowed hosts
ALLOWED_HOSTS = BASE_ALLOWED_HOSTS + get_ngrok_urls()

# Add wildcard for ngrok subdomains (useful for multiple tunnels)
ALLOWED_HOSTS.extend(
    [
        "*.ngrok.io",
        "*.ngrok-free.app",
        "*.ngrok.app",
    ]
)

print(f"Development ALLOWED_HOSTS: {ALLOWED_HOSTS}")

# Trust ngrok and local development as proxies
CSRF_TRUSTED_ORIGINS = []
for host in ALLOWED_HOSTS:
    if (
        host.startswith("127.0.0.1")
        or host.startswith("localhost")
        or host.startswith("0.0.0.0")
    ):
        CSRF_TRUSTED_ORIGINS.extend([f"http://{host}", f"http://{host}:8000"])
    elif "ngrok" in host and not host.startswith("*"):
        CSRF_TRUSTED_ORIGINS.append(f"https://{host}")

# Add wildcard ngrok origins
CSRF_TRUSTED_ORIGINS.extend(
    [
        "https://*.ngrok.io",
        "https://*.ngrok-free.app",
        "https://*.ngrok.app",
    ]
)

print(f"Development CSRF_TRUSTED_ORIGINS: {CSRF_TRUSTED_ORIGINS}")

# Database - SQLite for development
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# Add development-specific middleware
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "django_htmx.middleware.HtmxMiddleware",
    "core.middleware.NgrokAllowedHostMiddleware",  # Custom middleware for ngrok
    "core.middleware.SecurityHeadersMiddleware",  # Custom security headers
]

# CORS settings - allow all for development
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

# Disable security features for development
SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False

# Email backend for development (console)
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# Logging configuration for development
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "{levelname} {asctime} {module} {process:d} {thread:d} {message}",
            "style": "{",
        },
        "simple": {
            "format": "{levelname} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "simple",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO",
    },
    "loggers": {
        "django": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": False,
        },
        "core": {
            "handlers": ["console"],
            "level": "DEBUG",
            "propagate": False,
        },
    },
}

# Development-specific settings
INTERNAL_IPS = [
    "127.0.0.1",
    "localhost",
]

# Cache settings for development (dummy cache)
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.dummy.DummyCache",
    }
}
