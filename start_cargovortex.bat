@echo off
echo.
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║                              🚛 CARGOVORTEX 🚛                              ║
echo ║                   AI-Enhanced Container Optimization Platform                ║
echo ╠══════════════════════════════════════════════════════════════════════════════╣
echo ║  Contributors: Sahil M Patil • Tushar Dhottre • Ashutosh Thaware           ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.
echo 🚀 Starting all CargoVortex services...
echo.

REM Set the base directory
cd /d "%~dp0"

REM Start services in separate windows
echo 📊 Starting Main Dashboard (Port 5000)...
start "CargoVortex Main Dashboard" cmd /k "python app_modular.py"

timeout /t 3 /nobreak >nul

echo 📋 Starting Cargo Input Interface (Port 3000)...
start "CargoVortex Cargo Input" cmd /k "cd Input_page && python -m http.server 3000"

timeout /t 2 /nobreak >nul

echo 🔗 Starting JSON AR Server (Port 8000)...
start "CargoVortex AR Server" cmd /k "python json_server.py"

timeout /t 5 /nobreak >nul

echo.
echo ✅ All CargoVortex services are starting!
echo.
echo 🌐 Access Points:
echo   📊 Main Dashboard:      http://localhost:5000
echo   📋 Cargo Input:         http://localhost:3000  
echo   🗺️  Route Planning:      http://localhost:5001 (auto-started)
echo   🔗 AR JSON Server:      http://localhost:8000
echo.
echo 💡 Opening main interfaces in your browser...

REM Open main interfaces in browser
timeout /t 3 /nobreak >nul
start "" "http://localhost:5000"
timeout /t 2 /nobreak >nul  
start "" "http://localhost:3000"

echo.
echo 🎉 CargoVortex is ready!
echo 📝 Close the terminal windows to stop the services.
echo.
pause
