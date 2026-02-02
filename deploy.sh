#!/bin/bash
cd c:\\Users\\thiag\\Documents\\Projetos\\block-gate-pass-23

echo "Adding environment variables to Vercel..."

# Add variables to production environment
echo "hsesjkiqblfqcehzbnhc" | vercel env add VITE_SUPABASE_PROJECT_ID production
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzZXNqa2lxYmxmcWNlaHpibmhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDYxMTAsImV4cCI6MjA2OTcyMjExMH0.OzRJ3xleg7Oa5nPoMPzF5vFyG7yXaTZFwm-haTegXPQ" | vercel env add VITE_SUPABASE_PUBLISHABLE_KEY production
echo "https://hsesjkiqblfqcehzbnhc.supabase.co" | vercel env add VITE_SUPABASE_URL production

echo "Redeploying..."
vercel --prod --yes

echo "Done!"
