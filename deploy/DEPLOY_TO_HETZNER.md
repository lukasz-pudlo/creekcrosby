# Deploying Creek Crosby to the new Hetzner VPS

Runbook for standing up a **fresh** Hetzner Cloud box and migrating Creek
Crosby off Sevalla onto it. Follows the same architecture as the CPX32 box
(see `DEPLOY_DJANGO_APP_TO_HETZNER.md` in the racehere/taigh-tuaram repos):
host Nginx + certbot, one Docker compose stack per app under `/srv/<app>/`,
embedded Postgres per app, ports bound to `127.0.0.1`.

**Port plan for this box:** `8001` creekcrosby, `8003` reserved for the
portfolio (its `deploy/hetzner/docker-compose.yml` already binds 8003).

## 0. Prerequisites (local)

- These changes merged to the **`production`** branch and pushed — the server
  clones `production`, not `development`.
- A current copy of the production data: either the Sevalla deployment or the
  local checkout, whichever is authoritative (see step 6).

## 1. Buy the server

Hetzner Cloud console → Add Server:

- **Location**: Nuremberg/Falkenstein/Helsinki (same region as the CPX32).
- **Image**: Ubuntu 24.04.
- **Type**: cheapest available shared vCPU with ≥2 GB RAM — CX23 or CAX11
  (4 GB) if in stock in the chosen location, otherwise CPX12 (2 GB).
  On CAX (ARM) everything here works unchanged; images build on the box.
- **SSH key**: add your existing public key (`~/.ssh/id_ed25519.pub`).

Note the IP as `<NEW_IP>` below.

## 2. Bootstrap (as root, one time)

```bash
cd ~/projects/creekcrosby
scp -r deploy root@<NEW_IP>:/root/deploy
ssh root@<NEW_IP> 'bash /root/deploy/bootstrap-server.sh'
```

The script creates the `deploy` user (sudo with password — it prompts at the
end), hardens SSH (root login and password auth off), enables UFW 22/80/443,
installs Docker + Nginx + certbot, installs the shared Nginx snippets, adds a
2 GB swapfile, and creates `/srv/creekcrosby` + `/srv/backups`.

Then add a local alias in `~/.ssh/config`:

```
Host hetzner2
    HostName <NEW_IP>
    User deploy
```

## 3. GitHub deploy key + clone

```bash
ssh hetzner2
ssh-keygen -t ed25519 -C "deploy@hetzner2:creekcrosby" -N "" -f ~/.ssh/id_ed25519
cat ~/.ssh/id_ed25519.pub
```

Add the pubkey: GitHub → creekcrosby repo → Settings → Deploy keys →
read-only. Verify with `ssh -T git@github.com`, then:

```bash
cd /srv/creekcrosby
git clone git@github.com:lukasz-pudlo/creekcrosby.git repo
cd repo && git checkout production
```

## 4. Compose + .env

```bash
cd /srv/creekcrosby
cp repo/deploy/hetzner/docker-compose.yml .
cp repo/deploy/hetzner/env.example .env
chmod 600 .env
# Fill in SECRET_KEY and POSTGRES_PASSWORD (mirror it into DATABASE_URL):
openssl rand -base64 48 | tr -d /=+   # SECRET_KEY
openssl rand -base64 24 | tr -d /=+   # POSTGRES_PASSWORD
vim .env
```

## 5. First boot

```bash
cd /srv/creekcrosby
docker compose up -d --build
docker compose logs -f web        # watch collectstatic + migrate + gunicorn
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8001/healthz/   # 200
```

## 6. Data + media migration from Sevalla

Media is not in git (~71 MB locally) and the DB content lives wherever the
Sevalla app wrote it. `dumpdata`/`loaddata` is DB-agnostic, so it works
whether Sevalla ran SQLite or Postgres.

**On the authoritative source** (Sevalla shell, or locally if the local copy
is current):

