from django.shortcuts import get_object_or_404, render, redirect
from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from django.http import JsonResponse
from django.core.paginator import Paginator
from django.views.decorators.csrf import csrf_protect
from django.views.decorators.http import require_http_methods
from django.db import models
from django.core.mail import send_mail, BadHeaderError
from django.conf import settings
from django.contrib import messages
from django.template.loader import render_to_string
from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import Event, BandMember, AboutSection, ContactInfo, Merchandise
from .serializers import (
    EventSerializer,
    BandMemberSerializer,
    AboutSectionSerializer,
    ContactInfoSerializer,
    MerchandiseSerializer,
)
from .forms import ContactMessageForm


# Main page view
def index(request):
    """Main index view that serves the HTMX-powered page"""
    return render(request, 'index.html', {
        'user': request.user,
        'is_staff': request.user.is_staff
    })


# HTMX Views for lazy loading and dynamic content
def events_partial(request):
    """HTMX view for loading events"""
    from django.utils import timezone
    now = timezone.now()

    # Get upcoming events (future) and past events separately
    upcoming_events = Event.objects.filter(date__gte=now).order_by('date')
    past_events = Event.objects.filter(date__lt=now).order_by('-date')

    # Combine them: upcoming events first, then past events
    events = list(upcoming_events) + list(past_events)

    if request.htmx:
        return render(request, 'partials/event_results.html', {
            'events': events,
            'user': request.user,
            'is_staff': request.user.is_staff
        })

    return render(request, 'events.html', {
        'events': events,
        'user': request.user,
        'is_staff': request.user.is_staff
    })


def band_partial(request):
    """HTMX view for loading band members"""
    band_members = BandMember.objects.all().order_by('order', 'name')

    if request.htmx:
        return render(request, 'partials/band.html', {
            'band_members': band_members,
            'is_staff': request.user.is_staff
        })

    return render(request, 'band.html', {
        'band_members': band_members,
        'is_staff': request.user.is_staff
    })


def about_partial(request):
    """HTMX view for loading about sections"""
    about_sections = AboutSection.objects.all()

    if request.htmx:
        return render(request, 'partials/about.html', {
            'about_sections': about_sections,
            'is_staff': request.user.is_staff
        })

    return render(request, 'about.html', {
        'about_sections': about_sections,
        'is_staff': request.user.is_staff
    })


def contact_partial(request):
    """Render contact section"""
    try:
        contact_info = ContactInfo.objects.first()
    except ContactInfo.DoesNotExist:
        contact_info = None

    # Create a new form instance
    form = ContactMessageForm()

    context = {
        'contact_info': contact_info,
        'is_staff': request.user.is_staff,
        'form': form
    }

    if request.htmx:
        return render(request, 'partials/contact.html', context)

    return render(request, 'contact.html', context)


@csrf_protect
@require_http_methods(["GET", "POST"])
def contact_form(request):
    """Handle contact form submissions"""

    if request.method == 'POST':
        form = ContactMessageForm(request.POST)

        if form.is_valid():
            # Save to database
            contact_message = form.save(commit=False)

            # Add metadata
            contact_message.ip_address = get_client_ip(request)
            contact_message.user_agent = request.META.get('HTTP_USER_AGENT', '')
            contact_message.save()

            # Send email notification
            try:
                send_contact_email(contact_message)

                if request.htmx:
                    return render(request, 'partials/contact_success.html', {
                        'message': 'Thank you for your message! We\'ll get back to you soon.'
                    })
                else:
                    messages.success(
                        request, 'Thank you for your message! We\'ll get back to you soon.')
                    return redirect('contact_form')

            except Exception as e:
                # Log the error but still save the message
                print(f"Email sending failed: {e}")

                if request.htmx:
                    return render(request, 'partials/contact_success.html', {
                        'message': 'Your message has been saved. We\'ll get back to you soon!'
                    })
                else:
                    messages.success(
                        request, 'Your message has been saved. We\'ll get back to you soon!')
                    return redirect('contact_form')
        else:
            # Form has errors
            if request.htmx:
                return render(request, 'partials/contact_form.html', {
                    'form': form,
                    'errors': form.errors
                })
    else:
        form = ContactMessageForm()

    if request.htmx:
        return render(request, 'partials/contact_form.html', {'form': form})

    return render(request, 'contact_form.html', {'form': form})


