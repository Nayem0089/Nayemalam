# ==============================================================================
# ESPORTS TOURNAMENT STANDINGS MANAGER - STANDALONE WINDOWS SERVER
# Runs built-in .NET HttpListener with Zero External Dependencies
# ==============================================================================

$port = 8080
$prefix = "http://localhost:$port/"
$root = $PSScriptRoot
$dataFile = Join-Path $root "tournament_db.json"

Write-Host "==========================================================" -ForegroundColor Red
Write-Host "🔥 WARZONE OFFICIAL - ESPORTS TOURNAMENT STANDINGS MANAGER" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Red
Write-Host "🌐 Starting local HTTP server on: $prefix" -ForegroundColor Green
Write-Host "📁 Root Directory: $root" -ForegroundColor Cyan
Write-Host "💾 Persistent DB File: $dataFile" -ForegroundColor Cyan
Write-Host "👉 Press CTRL+C to stop the server at any time." -ForegroundColor DarkGray
Write-Host "==========================================================" -ForegroundColor Red

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
} catch {
    Write-Host "Failed to start on $prefix. Trying with admin or checking if port is in use." -ForegroundColor Yellow
    exit 1
}

# Auto-open browser
Start-Process "http://localhost:$port/index.html"

# MIME Type Dictionary
$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
    ".woff2"= "font/woff2"
}

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        # Add CORS headers
        $response.AddHeader("Access-Control-Allow-Origin", "*")
        $response.AddHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        $response.AddHeader("Access-Control-Allow-Headers", "Content-Type")

        if ($request.HttpMethod -eq "OPTIONS") {
            $response.StatusCode = 200
            $response.Close()
            continue
        }

        $rawUrl = $request.RawUrl
        $path = $rawUrl.Split('?')[0]

        # REST API Routes
        if ($path -eq "/api/ping") {
            $resJson = '{"status":"ok","server":"Windows Standalone","time":' + [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds() + '}'
            $bytes = [System.Text.Encoding]::UTF8.GetBytes($resJson)
            $response.ContentType = "application/json"
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            $response.Close()
            continue
        }

        if ($path -eq "/api/tournament") {
            if ($request.HttpMethod -eq "POST") {
                $reader = New-Object System.IO.StreamReader($request.InputStream, $request.ContentEncoding)
                $body = $reader.ReadToEnd()
                [System.IO.File]::WriteAllText($dataFile, $body)
                $resJson = '{"success":true,"message":"Saved to local persistent database"}'
                $bytes = [System.Text.Encoding]::UTF8.GetBytes($resJson)
                $response.ContentType = "application/json"
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
                $response.Close()
                continue
            } elseif ($request.HttpMethod -eq "GET") {
                if ([System.IO.File]::Exists($dataFile)) {
                    $jsonContent = [System.IO.File]::ReadAllText($dataFile)
                    $bytes = [System.Text.Encoding]::UTF8.GetBytes($jsonContent)
                } else {
                    $bytes = [System.Text.Encoding]::UTF8.GetBytes('{"data":null}')
                }
                $response.ContentType = "application/json"
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
                $response.Close()
                continue
            }
        }

        # Static File Serving
        if ($path -eq "/" -or $path -eq "") {
            $path = "/index.html"
        }

        $filePath = Join-Path $root ($path.TrimStart('/').Replace('/', '\'))

        if ([System.IO.File]::Exists($filePath)) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = "application/octet-stream"
            if ($mimeTypes.ContainsKey($ext)) {
                $contentType = $mimeTypes[$ext]
            }

            $response.ContentType = $contentType
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
        }

        $response.Close()
    } catch {
        # continue loop
    }
}
