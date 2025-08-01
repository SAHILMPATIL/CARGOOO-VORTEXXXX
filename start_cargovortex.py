#!/usr/bin/env python3
"""
CargoVortex Unified Launcher
Starts all CargoVortex services simultaneously:
- Main Flask Application (Port 5000)
- Cargo Input Interface (Port 3000)
- Route Temperature Server (Port 5001)
- JSON AR Server (Port 8000)
"""

import os
import sys
import time
import signal
import subprocess
import threading
import webbrowser
from pathlib import Path
import psutil

class CargoVortexLauncher:
    def __init__(self):
        self.base_dir = Path(__file__).parent.absolute()
        self.processes = []
        self.running = True
        
        # Service configurations
        self.services = {
            'main_app': {
                'name': 'CargoVortex Main Dashboard',
                'command': [sys.executable, 'app_modular.py'],
                'cwd': str(self.base_dir),
                'port': 5000,
                'url': 'http://localhost:5000',
                'health_check': '/health'
            },
            'cargo_input': {
                'name': 'Cargo Input Interface',
                'command': [sys.executable, '-m', 'http.server', '3000'],
                'cwd': str(self.base_dir / 'Input_page'),
                'port': 3000,
                'url': 'http://localhost:3000',
                'health_check': '/'
            },
            'json_server': {
                'name': 'JSON AR Server',
                'command': [sys.executable, 'json_server.py'],
                'cwd': str(self.base_dir),
                'port': 8000,
                'url': 'http://localhost:8000',
                'health_check': '/latest_container_plan.json'
            }
        }

    def print_banner(self):
        """Print CargoVortex startup banner"""
        banner = """
╔══════════════════════════════════════════════════════════════════════════════╗
║                              🚛 CARGOVORTEX 🚛                              ║
║                   AI-Enhanced Container Optimization Platform                ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Contributors: Sahil M Patil • Tushar Dhottre • Ashutosh Thaware           ║
╚══════════════════════════════════════════════════════════════════════════════╝
        """
        print(banner)
        print("🚀 Starting all CargoVortex services simultaneously...")
        print("=" * 80)

    def check_port_available(self, port):
        """Check if a port is available"""
        try:
            for conn in psutil.net_connections():
                if conn.laddr.port == port:
                    return False
            return True
        except:
            return True

    def kill_process_on_port(self, port):
        """Kill any process running on the specified port"""
        try:
            for proc in psutil.process_iter(['pid', 'name', 'connections']):
                try:
                    for conn in proc.info['connections']:
                        if conn.laddr.port == port:
                            print(f"🔄 Killing existing process on port {port} (PID: {proc.info['pid']})")
                            proc.terminate()
                            proc.wait(timeout=5)
                            return True
                except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.TimeoutExpired):
                    continue
        except Exception as e:
            print(f"⚠️  Warning: Could not check port {port}: {e}")
        return False

    def start_service(self, service_name, config):
        """Start a single service"""
        try:
            # Check and clear port if needed
            if not self.check_port_available(config['port']):
                print(f"🔄 Port {config['port']} is busy, attempting to free it...")
                self.kill_process_on_port(config['port'])
                time.sleep(2)

            print(f"🚀 Starting {config['name']} on port {config['port']}...")
            
            # Start the process
            process = subprocess.Popen(
                config['command'],
                cwd=config['cwd'],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                universal_newlines=True,
                bufsize=1
            )
            
            self.processes.append({
                'name': service_name,
                'process': process,
                'config': config
            })
            
            return process
            
        except Exception as e:
            print(f"❌ Failed to start {config['name']}: {e}")
            return None

    def monitor_service_output(self, service_name, process, config):
        """Monitor service output in a separate thread"""
        def read_output():
            try:
                while self.running and process.poll() is None:
                    line = process.stdout.readline()
                    if line:
                        # Only show important lines to avoid spam
                        if any(keyword in line.lower() for keyword in 
                               ['error', 'warning', 'started', 'running', 'ready', 'failed']):
                            print(f"[{config['name']}] {line.strip()}")
            except Exception as e:
                if self.running:
                    print(f"❌ Output monitoring error for {config['name']}: {e}")
        
        thread = threading.Thread(target=read_output, daemon=True)
        thread.start()
        return thread

    def wait_for_service(self, config, timeout=30):
        """Wait for a service to become available"""
        import requests
        
        start_time = time.time()
        while time.time() - start_time < timeout:
            try:
                response = requests.get(
                    config['url'] + config.get('health_check', '/'),
                    timeout=2
                )
                if response.status_code < 500:  # Accept any non-server-error response
                    return True
            except requests.exceptions.RequestException:
                pass
            time.sleep(1)
        return False

    def open_browsers(self):
        """Open browser tabs for main interfaces"""
        time.sleep(3)  # Wait a bit for services to stabilize
        
        main_services = ['main_app', 'cargo_input']
        for service_name in main_services:
            if service_name in self.services:
                config = self.services[service_name]
                try:
                    print(f"🌐 Opening {config['name']}: {config['url']}")
                    webbrowser.open(config['url'])
                    time.sleep(1)  # Stagger browser openings
                except Exception as e:
                    print(f"⚠️  Could not open browser for {config['name']}: {e}")

    def start_all_services(self):
        """Start all services simultaneously"""
        self.print_banner()
        
        # Start all services
        monitor_threads = []
        for service_name, config in self.services.items():
            process = self.start_service(service_name, config)
            if process:
                # Start output monitoring
                thread = self.monitor_service_output(service_name, process, config)
                monitor_threads.append(thread)
                time.sleep(1)  # Stagger startup slightly

        print("\n🔄 Waiting for services to initialize...")
        time.sleep(5)

        # Check service health
        print("\n📊 Service Status:")
        print("=" * 50)
        all_healthy = True
        
        for service_name, config in self.services.items():
            if self.wait_for_service(config, timeout=15):
                print(f"✅ {config['name']}: {config['url']}")
            else:
                print(f"❌ {config['name']}: Failed to start on {config['url']}")
                all_healthy = False

        if all_healthy:
            print("\n🎉 All CargoVortex services are running successfully!")
            print("\n🌐 CargoVortex Access Points:")
            print("=" * 50)
            print("📊 Main Dashboard:      http://localhost:5000")
            print("📋 Cargo Input:         http://localhost:3000")
            print(" AR JSON Server:      http://localhost:8000")
            print("\n💡 Features Available:")
            print("   • AI-Enhanced Optimization with Gemini")
            print("   • 3D Container Visualization")
            print("   • Smart Cargo Input with AI Assistance")
            print("   • Temperature Constraint Handling")
            print("   • Excel/CSV Import/Export")
            print("   • Real-time AR Integration")
            
            # Open browsers
            browser_thread = threading.Thread(target=self.open_browsers, daemon=True)
            browser_thread.start()
            
        else:
            print("\n⚠️  Some services failed to start. Check the logs above.")

        return all_healthy

    def cleanup_processes(self):
        """Clean up all processes"""
        print("\n🛑 Shutting down CargoVortex services...")
        self.running = False
        
        for service_info in self.processes:
            try:
                process = service_info['process']
                config = service_info['config']
                print(f"🔄 Stopping {config['name']}...")
                
                process.terminate()
                try:
                    process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    process.kill()
                    process.wait()
                    
            except Exception as e:
                print(f"⚠️  Error stopping {service_info['name']}: {e}")

        print("✅ All services stopped.")

    def run(self):
        """Main run loop"""
        try:
            success = self.start_all_services()
            
            if success:
                print("\n" + "=" * 50)
                print("🚛 CargoVortex is ready! Press Ctrl+C to stop all services.")
                print("=" * 50)
                
                # Keep running until interrupted
                while self.running:
                    time.sleep(1)
                    
        except KeyboardInterrupt:
            print("\n\n🛑 Shutdown requested by user...")
        except Exception as e:
            print(f"\n❌ Unexpected error: {e}")
        finally:
            self.cleanup_processes()


def main():
    """Main entry point"""
    launcher = CargoVortexLauncher()
    
    # Handle Ctrl+C gracefully
    def signal_handler(signum, frame):
        launcher.running = False
        
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    launcher.run()


if __name__ == "__main__":
    main()
