#!/usr/bin/env python

import os
import subprocess
import sys
import threading
import time


def run_django():
    """Run Django development server"""
    try:
        os.system('python manage.py runserver')
    except KeyboardInterrupt:
        pass


def run_react():
    """Run React development server"""
    os.chdir('frontend')
    try:
        # Set environment variable for React to proxy API requests
        env = os.environ.copy()
        env['REACT_APP_API_URL'] = 'http://localhost:8000'
        subprocess.run(['npm', 'start'], env=env)
    except KeyboardInterrupt:
        pass


def main():
    """Main function to run both servers"""
    print("Starting development servers...")

    # Start Django in a separate thread
    django_thread = threading.Thread(target=run_django)
    django_thread.daemon = True
    django_thread.start()

    # Wait a bit for Django to start
    time.sleep(2)

    # Start React
    print("Starting React development server...")
    run_react()

    # If React exits, kill Django as well
    sys.exit(0)


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\nShutting down development servers...")
        sys.exit(0)
