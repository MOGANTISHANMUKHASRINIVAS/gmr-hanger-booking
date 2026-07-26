# Lightweight Windows PowerShell Localhost Web Server for GMR Aero Technic Booking System
$port = 8080
$prefix = "http://localhost:$port/"
$root = $PSScriptRoot

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
    Write-Host "=========================================================" -ForegroundColor Cyan
    Write-Host " GMR Aero Technic Hangar Booking System Server Started!  " -ForegroundColor Green
    Write-Host " Localhost URL: $prefix" -ForegroundColor Yellow
    Write-Host " Press Ctrl+C or kill task to stop server.              " -ForegroundColor Gray
    Write-Host "=========================================================" -ForegroundColor Cyan
} catch {
    Write-Host "Failed to start HttpListener on $prefix : $_" -ForegroundColor Red
    exit 1
}

# Open browser automatically
Start-Process $prefix

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $path = $request.Url.LocalPath
        if ($path -eq "/") { $path = "/index.html" }

        $distPath = Join-Path (Join-Path $root "dist") $path.TrimStart('/')
        if (Test-Path $distPath -PathType Leaf) {
            $localPath = $distPath
        } else {
            $localPath = Join-Path $root $path.TrimStart('/')
        }

        if (Test-Path $localPath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($localPath)
            
            # Content Type mapping
            $ext = [System.IO.Path]::GetExtension($localPath).ToLower()
            switch ($ext) {
                ".html" { $response.ContentType = "text/html; charset=utf-8" }
                ".js"   { $response.ContentType = "application/javascript; charset=utf-8" }
                ".css"  { $response.ContentType = "text/css; charset=utf-8" }
                ".jpg"  { $response.ContentType = "image/jpeg" }
                ".jpeg" { $response.ContentType = "image/jpeg" }
                ".png"  { $response.ContentType = "image/png" }
                ".json" { $response.ContentType = "application/json" }
                default { $response.ContentType = "application/octet-stream" }
            }

            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.ContentLength64 = $msg.Length
            $response.OutputStream.Write($msg, 0, $msg.Length)
        }

        $response.Close()
    } catch {
        # Catch cancellation or disconnect
    }
}
