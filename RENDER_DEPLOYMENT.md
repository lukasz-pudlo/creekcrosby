# Creek Crosby - Render Deployment Guide

This guide will walk you through deploying your Creek Crosby website to Render step-by-step.

## Prerequisites

1. ✅ Your code is pushed to GitHub
2. ✅ You have a Render account (free tier works)
3. ✅ Your project has all the deployment files (already included)

## Step 1: Create Render Web Service

1. **Go to Render Dashboard**: https://dashboard.render.com/
2. **Click "New +"** → **"Web Service"**
3. **Connect GitHub**: If not already connected, authorize Render to access your GitHub
4. **Select Repository**: Choose your `creekcrosby` repository
5. **Configure Service**:
   - **Name**: `creekcrosby` (or your preferred name)
   - **Environment**: `Python 3`
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your default branch)
   - **Build Command**: `./build.sh`
   - **Start Command**: `gunicorn creek_crosby.wsgi:application`

## Step 2: Set Environment Variables

In your Render service dashboard, go to **Environment** tab and add these variables:

### Required Variables:
```env
DJANGO_SETTINGS_MODULE=config.settings.production
SECRET_KEY=your-super-secret-production-key-here-make-it-long-and-random
```

**Generate a secure SECRET_KEY**:
```python
# Run this in Python to generate a secure key:
import secrets
print(secrets.token_urlsafe(50))
```

### Optional but Recommended:
```env
# Email Configuration (for contact form)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@creekcrosby.com

# Custom Domain (if you have one)
CUSTOM_DOMAIN=yourdomain.com

# Admin Security (optional - changes admin URL)
ADMIN_URL=secure-admin-path/
```

## Step 3: Add Database (Optional)

For production, you can use PostgreSQL:

1. **In Render Dashboard**: Go to your service
2. **Click "New +"** → **"PostgreSQL"**
3. **Configure**:
   - **Name**: `creekcrosby-db`
   - **Database**: `creekcrosby`
   - **User**: `creekcrosby`
   - **Region**: Same as your web service
4. **Connect to Web Service**:
   - Go back to your web service
   - **Environment** tab
   - Render will automatically add `DATABASE_URL`

*Note: The free tier includes SQLite which works fine for small sites*

## Step 4: Update Domain Configuration

After deployment, update your domain in the production settings:

1. **Note your Render URL**: Something like `https://creekcrosby-xyz.onrender.com`
2. **Update** `config/settings/production.py`:

```python
ALLOWED_HOSTS = [
    'your-actual-app-name.onrender.com',  # Replace with your actual URL
    '.onrender.com',
]

CSRF_TRUSTED_ORIGINS = [
    'https://your-actual-app-name.onrender.com',  # Replace with your actual URL
    'https://*.onrender.com',
]
```

3. **Commit and push** the changes - Render will auto-deploy

## Step 5: Deploy!

1. **Click "Create Web Service"**
2. **Wait for deployment** (5-10 minutes for first deploy)
3. **Check logs** for any errors
4. **Visit your site** at the provided URL

## Step 6: Create Admin User

After successful deployment:

1. **Go to Render Dashboard** → Your service → **Shell**
2. **Run**:
```bash
python manage.py createsuperuser
```
3. **Follow prompts** to create admin user
4. **Access admin** at: `https://your-app.onrender.com/admin/`

## Step 7: Test Everything

✅ **Homepage loads**
✅ **All sections work** (About, Events, Band, Contact)
✅ **Contact form sends emails** (if configured)
✅ **Admin panel accessible**
✅ **Staff editing works** (login as admin)
✅ **Images upload properly**

## Troubleshooting

### Common Issues:

**1. Build Fails**
- Check build logs in Render dashboard
- Ensure `build.sh` has execute permissions: `chmod +x build.sh`
- Verify all dependencies in `requirements.txt`

**2. Static Files Not Loading**
- Check if `collectstatic` ran in build logs
- Verify `STATIC_URL` and `STATIC_ROOT` in settings

**3. Database Errors**
- If using PostgreSQL, ensure `DATABASE_URL` is set
- Check database connection in logs
- Run migrations: they should happen automatically in `build.sh`

**4. CSRF Errors**
- Update `ALLOWED_HOSTS` and `CSRF_TRUSTED_ORIGINS` with your actual domain
- Ensure HTTPS is working

**5. Email Not Working**
- Verify email environment variables
- Check Gmail app passwords (not regular password)
- Test email configuration in Django shell

### Useful Commands:

**View Logs**:
```bash
# In Render dashboard: Service → Logs
```

**Run Django Commands**:
```bash
# In Render dashboard: Service → Shell
python manage.py migrate
python manage.py collectstatic
python manage.py createsuperuser
```

**Check Settings**:
```bash
python manage.py shell
>>> from django.conf import settings
>>> print(settings.ALLOWED_HOSTS)
>>> print(settings.DEBUG)
```

## Custom Domain Setup (Optional)

If you have your own domain:

1. **In Render**: Service → Settings → Custom Domains
2. **Add your domain**: `yourdomain.com` and `www.yourdomain.com`
3. **Update DNS**: Point your domain to Render's servers (they'll provide instructions)
4. **Update environment variable**: `CUSTOM_DOMAIN=yourdomain.com`
5. **SSL**: Render provides free SSL certificates automatically

## Performance Tips

1. **Enable Redis caching** (add Redis service in Render)
2. **Use CDN** for static files (Cloudflare, etc.)
3. **Optimize images** before uploading
4. **Monitor performance** with Render's built-in metrics

## Security Checklist

✅ **SECRET_KEY** is secure and different from development
✅ **DEBUG=False** in production
✅ **HTTPS enforced** (automatic with Render)
✅ **Admin URL** changed from default (optional)
✅ **Strong admin passwords**
✅ **Email credentials** secure (use app passwords)

## Maintenance

- **Auto-deploys**: Render automatically deploys when you push to GitHub
- **Monitoring**: Check Render dashboard for uptime and performance
- **Backups**: If using PostgreSQL, Render provides automatic backups
- **Updates**: Keep dependencies updated in `requirements.txt`

## Support

- **Render Docs**: https://render.com/docs
- **Django Deployment**: https://docs.djangoproject.com/en/stable/howto/deployment/
- **Issues**: Check GitHub issues or create new ones

---

**Your Creek Crosby website should now be live on Render! 🎸🎵** 