def get_client_ip(request):
    """Get client IP address"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def send_contact_email(contact_message):
    """Send email notification for new contact message"""

    # Email to admin/band
    admin_subject = f"New Contact Message: {contact_message.subject}"
    admin_message = render_to_string('emails/contact_admin.html', {
        'contact_message': contact_message
    })

    # Email to sender (confirmation)
    sender_subject = "Thank you for contacting Creek Crosby"
    sender_message = render_to_string('emails/contact_confirmation.html', {
        'contact_message': contact_message
    })

    try:
        # Send to admin
        admin_email = getattr(settings, 'CONTACT_EMAIL', 'admin@creekcrosby.com')
        send_mail(
            admin_subject,
            admin_message,
            settings.DEFAULT_FROM_EMAIL,
            [admin_email],
            fail_silently=False,
            html_message=admin_message
        )

        # Send confirmation to sender
        send_mail(
            sender_subject,
            sender_message,
            settings.DEFAULT_FROM_EMAIL,
            [contact_message.email],
            fail_silently=False,
            html_message=sender_message
        )

    except BadHeaderError:
        raise Exception("Invalid header found in email.")
    except Exception as e:
        raise Exception(f"Email sending failed: {str(e)}")


def search_events(request):
    """HTMX-capable search view for events"""
    search_text = request.GET.get('search_text', '').strip()
    page_num = int(request.GET.get('page', 1))
    items_per_page = 6

    from django.utils import timezone
    now = timezone.now()

    # Get upcoming events (future) and past events separately
    upcoming_events = Event.objects.filter(date__gte=now).order_by('date')
    past_events = Event.objects.filter(date__lt=now).order_by('-date')

    if search_text:
        # Apply search filter to both upcoming and past events
        upcoming_events = upcoming_events.filter(
            title__icontains=search_text
        ) | upcoming_events.filter(
            description__icontains=search_text
        ) | upcoming_events.filter(
            location__icontains=search_text
        )

        past_events = past_events.filter(
            title__icontains=search_text
        ) | past_events.filter(
            description__icontains=search_text
        ) | past_events.filter(
            location__icontains=search_text
        )

    # Combine them: upcoming events first, then past events
    events = list(upcoming_events) + list(past_events)

    paginator = Paginator(events, items_per_page)
    page = paginator.get_page(page_num)

    data = {
        'events': page.object_list,
        'has_more': page.has_next(),
        'next_page': page_num + 1,
        'search_text': search_text,
        'user': request.user,
        'is_staff': request.user.is_staff,
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
    serializer_class = EventSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        """Return events ordered with upcoming events first, then past events"""
        from django.utils import timezone
        from django.db.models import Case, When, Value, IntegerField
        now = timezone.now()

        # Simple approach: upcoming events (is_upcoming=0) come first, ordered by date ascending
        # Past events (is_upcoming=1) come second, ordered by date descending
        return Event.objects.annotate(
            is_upcoming=Case(
                When(date__gte=now, then=Value(0)),
                default=Value(1),
                output_field=IntegerField()
            )
        ).order_by('is_upcoming', Case(
            When(is_upcoming=0, then='date'),  # Upcoming: ascending
            default='-date'  # Past: descending
        ))


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


# About Section Editing Views
@csrf_protect
@require_http_methods(["POST"])
@login_required
def edit_about_section(request, section_id):
    """Edit about section inline"""
    if not request.user.is_staff:
        return JsonResponse({'error': 'Unauthorized'}, status=403)

    section = get_object_or_404(AboutSection, id=section_id)

    if request.htmx:
        field = request.POST.get('field')
        value = request.POST.get('value', '').strip()

        if field == 'title':
            section.title = value
        elif field == 'content':
            section.content = value

        if value:  # Only save if there's content
            section.save()

        return render(request, 'partials/about_section_item.html', {
            'section': section,
            'index': 0,  # You might want to calculate this properly
            'is_staff': request.user.is_staff
        })

    return JsonResponse({'error': 'Invalid request'}, status=400)


@csrf_protect
@require_http_methods(["POST"])
@login_required
def upload_about_image(request, section_id):
    """Upload image for about section"""
    if not request.user.is_staff:
        return JsonResponse({'error': 'Unauthorized'}, status=403)

    section = get_object_or_404(AboutSection, id=section_id)

    if request.FILES.get('image'):
        section.image = request.FILES['image']
        section.save()

        if request.htmx:
            return render(request, 'partials/about_section_item.html', {
                'section': section,
                'index': 0,
                'is_staff': request.user.is_staff
            })

    return JsonResponse({'error': 'No image provided'}, status=400)


@csrf_protect
@require_http_methods(["POST"])
@login_required
def delete_about_image(request, section_id):
    """Delete image from about section"""
    if not request.user.is_staff:
        return JsonResponse({'error': 'Unauthorized'}, status=403)

    section = get_object_or_404(AboutSection, id=section_id)

    if section.image:
        section.image.delete()
        section.save()

    if request.htmx:
        return render(request, 'partials/about_section_item.html', {
            'section': section,
            'index': 0,
            'is_staff': request.user.is_staff
        })

    return JsonResponse({'success': True})


@csrf_protect
@require_http_methods(["POST"])
@login_required
def add_about_section(request):
    """Add new about section"""
    if not request.user.is_staff:
        return JsonResponse({'error': 'Unauthorized'}, status=403)

    title = request.POST.get('title', 'New Section').strip()
    content = request.POST.get('content', 'Click to edit content').strip()

    section = AboutSection.objects.create(
        title=title,
        content=content
    )

    if request.htmx:
        # Return the updated about sections
        about_sections = AboutSection.objects.all()
        return render(request, 'partials/about.html', {
            'about_sections': about_sections,
            'is_staff': request.user.is_staff
        })

    return JsonResponse({'success': True})


@csrf_protect
@require_http_methods(["POST"])
@login_required
def delete_about_section(request, section_id):
    """Delete about section"""
    if not request.user.is_staff:
        return JsonResponse({'error': 'Unauthorized'}, status=403)

    section = get_object_or_404(AboutSection, id=section_id)
    section.delete()

    if request.htmx:
        # Return the updated about sections
        about_sections = AboutSection.objects.all()
        return render(request, 'partials/about.html', {
            'about_sections': about_sections,
            'is_staff': request.user.is_staff
        })

    return JsonResponse({'success': True})


# Band Member Editing Views
@csrf_protect
@require_http_methods(["POST"])
@login_required
def edit_band_member(request, member_id):
    """Edit band member inline"""
    if not request.user.is_staff:
        return JsonResponse({'error': 'Unauthorized'}, status=403)

    member = get_object_or_404(BandMember, id=member_id)

    if request.htmx:
        field = request.POST.get('field')
        value = request.POST.get('value', '').strip()

        if field == 'name':
            member.name = value
        elif field == 'position':
            member.position = value
        elif field == 'bio':
            member.bio = value

        if value:
            member.save()

        return render(request, 'partials/band_member_item.html', {
            'member': member,
            'is_staff': request.user.is_staff
        })

    return JsonResponse({'error': 'Invalid request'}, status=400)


@csrf_protect
@require_http_methods(["POST"])
@login_required
def upload_band_image(request, member_id):
    """Upload image for band member"""
    if not request.user.is_staff:
        return JsonResponse({'error': 'Unauthorized'}, status=403)

    member = get_object_or_404(BandMember, id=member_id)

    if request.FILES.get('image'):
        member.image = request.FILES['image']
        member.save()

        if request.htmx:
            return render(request, 'partials/band_member_item.html', {
                'member': member,
                'is_staff': request.user.is_staff
            })

    return JsonResponse({'error': 'No image provided'}, status=400)


@csrf_protect
@require_http_methods(["POST"])
@login_required
def add_band_member(request):
    """Add new band member"""
    if not request.user.is_staff:
        return JsonResponse({'error': 'Unauthorized'}, status=403)

    name = request.POST.get('name', 'New Member').strip()
    position = request.POST.get('position', 'Musician').strip()
    bio = request.POST.get('bio', 'Band member bio').strip()

    # Get the highest order number and add 1
    max_order = BandMember.objects.aggregate(
        max_order=models.Max('order'))['max_order'] or 0

    member = BandMember.objects.create(
        name=name,
        position=position,
        bio=bio,
        order=max_order + 1
    )

    if request.htmx:
        # Return the updated band members
        band_members = BandMember.objects.all().order_by('order', 'name')
        return render(request, 'partials/band.html', {
            'band_members': band_members,
            'is_staff': request.user.is_staff
        })

    return JsonResponse({'success': True})


@csrf_protect
@require_http_methods(["POST"])
@login_required
def delete_band_member(request, member_id):
    """Delete band member"""
    if not request.user.is_staff:
        return JsonResponse({'error': 'Unauthorized'}, status=403)

    member = get_object_or_404(BandMember, id=member_id)
    member.delete()

    if request.htmx:
        # Return the updated band members
        band_members = BandMember.objects.all().order_by('order', 'name')
        return render(request, 'partials/band.html', {
            'band_members': band_members,
            'is_staff': request.user.is_staff
        })

    return JsonResponse({'success': True})


@csrf_protect
@require_http_methods(["POST"])
@login_required
def reorder_band_members(request):
    """Reorder band members"""
    if not request.user.is_staff:
        return JsonResponse({'error': 'Unauthorized'}, status=403)

    import json
    try:
        member_ids = json.loads(request.POST.get('member_ids', '[]'))

        # Update the order for each member
        for index, member_id in enumerate(member_ids):
            BandMember.objects.filter(id=member_id).update(order=index + 1)

        if request.htmx:
            # Return the updated band members
            band_members = BandMember.objects.all().order_by('order', 'name')
            return render(request, 'partials/band.html', {
                'band_members': band_members,
                'is_staff': request.user.is_staff
            })

        return JsonResponse({'success': True})
    except (json.JSONDecodeError, ValueError) as e:
        return JsonResponse({'error': 'Invalid data'}, status=400)


# Contact Info Editing Views
@csrf_protect
@require_http_methods(["POST"])
@login_required
def edit_contact_info(request):
    """Edit contact information"""
    if not request.user.is_staff:
        return JsonResponse({'error': 'Unauthorized'}, status=403)

    contact_info, created = ContactInfo.objects.get_or_create(id=1)

    if request.htmx:
        field = request.POST.get('field')
        value = request.POST.get('value', '').strip()

        if field == 'email':
            contact_info.email = value
        elif field == 'phone':
            contact_info.phone = value
        elif field == 'address':
            contact_info.address = value
        elif field == 'social_facebook':
            contact_info.social_facebook = value
        elif field == 'social_instagram':
            contact_info.social_instagram = value
        elif field == 'social_twitter':
            contact_info.social_twitter = value
        elif field == 'social_linkedin':
            contact_info.social_linkedin = value

        if value:
            contact_info.save()

        return render(request, 'partials/contact.html', {
            'contact_info': contact_info,
            'is_staff': request.user.is_staff
        })

    return JsonResponse({'error': 'Invalid request'}, status=400)

# Event Editing Views


@csrf_protect
@require_http_methods(["POST"])
@login_required
def edit_event(request, event_id):
    """Edit event inline"""
    if not request.user.is_staff:
        return JsonResponse({'error': 'Unauthorized'}, status=403)

    event = get_object_or_404(Event, id=event_id)

    if request.htmx:
        field = request.POST.get('field')
        value = request.POST.get('value', '').strip()
        needs_full_refresh = False

        if field == 'title':
            event.title = value
        elif field == 'description':
            event.description = value
        elif field == 'location':
            event.location = value
        elif field == 'date':
            # Handle date editing (YYYY-MM-DD format)
            try:
                from datetime import datetime
                new_date = datetime.strptime(value, '%Y-%m-%d').date()
                # Keep the existing time, just change the date
                event.date = event.date.replace(
                    year=new_date.year, month=new_date.month, day=new_date.day)
                needs_full_refresh = True  # Date changes affect ordering
            except (ValueError, TypeError):
                return JsonResponse({'error': 'Invalid date format. Use YYYY-MM-DD'}, status=400)
        elif field == 'time':
            # Handle time editing (HH:MM format)
            try:
                from datetime import datetime
                new_time = datetime.strptime(value, '%H:%M').time()
                # Keep the existing date, just change the time
                event.date = event.date.replace(
                    hour=new_time.hour, minute=new_time.minute)
                needs_full_refresh = True  # Time changes affect ordering
            except (ValueError, TypeError):
                return JsonResponse({'error': 'Invalid time format. Use HH:MM'}, status=400)

        if value:
            event.save()

        if needs_full_refresh:
            # Return updated events grid for date/time changes (affects ordering)
            # The JavaScript will handle replacing the entire #events-results content
            from django.utils import timezone
            now = timezone.now()

            # Get upcoming events (future) and past events separately
            upcoming_events = Event.objects.filter(date__gte=now).order_by('date')
            past_events = Event.objects.filter(date__lt=now).order_by('-date')

            # Combine them: upcoming events first, then past events
            events = list(upcoming_events) + list(past_events)

            return render(request, 'partials/event_results.html', {
                'events': events,
                'is_staff': request.user.is_staff
            })
        else:
            # Return just the single event card for other field changes
            # The JavaScript will handle replacing just the event card
            return render(request, 'partials/event_card.html', {
                'event': event,
                'is_staff': request.user.is_staff
            })

    return JsonResponse({'error': 'Invalid request'}, status=400)


@csrf_protect
@require_http_methods(["POST"])
@login_required
def upload_event_image(request, event_id):
    """Upload image for event"""
    if not request.user.is_staff:
        return JsonResponse({'error': 'Unauthorized'}, status=403)

    event = get_object_or_404(Event, id=event_id)

    if request.FILES.get('image'):
        event.image = request.FILES['image']
        event.save()

        if request.htmx:
            # Return just the single event card
            return render(request, 'partials/event_card.html', {
                'event': event,
                'is_staff': request.user.is_staff
            })

    return JsonResponse({'error': 'No image provided'}, status=400)


@csrf_protect
@require_http_methods(["POST"])
@login_required
def add_event(request):
    """Add new event"""
    if not request.user.is_staff:
        return JsonResponse({'error': 'Unauthorized'}, status=403)

    title = request.POST.get('title', 'New Event').strip()
    description = request.POST.get('description', 'Event description').strip()
    location = request.POST.get('location', 'TBD').strip()

    # Set default date to next month
    from django.utils import timezone
    from datetime import timedelta
    default_date = timezone.now() + timedelta(days=30)

    event = Event.objects.create(
        title=title,
        description=description,
        location=location,
        date=default_date
    )

    if request.htmx:
        # Return the updated events
        from django.utils import timezone
        now = timezone.now()

        # Get upcoming events (future) and past events separately
        upcoming_events = Event.objects.filter(date__gte=now).order_by('date')
        past_events = Event.objects.filter(date__lt=now).order_by('-date')

        # Combine them: upcoming events first, then past events
        events = list(upcoming_events) + list(past_events)

        return render(request, 'partials/event_results.html', {
            'events': events,
            'is_staff': request.user.is_staff
        })

    return JsonResponse({'success': True})


@csrf_protect
@require_http_methods(["POST"])
@login_required
def delete_event(request, event_id):
    """Delete event"""
    if not request.user.is_staff:
        return JsonResponse({'error': 'Unauthorized'}, status=403)

    event = get_object_or_404(Event, id=event_id)
    event.delete()

    if request.htmx:
        # Return the updated events
        from django.utils import timezone
        now = timezone.now()

        # Get upcoming events (future) and past events separately
        upcoming_events = Event.objects.filter(date__gte=now).order_by('date')
        past_events = Event.objects.filter(date__lt=now).order_by('-date')

        # Combine them: upcoming events first, then past events
        events = list(upcoming_events) + list(past_events)

        return render(request, 'partials/event_results.html', {
            'events': events,
            'is_staff': request.user.is_staff
        })

    return JsonResponse({'success': True})


# Footer views
def footer_contact_partial(request):
    """HTMX view for loading footer contact info"""
    try:
        contact_info = ContactInfo.objects.first()
    except ContactInfo.DoesNotExist:
        contact_info = None

    return render(request, 'partials/footer_contact.html', {
        'contact_info': contact_info
    })


def footer_social_partial(request):
    """HTMX view for loading footer social links"""
    try:
        contact_info = ContactInfo.objects.first()
    except ContactInfo.DoesNotExist:
        contact_info = None

    return render(request, 'partials/footer_social.html', {
        'contact_info': contact_info
    })


def footer_thanks_partial(request):
    """HTMX view for loading footer thanks section"""

    return render(request, 'partials/footer_thanks.html')


def merchandise_partial(request):
    """HTMX view for loading merchandise"""
    from django.utils import timezone
    now = timezone.now()

    merchandise_items = Merchandise.objects.all()

    return render(request, 'partials/merchandise.html', {
        'merchandise_items': merchandise_items
    })
