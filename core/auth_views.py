from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import ensure_csrf_cookie
from django.contrib.auth import logout
from django.middleware.csrf import get_token
import json


@ensure_csrf_cookie
@require_http_methods(["GET"])
def auth_status(request):
    """Return the authentication status of the current user and ensure CSRF cookie is set"""
    csrf_token = get_token(request)

    if request.user.is_authenticated:
        return JsonResponse({
            'authenticated': True,
            'is_staff': request.user.is_staff,
            'username': request.user.username,
            'csrf_token': csrf_token,
        })
    else:
        return JsonResponse({
            'authenticated': False,
            'is_staff': False,
            'username': None,
            'csrf_token': csrf_token,
        })


@ensure_csrf_cookie
@require_http_methods(["GET"])
def csrf_token(request):
    """Endpoint to get CSRF token"""
    token = get_token(request)
    return JsonResponse({'csrf_token': token})


@require_http_methods(["POST"])
def logout_view(request):
    """Custom logout view that returns JSON response"""
    print(f"Logout request headers: {dict(request.headers)}")
    print(
        f"Logout request META: {request.META.get('HTTP_X_CSRFTOKEN', 'NOT FOUND')}")
    print(f"User authenticated: {request.user.is_authenticated}")

    if request.user.is_authenticated:
        logout(request)
        return JsonResponse({'success': True, 'message': 'Logged out successfully'})
    else:
        return JsonResponse({'success': False, 'message': 'Not logged in'}, status=400)