```bash
python manage.py dumpdata --natural-foreign --natural-primary \
    -e contenttypes -e auth.permission -e sessions \
    -o /tmp/creekcrosby-dump.json
```

Copy dump + media to the server, then load:

```bash
scp /tmp/creekcrosby-dump.json hetzner2:/tmp/
rsync -avz media/ hetzner2:/srv/creekcrosby/media/

ssh hetzner2
cd /srv/creekcrosby
docker compose cp /tmp/creekcrosby-dump.json web:/tmp/
docker compose exec web python manage.py loaddata /tmp/creekcrosby-dump.json
```

The dump includes `auth.User`, so existing admin logins carry over. If
starting empty instead: `docker compose exec web python manage.py createsuperuser`.

## 7. Nginx vhost

```bash
ssh hetzner2
sudo cp /srv/creekcrosby/repo/deploy/nginx/creekcrosby.conf /etc/nginx/sites-available/creekcrosby
sudo ln -sf /etc/nginx/sites-available/creekcrosby /etc/nginx/sites-enabled/creekcrosby
sudo nginx -t && sudo systemctl reload nginx
```

Validate before DNS moves (from local machine):

```bash
curl -s -o /dev/null -w "%{http_code}\n" -H "Host: creekcrosby.co.uk" http://<NEW_IP>/healthz/   # 200
```

## 8. DNS cutover + TLS

1. **Day before**: at the registrar, drop the TTL on the `creekcrosby.co.uk`
   A records to 60s.
2. **Cutover**: point `creekcrosby.co.uk` and `www` A records at `<NEW_IP>`.
   Verify: `dig +short creekcrosby.co.uk @1.1.1.1`
3. **Immediately after** DNS resolves to the new IP:

```bash
ssh hetzner2
sudo certbot --nginx -d creekcrosby.co.uk -d www.creekcrosby.co.uk \
    --non-interactive --agree-tos -m l.pudlo1990@gmail.com --redirect
```

There's a short plain-HTTP window between the flip and the cert — minutes if
the cutover steps run back-to-back.

## 9. Smoke test

```bash
curl -sI https://creekcrosby.co.uk/healthz/    # 200
curl -sI https://creekcrosby.co.uk/            # 200
curl -sI https://www.creekcrosby.co.uk/        # 200
curl -sI https://creekcrosby.co.uk/media/<some-known-file>   # 200, from nginx
```

Also check the portfolio case-study page still embeds the site (CSP
`frame-ancestors` allows lukaszpudlo.com; the vhost deliberately uses the
embeddable header snippet with no `X-Frame-Options`).

## 10. Backups

```bash
ssh hetzner2
sudo cp /srv/creekcrosby/repo/deploy/creekcrosby-backup.cron /etc/cron.d/creekcrosby-backup
sudo /srv/creekcrosby/repo/deploy/backup-db.sh   # run once by hand, check /srv/backups/creekcrosby/
```

## 11. Decommission Sevalla

Leave the Sevalla app running (but no longer receiving traffic) for a few
days as a fallback, then delete it. Keep a final dump + media copy first.

## Verification checklist

- [ ] `docker compose ps` — web and db both healthy
- [ ] `curl http://127.0.0.1:8001/healthz/` returns 200 on the box
- [ ] HTTPS works, HTTP redirects, `www` works
- [ ] Site content and images present (data + media migrated)
- [ ] Admin login works
- [ ] Portfolio iframe embed still renders
- [ ] `/var/log/nginx/creekcrosby.error.log` empty
- [ ] Nightly backup cron installed and a manual run produced a dump

## Later (same box)

- Move the portfolio here: clone to `/srv/lukasz-pudlo/`, its compose already
  binds `127.0.0.1:8003`; add its vhost + cert, flip its DNS, then remove the
  stack from the CPX32 to free RAM there.
- Wire up error tracking + analytics (SENTRY_DSN / REDIS_URL are already
  plumbed through the settings; left off deliberately for the first cut).
