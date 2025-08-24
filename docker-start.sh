#!/bin/bash

# Docker container start script for YouTube Downloader
# Handles PUID/PGID for Unraid compatibility

set -e

echo "🎥 YouTube Downloader - Container Starting"
echo "=========================================="

# Get PUID and PGID from environment variables
PUID=${PUID:-1000}
PGID=${PGID:-1000}

echo "📋 Container Configuration:"
echo "   PUID: $PUID"
echo "   PGID: $PGID"
echo "   Downloads: /var/www/html/P/youtube"

# Create user/group if they don't exist
if ! getent group $PGID >/dev/null 2>&1; then
    groupadd -g $PGID appgroup
    echo "✅ Created group with GID: $PGID"
else
    echo "✅ Group with GID $PGID already exists"
fi

if ! getent passwd $PUID >/dev/null 2>&1; then
    useradd -u $PUID -g $PGID -M -s /bin/bash appuser
    echo "✅ Created user with UID: $PUID"
else
    echo "✅ User with UID $PUID already exists"
fi

# Set ownership and permissions for download directory
chown -R $PUID:$PGID /var/www/html/P/youtube
chmod -R 755 /var/www/html/P/youtube

# Set ownership for web files (keep as www-data for Apache)
chown -R www-data:www-data /var/www/html
chmod -R 755 /var/www/html

# Ensure download directory is accessible by both www-data and the specified user
chgrp -R $PGID /var/www/html/P/youtube
chmod -R 775 /var/www/html/P/youtube

echo "✅ Permissions configured"
echo "🚀 Starting Apache..."

# Start Apache in foreground
exec apache2-foreground