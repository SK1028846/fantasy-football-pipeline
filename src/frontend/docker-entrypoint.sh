#!/bin/sh

# Inject environment variables into the built index.html
# This injects the runtime env vars into the HTML before serving

# Debug: Log environment variables
echo "=== Environment Variables Debug ==="
echo "VITE_AUTH0_DOMAIN: ${VITE_AUTH0_DOMAIN:-NOT SET}"
echo "VITE_AUTH0_CLIENT_ID: ${VITE_AUTH0_CLIENT_ID:-NOT SET}"
echo "VITE_AUTH0_AUDIENCE: ${VITE_AUTH0_AUDIENCE:-NOT SET}"
echo "VITE_AUTH0_REDIRECT_URI: ${VITE_AUTH0_REDIRECT_URI:-NOT SET}"
echo "VITE_API_BASE_URL: ${VITE_API_BASE_URL:-NOT SET}"
echo "==================================="

# Check if index.html exists
INDEX_FILE="/usr/share/nginx/html/index.html"
if [ ! -f "$INDEX_FILE" ]; then
  echo "ERROR: index.html not found at $INDEX_FILE"
  exit 1
fi

echo "Found index.html, size: $(wc -c < "$INDEX_FILE") bytes"

# Check if environment variables are set
if [ -z "$VITE_AUTH0_DOMAIN" ] || [ -z "$VITE_AUTH0_CLIENT_ID" ]; then
  echo "WARNING: Auth0 environment variables are not set!"
  echo "VITE_AUTH0_DOMAIN: ${VITE_AUTH0_DOMAIN:-NOT SET}"
  echo "VITE_AUTH0_CLIENT_ID: ${VITE_AUTH0_CLIENT_ID:-NOT SET}"
  echo "Continuing anyway, but the app may not work correctly..."
fi

# Remove any existing window.__ENV__ blocks and orphaned script tags
echo "Removing existing window.__ENV__ blocks..."
# Use awk to properly handle script tag removal
awk '
  BEGIN { in_env_script = 0; skip_until_close = 0 }
  /<script>/ {
    # Check if next line(s) contain window.__ENV__
    line = $0
    if (getline > 0) {
      if (/window\.__ENV__/) {
        # Skip this entire script block
        skip_until_close = 1
        while (getline > 0 && !/<\/script>/) {
          # Skip all content
        }
        skip_until_close = 0
        next
      } else {
        # Not a window.__ENV__ script, keep both lines
        print line
        print
        next
      }
    } else {
      # EOF
      print line
      next
    }
  }
  skip_until_close && /<\/script>/ {
    skip_until_close = 0
    next
  }
  !skip_until_close {
    print
  }
' "$INDEX_FILE" > /tmp/index_no_env.html
mv /tmp/index_no_env.html "$INDEX_FILE"

# Check if </body> tag exists
if ! grep -q "</body>" "$INDEX_FILE"; then
  echo "ERROR: </body> tag not found in index.html"
  echo "First 20 lines of index.html:"
  head -20 "$INDEX_FILE"
  exit 1
fi

# Create the environment variables script block and inject it before </body>
echo "Injecting environment variables into index.html..."

# Ensure we have default values to avoid empty strings
DOMAIN="${VITE_AUTH0_DOMAIN:-}"
CLIENT_ID="${VITE_AUTH0_CLIENT_ID:-}"
AUDIENCE="${VITE_AUTH0_AUDIENCE:-}"
REDIRECT_URI="${VITE_AUTH0_REDIRECT_URI:-}"
API_URL="${VITE_API_BASE_URL:-}"

# Use awk to inject the script before </body>
echo "Attempting to inject script before </body> tag..."
awk -v domain="$DOMAIN" \
    -v clientId="$CLIENT_ID" \
    -v audience="$AUDIENCE" \
    -v redirectUri="$REDIRECT_URI" \
    -v apiUrl="$API_URL" \
    '{
      if ($0 ~ /<\/body>/) {
        print "    <script>"
        print "      window.__ENV__ = {"
        print "        VITE_AUTH0_DOMAIN: '\''" domain "'\'',"
        print "        VITE_AUTH0_CLIENT_ID: '\''" clientId "'\'',"
        print "        VITE_AUTH0_AUDIENCE: '\''" audience "'\'',"
        print "        VITE_AUTH0_REDIRECT_URI: '\''" redirectUri "'\'',"
        print "        VITE_API_BASE_URL: '\''" apiUrl "'\''"
        print "      };"
        print "    </script>"
      }
      print
    }' "$INDEX_FILE" > /tmp/index.html

# Check if the temp file was created
if [ ! -f /tmp/index.html ]; then
  echo "✗ ERROR: Failed to create /tmp/index.html"
  exit 1
fi

echo "Temp file created, size: $(wc -c < /tmp/index.html) bytes"

