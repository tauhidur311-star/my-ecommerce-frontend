# Complete cache clearing script for React development

Write-Host "🧹 Clearing all React caches..." -ForegroundColor Green

# Stop all node processes
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

# Clear build artifacts
Remove-Item -Path "build" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "✅ Cleared build directory" -ForegroundColor Yellow

# Clear webpack cache
Remove-Item -Path "node_modules/.cache" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "✅ Cleared webpack cache" -ForegroundColor Yellow

# Clear ESLint cache
Remove-Item -Path ".eslintcache" -Force -ErrorAction SilentlyContinue
Write-Host "✅ Cleared ESLint cache" -ForegroundColor Yellow

# Clear service worker files
Remove-Item -Path "public/sw.js" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "public/workbox-*" -Force -ErrorAction SilentlyContinue
Write-Host "✅ Cleared service worker files" -ForegroundColor Yellow

# Clear npm cache
npm cache clean --force --silent
Write-Host "✅ Cleared npm cache" -ForegroundColor Yellow

# Clear Windows DNS cache
Clear-DnsClientCache -ErrorAction SilentlyContinue
Write-Host "✅ Cleared DNS cache" -ForegroundColor Yellow

Write-Host "🎉 Cache clearing complete!" -ForegroundColor Green
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Close all browser windows" -ForegroundColor White
Write-Host "   2. Open new incognito window" -ForegroundColor White  
Write-Host "   3. Navigate to http://localhost:3000" -ForegroundColor White
Write-Host "   4. Check DevTools for clean console" -ForegroundColor White