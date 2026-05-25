import os
import shutil
from pathlib import Path


def backup_media():
    """Backup media files before deployment"""
    media_dir = Path("media")
    backup_dir = Path("media_backup")

    if media_dir.exists():
        if backup_dir.exists():
            shutil.rmtree(backup_dir)
        shutil.copytree(media_dir, backup_dir)
        print(f"Media backed up to {backup_dir}")


def restore_media():
    """Restore media files after deployment"""
    backup_dir = Path("media_backup")
    media_dir = Path("media")

    if backup_dir.exists():
        if media_dir.exists():
            shutil.rmtree(media_dir)
        shutil.copytree(backup_dir, media_dir)
        print(f"Media restored from {backup_dir}")


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1:
        if sys.argv[1] == "backup":
            backup_media()
        elif sys.argv[1] == "restore":
            restore_media()