# Verify the injection worked
if ! grep -q "window.__ENV__" /tmp/index.html; then
  echo "✗ ERROR: Failed to inject environment variables!"
  echo "Checking if </body> tag is still present:"
  grep -n "</body>" /tmp/index.html || echo "  </body> tag not found!"
  echo "Checking for window.__ENV__ in temp file:"
  grep -n "window.__ENV__" /tmp/index.html || echo "  window.__ENV__ not found!"
  echo "Last 15 lines of /tmp/index.html:"
  tail -15 /tmp/index.html
  echo "First 5 lines of /tmp/index.html:"
  head -5 /tmp/index.html
  exit 1
fi

# Move the updated file back
mv /tmp/index.html "$INDEX_FILE"
echo "✓ Environment variables injected successfully."
echo "Verification: window.__ENV__ found in index.html"

# Update nginx config with Kubernetes DNS resolver
echo "Configuring nginx resolver for Kubernetes DNS..."
# Try to get DNS IP from /etc/resolv.conf (Kubernetes sets this)
if [ -f /etc/resolv.conf ]; then
  DNS_IP=$(grep -E '^nameserver' /etc/resolv.conf | awk '{print $2}' | head -1)
  echo "Found DNS IP in /etc/resolv.conf: ${DNS_IP:-NOT FOUND}"
else
  DNS_IP=""
fi

# Fallback to default Kubernetes DNS IP if not found
DNS_IP="${DNS_IP:-10.96.0.10}"

echo "Using DNS resolver: $DNS_IP"

# Resolve backend service IP address
echo "Resolving backend service IP..."
# Try to resolve using host command (cleaner output)
BACKEND_IP=$(host backend-service.default.svc.cluster.local 2>/dev/null | grep "has address" | awk '{print $4}' | head -1)
if [ -z "$BACKEND_IP" ]; then
  # Try shorter name
  BACKEND_IP=$(host backend-service.default 2>/dev/null | grep "has address" | awk '{print $4}' | head -1)
fi
if [ -z "$BACKEND_IP" ]; then
  # Try shortest name (same namespace)
  BACKEND_IP=$(host backend-service 2>/dev/null | grep "has address" | awk '{print $4}' | head -1)
fi

if [ -n "$BACKEND_IP" ] && [ "$BACKEND_IP" != "127.0.0.1" ]; then
  echo "Resolved backend-service to IP: $BACKEND_IP"
else
  echo "WARNING: Could not resolve backend-service via host command, trying nslookup..."
  # Fallback to nslookup
  BACKEND_IP=$(nslookup backend-service.default.svc.cluster.local 2>/dev/null | grep -A1 "Name:" | grep "Address:" | awk '{print $2}' | head -1)
  if [ -z "$BACKEND_IP" ] || [ "$BACKEND_IP" = "127.0.0.1" ]; then
    echo "WARNING: Could not resolve backend-service, will use DNS name (may cause issues)"
    BACKEND_IP="backend-service.default.svc.cluster.local"
  else
    echo "Resolved backend-service to IP via nslookup: $BACKEND_IP"
  fi
fi

# Update nginx config with the detected DNS IP and backend IP
if [ -f /etc/nginx/conf.d/default.conf ]; then
  # Replace resolver line, or add it if it doesn't exist
  if grep -q "^[[:space:]]*resolver" /etc/nginx/conf.d/default.conf; then
    sed -i "s/resolver [0-9.]*/resolver $DNS_IP valid=30s ipv6=off/" /etc/nginx/conf.d/default.conf
  else
    # Add resolver after server_name line
    sed -i "/server_name/a\\    resolver $DNS_IP valid=30s ipv6=off;" /etc/nginx/conf.d/default.conf
  fi
  
  # Replace backend IP placeholder in upstream block
  if grep -q "BACKEND_IP_PLACEHOLDER" /etc/nginx/conf.d/default.conf; then
    sed -i "s/BACKEND_IP_PLACEHOLDER/$BACKEND_IP/g" /etc/nginx/conf.d/default.conf
    echo "✓ Nginx configuration updated with backend IP: $BACKEND_IP"
  elif grep -q "server backend-service" /etc/nginx/conf.d/default.conf; then
    sed -i "s/server backend-service[^;]*/server $BACKEND_IP:3000/" /etc/nginx/conf.d/default.conf
    echo "✓ Nginx configuration updated with backend IP: $BACKEND_IP"
  fi
  
  echo "✓ Nginx configuration updated with DNS resolver: $DNS_IP"
  
  # Test nginx configuration and show errors if any
  echo "Testing nginx configuration..."
  if nginx -t; then
    echo "✓ Nginx configuration is valid"
  else
    echo "✗ ERROR: Nginx configuration test failed!"
    echo "Showing nginx config for debugging:"
    cat /etc/nginx/conf.d/default.conf
    exit 1
  fi
else
  echo "✗ ERROR: Nginx config file not found at /etc/nginx/conf.d/default.conf"
  exit 1
fi

# Execute the main command
exec "$@"
