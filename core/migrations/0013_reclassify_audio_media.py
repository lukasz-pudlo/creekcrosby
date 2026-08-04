from django.db import migrations

AUDIO_EXTS = (".wav", ".mp3", ".m4a", ".ogg", ".flac")


def forwards(apps, schema_editor):
    """Move audio files mis-filed as video_file into the new audio type.

    Only the stored path string is repointed; files stay where they are on
    disk (e.g. media/videos/Move_It.wav remains a valid audio_file path).
    """
    MediaItem = apps.get_model("core", "MediaItem")
    for item in MediaItem.objects.filter(media_type="video_file").exclude(
        video_file=""
    ):
        if item.video_file.name.lower().endswith(AUDIO_EXTS):
            item.audio_file = item.video_file.name
            item.video_file = None
            item.media_type = "audio"
            item.save(update_fields=["audio_file", "video_file", "media_type"])


def backwards(apps, schema_editor):
    MediaItem = apps.get_model("core", "MediaItem")
    for item in MediaItem.objects.filter(media_type="audio").exclude(audio_file=""):
        item.video_file = item.audio_file.name
        item.audio_file = None
        item.media_type = "video_file"
        item.save(update_fields=["audio_file", "video_file", "media_type"])


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0012_mediaitem_audio_file_alter_mediaitem_media_type"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
