# CargoVortex Unified Launcher - PowerShell Version
# Starts all CargoVortex services simultaneously

param(
    [switch]$NoBrowser,
    [switch]$Quiet
)

# Set console title
$Host.UI.RawUI.WindowTitle = "CargoVortex Launcher"

function Show-Banner {
    if (-not $Quiet) {
        Write-Host ""
        Write-Host "╔══════════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
        Write-Host "║                              🚛 CARGOVORTEX 🚛                              ║" -ForegroundColor Cyan
        Write-Host "║                   AI-Enhanced Container Optimization Platform                ║" -ForegroundColor Cyan
        Write-Host "╠══════════════════════════════════════════════════════════════════════════════╣" -ForegroundColor Cyan
        Write-Host "║  Contributors: Sahil M Patil • Tushar Dhottre • Ashutosh Thaware           ║" -ForegroundColor Cyan
        Write-Host "╚══════════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "🚀 Starting all CargoVortex services simultaneously..." -ForegroundColor Green
        Write-Host "=" * 80 -ForegroundColor Yellow
    }
}

function Test-Port {
    param([int]$Port)
    
    try {
        $connection = Test-NetConnection -ComputerName "localhost" -Port $Port -WarningAction SilentlyContinue
        return $connection.TcpTestSucceeded
    }
    catch {
        return $false
    }
}

function Stop-ProcessOnPort {
    param([int]$Port)
    
    try {
        $processes = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
        foreach ($pid in $processes) {
            Write-Host "🔄 Stopping process on port $Port (PID: $pid)..." -ForegroundColor Yellow
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        }
        Start-Sleep -Seconds 2
    }
    catch {
        # Port might not be in use
    }
}

function Start-CargoVortexService {
    param(
        [string]$Name,
        [string]$Command,
        [string]$WorkingDir,
        [int]$Port,
        [string]$WindowTitle
    )
    
    # Check if port is in use
    if (Test-Port -Port $Port) {
        Write-Host "⚠️  Port $Port is in use. Attempting to free it..." -ForegroundColor Yellow
        Stop-ProcessOnPort -Port $Port
    }
    
    Write-Host "🚀 Starting $Name on port $Port..." -ForegroundColor Green
    
    try {
        $process = Start-Process -FilePath "cmd.exe" -ArgumentList "/k", $Command -WorkingDirectory $WorkingDir -WindowStyle Normal -PassThru
        
        if ($process) {
            # Set window title (requires additional handling for cmd windows)
            Write-Host "✅ $Name started successfully" -ForegroundColor Green
            return $process
        }
        else {
            Write-Host "❌ Failed to start $Name" -ForegroundColor Red
            return $null
        }
    }
    catch {
        Write-Host "❌ Error starting $Name`: $_" -ForegroundColor Red
        return $null
    }
}

function Wait-ForService {
    param(
        [string]$Url,
        [int]$TimeoutSeconds = 30
    )
    
    $timeout = (Get-Date).AddSeconds($TimeoutSeconds)
    
    while ((Get-Date) -lt $timeout) {
        try {
            $response = Invoke-WebRequest -Uri $Url -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
            if ($response.StatusCode -lt 500) {
                return $true
            }
        }
        catch {
            # Service not ready yet
        }
        Start-Sleep -Seconds 1
    }
    return $false
}

function Open-CargoVortexBrowsers {
    if (-not $NoBrowser) {
        Write-Host "🌐 Opening CargoVortex interfaces in browser..." -ForegroundColor Cyan
        
        Start-Sleep -Seconds 3
        
        try {
            Start-Process "http://localhost:5000"
            Start-Sleep -Seconds 2
            Start-Process "http://localhost:3000"
            Write-Host "✅ Browser windows opened" -ForegroundColor Green
        }
        catch {
            Write-Host "⚠️  Could not open browser windows automatically" -ForegroundColor Yellow
        }
    }
}

