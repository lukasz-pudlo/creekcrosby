#!/usr/bin/env bash
# One-time bootstrap for a FRESH Hetzner Cloud VPS (Ubuntu 24.04), bringing it
# to the same baseline as the existing CPX32 box: deploy user, hardened SSH,
# UFW 22/80/443, Docker, host Nginx + certbot, shared header snippets, swap,
# /srv layout.
#
# Run as root on the new box. The repo isn't cloned yet at that point, so copy
# the deploy/ directory up first and run from there:
#
#   scp -r deploy root@<NEW_IP>:/root/deploy
#   ssh root@<NEW_IP> 'bash /root/deploy/bootstrap-server.sh'
#
# The script is idempotent — safe to re-run after a partial failure.
# It prompts once, at the end, for the deploy user's sudo password.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ $EUID -ne 0 ]]; then
    echo "Run as root." >&2
    exit 1
fi

echo "==> deploy user"
if ! id deploy &>/dev/null; then
    adduser --disabled-password --gecos "" deploy
fi
usermod -aG sudo deploy
install -d -m 700 -o deploy -g deploy /home/deploy/.ssh
# Reuse the key Hetzner installed for root at server creation.
if [[ -f /root/.ssh/authorized_keys ]]; then
    cp /root/.ssh/authorized_keys /home/deploy/.ssh/authorized_keys
    chown deploy:deploy /home/deploy/.ssh/authorized_keys
    chmod 600 /home/deploy/.ssh/authorized_keys
fi

echo "==> packages"
export DEBIAN_FRONTEND=noninteractive
# Restart services automatically instead of hanging apt on a needrestart prompt.
mkdir -p /etc/needrestart/conf.d
echo "\$nrconf{restart} = 'a';" > /etc/needrestart/conf.d/50-autorestart.conf
apt-get update
apt-get -y upgrade
apt-get install -y docker.io docker-compose-v2 nginx certbot python3-certbot-nginx git ufw unattended-upgrades rsync
usermod -aG docker deploy
systemctl enable --now docker nginx

echo "==> swap (small box insurance)"
if ! swapon --show | grep -q /swapfile; then
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    grep -q '^/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi
sysctl -w vm.swappiness=10 >/dev/null
grep -q '^vm.swappiness' /etc/sysctl.d/99-swappiness.conf 2>/dev/null \
    || echo 'vm.swappiness=10' > /etc/sysctl.d/99-swappiness.conf

echo "==> firewall"
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo "==> nginx snippets"
cp "${SCRIPT_DIR}/nginx/snippets/"*.conf /etc/nginx/snippets/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo "==> /srv layout"
install -d -o deploy -g deploy /srv/creekcrosby /srv/creekcrosby/media /srv/backups

echo "==> SSH hardening (root login + password auth off)"
sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
# Hetzner cloud-init drops its own override; neutralise it if present.
if [[ -d /etc/ssh/sshd_config.d ]]; then
    printf 'PermitRootLogin no\nPasswordAuthentication no\n' > /etc/ssh/sshd_config.d/99-hardening.conf
fi
systemctl restart ssh

echo "==> set a sudo password for the deploy user"
passwd deploy

echo
echo "Bootstrap done. Log in as deploy@<NEW_IP> from now on — root SSH is disabled."
echo "Next: deploy/DEPLOY_TO_HETZNER.md step 3 (GitHub deploy key + clone)."
