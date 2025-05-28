from django.shortcuts import render
from django.http import JsonResponse
from django.core.paginator import Paginator
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import Event, BandMember, AboutSection, ContactInfo
from .serializers import (
    EventSerializer,
    BandMemberSerializer,
    AboutSectionSerializer,
    ContactInfoSerializer
)


# Main page view
def index(request):
    """Main index view that serves the HTMX-powered page"""
    return render(request, 'index.html')


# HTMX Views for lazy loading and dynamic content
def events_partial(request):
    """HTMX view for loading events"""
    events = Event.objects.all().order_by('date')

    if request.htmx:
        return render(request, 'partials/events.html', {'events': events})

    return render(request, 'events.html', {'events': events})


def band_partial(request):
    """HTMX view for loading band members"""
    band_members = BandMember.objects.all().order_by('order', 'name')

    if request.htmx:
        return render(request, 'partials/band.html', {'band_members': band_members})

    return render(request, 'band.html', {'band_members': band_members})


def about_partial(request):
    """HTMX view for loading about sections"""
    about_sections = AboutSection.objects.all()

    if request.htmx:
        return render(request, 'partials/about.html', {'about_sections': about_sections})

    return render(request, 'about.html', {'about_sections': about_sections})


def contact_partial(request):
    """HTMX view for loading contact info"""
    try:
        contact_info = ContactInfo.objects.first()
    except ContactInfo.DoesNotExist:
        contact_info = None

    if request.htmx:
        return render(request, 'partials/contact.html', {'contact_info': contact_info})

    return render(request, 'contact.html', {'contact_info': contact_info})


@csrf_exempt
@require_http_methods(["POST"])
def contact_form(request):
    """HTMX view for handling contact form submissions"""
    if request.htmx:
        # Get form data
        name = request.POST.get('name', '')
        email = request.POST.get('email', '')
        subject = request.POST.get('subject', '')
        message = request.POST.get('message', '')

        # Basic validation
        if not all([name, email, subject, message]):
            return render(request, 'partials/contact_form_error.html', {
                'error': 'All fields are required.'
            })

        # Here you would typically save to database or send email
        # For now, we'll just return a success message

        return render(request, 'partials/contact_form_success.html', {
            'name': name
        })

    return JsonResponse({'error': 'Invalid request'}, status=400)


def search_events(request):
    """HTMX-capable search view for events"""
    search_text = request.GET.get('search_text', '').strip()
    page_num = int(request.GET.get('page', 1))
    items_per_page = 6

    events = Event.objects.all().order_by('date')

    if search_text:
        events = events.filter(
            title__icontains=search_text
        ) | events.filter(
            description__icontains=search_text
        ) | events.filter(
            location__icontains=search_text
        )

    paginator = Paginator(events, items_per_page)
    page = paginator.get_page(page_num)

    data = {
        'events': page.object_list,
        'has_more': page.has_next(),
        'next_page': page_num + 1,
        'search_text': search_text,
    }

    if request.htmx:
        if page_num > 1:
            # Simulate loading time for infinite scroll
            import time
            time.sleep(1)
        return render(request, 'partials/event_results.html', data)

    return render(request, 'search_events.html', data)


# Keep existing API views for backward compatibility
class EventViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for viewing band events"""
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [AllowAny]


class BandMemberViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for viewing band members"""
    queryset = BandMember.objects.all()
    serializer_class = BandMemberSerializer
    permission_classes = [AllowAny]


class AboutSectionViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for viewing about sections"""
    queryset = AboutSection.objects.all()
    serializer_class = AboutSectionSerializer
    permission_classes = [AllowAny]


class ContactInfoViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for viewing contact information"""
    queryset = ContactInfo.objects.all()
    serializer_class = ContactInfoSerializer
    permission_classes = [AllowAny]
