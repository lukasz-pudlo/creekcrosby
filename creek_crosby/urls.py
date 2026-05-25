from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import HttpResponse
from django.urls import include, path, re_path
from django.views.static import serve

urlpatterns = [
    path("healthz/", lambda r: HttpResponse("ok"), name="healthz"),
    path("admin/", admin.site.urls),
    path("", include("core.urls")),
]

# Serve media files in production (required for Render)
urlpatterns += [
    re_path(
        r"^media/(?P<path>.*)$",
        serve,
        {
            "document_root": settings.MEDIA_ROOT,
        },
    ),
]

# Serve static files only in development (WhiteNoise handles this in production)
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