function Show-ServiceStatus {
    Write-Host ""
    Write-Host "📊 Checking service status..." -ForegroundColor Cyan
    Write-Host "=" * 50 -ForegroundColor Yellow
    
    $services = @(
        @{ Name = "Main Dashboard"; Url = "http://localhost:5000"; Port = 5000 },
        @{ Name = "Cargo Input"; Url = "http://localhost:3000"; Port = 3000 },
        @{ Name = "Route Planning"; Url = "http://localhost:5001"; Port = 5001 },
        @{ Name = "AR JSON Server"; Url = "http://localhost:8000"; Port = 8000 }
    )
    
    $allHealthy = $true
    
    foreach ($service in $services) {
        if (Wait-ForService -Url $service.Url -TimeoutSeconds 10) {
            Write-Host "✅ $($service.Name): $($service.Url)" -ForegroundColor Green
        }
        else {
            Write-Host "❌ $($service.Name): Failed to respond at $($service.Url)" -ForegroundColor Red
            $allHealthy = $false
        }
    }
    
    return $allHealthy
}

function Show-AccessInfo {
    Write-Host ""
    Write-Host "🎉 CargoVortex is running successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 CargoVortex Access Points:" -ForegroundColor Cyan
    Write-Host "=" * 50 -ForegroundColor Yellow
    Write-Host "📊 Main Dashboard:      http://localhost:5000" -ForegroundColor White
    Write-Host "📋 Cargo Input:         http://localhost:3000" -ForegroundColor White
    Write-Host "🗺️  Route Planning:      http://localhost:5001" -ForegroundColor White
    Write-Host "🔗 AR JSON Server:      http://localhost:8000" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 Features Available:" -ForegroundColor Cyan
    Write-Host "   • AI-Enhanced Optimization with Gemini" -ForegroundColor Gray
    Write-Host "   • 3D Container Visualization" -ForegroundColor Gray
    Write-Host "   • Smart Cargo Input with AI Assistance" -ForegroundColor Gray
    Write-Host "   • Temperature Constraint Handling" -ForegroundColor Gray
    Write-Host "   • Excel/CSV Import/Export" -ForegroundColor Gray
    Write-Host "   • Real-time AR Integration" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🛑 To stop all services, close the terminal windows or press Ctrl+C" -ForegroundColor Yellow
}

# Main execution
try {
    Show-Banner
    
    # Get script directory
    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    Set-Location $scriptDir
    
    # Define services to start
    $servicesToStart = @(
        @{
            Name = "Main Dashboard"
            Command = "python app_modular.py"
            WorkingDir = $scriptDir
            Port = 5000
            WindowTitle = "CargoVortex Main Dashboard"
        },
        @{
            Name = "Cargo Input Interface"
            Command = "python -m http.server 3000"
            WorkingDir = Join-Path $scriptDir "Input_page"
            Port = 3000
            WindowTitle = "CargoVortex Cargo Input"
        },
        @{
            Name = "JSON AR Server"
            Command = "python json_server.py"
            WorkingDir = $scriptDir
            Port = 8000
            WindowTitle = "CargoVortex AR Server"
        }
    )
    
    # Start all services
    $processes = @()
    foreach ($service in $servicesToStart) {
        $process = Start-CargoVortexService -Name $service.Name -Command $service.Command -WorkingDir $service.WorkingDir -Port $service.Port -WindowTitle $service.WindowTitle
        if ($process) {
            $processes += $process
        }
        Start-Sleep -Seconds 2
    }
    
    Write-Host ""
    Write-Host "🔄 Waiting for services to initialize..." -ForegroundColor Cyan
    Start-Sleep -Seconds 5
    
    # Check service health
    $allHealthy = Show-ServiceStatus
    
    if ($allHealthy) {
        Show-AccessInfo
        Open-CargoVortexBrowsers
        
        Write-Host ""
        Write-Host "=" * 50 -ForegroundColor Yellow
        Write-Host "🚛 CargoVortex is ready! Close terminal windows to stop services." -ForegroundColor Green
        Write-Host "=" * 50 -ForegroundColor Yellow
        
        # Keep script running
        Write-Host "Press any key to exit launcher (services will continue running)..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    }
    else {
        Write-Host ""
        Write-Host "⚠️  Some services failed to start. Check the terminal windows for details." -ForegroundColor Yellow
        Write-Host "Press any key to continue..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    }
}
catch {
    Write-Host ""
    Write-Host "❌ Error during startup: $_" -ForegroundColor Red
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}
finally {
    Write-Host ""
    Write-Host "Launcher exited. Services continue running in separate windows." -ForegroundColor Cyan
}
