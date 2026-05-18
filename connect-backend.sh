#!/bin/bash
# Run this once Railway gives you the backend URL.
# Usage: ./connect-backend.sh https://your-backend.up.railway.app

BACKEND_URL="${1}"

if [ -z "$BACKEND_URL" ]; then
  echo "Usage: ./connect-backend.sh https://your-backend.up.railway.app"
  exit 1
fi

API_URL="${BACKEND_URL}/api"

echo "Updating Vercel NEXT_PUBLIC_API_URL to: $API_URL"

cd apps/frontend

# Remove old value and set new one
vercel env rm NEXT_PUBLIC_API_URL production --yes 2>/dev/null || true
echo "$API_URL" | vercel env add NEXT_PUBLIC_API_URL production

echo ""
echo "Redeploying frontend to Vercel..."
vercel --prod --yes

echo ""
echo "Done! Frontend is now connected to backend at $API_URL"
