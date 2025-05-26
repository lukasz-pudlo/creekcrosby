from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AboutSectionViewSet,
    BandMemberViewSet,
    ContactInfoViewSet,
    EventViewSet,
    LoginView,
    LogoutView,
    UserView,
)

router = DefaultRouter()
router.register(r"events", EventViewSet)
router.register(r"band", BandMemberViewSet)
router.register(r"about", AboutSectionViewSet)
router.register(r"contact", ContactInfoViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path("auth/user/", UserView.as_view(), name="auth_user"),
    path("auth/login/", LoginView.as_view(), name="auth_login"),
    path("auth/logout/", LogoutView.as_view(), name="auth_logout"),
]
