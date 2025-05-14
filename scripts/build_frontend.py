#!/usr/bin/env python

import os
import subprocess
import sys


def main():
    """
    Script to build the React frontend and prepare it for Django to serve
    """
    # Determine the base directory of the project
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    frontend_dir = os.path.join(base_dir, 'frontend')

    # Check if frontend directory exists
    if not os.path.exists(frontend_dir):
        print("Error: Frontend directory not found.")
        sys.exit(1)

    try:
        # Navigate to frontend directory
        os.chdir(frontend_dir)

        # Install dependencies
        print("Installing frontend dependencies...")
        subprocess.run(["npm", "install"], check=True)

        # Build the React app
        print("Building the React app...")
        subprocess.run(["npm", "run", "build"], check=True)

        # Create necessary Django directories if they don't exist
        static_dir = os.path.join(base_dir, 'staticfiles')
        if not os.path.exists(static_dir):
            os.makedirs(static_dir)

        print("Frontend built successfully!")
        print("You can now run Django server with: python manage.py runserver")

    except subprocess.CalledProcessError as e:
        print(f"Error: Failed to build frontend: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
