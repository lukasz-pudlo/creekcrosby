FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    DJANGO_SETTINGS_MODULE=config.settings.production

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app

CMD ["sh", "-c", "python manage.py collectstatic --noinput --clear && python manage.py migrate && exec gunicorn -c gunicorn.conf.py creek_crosby.wsgi:application"]
