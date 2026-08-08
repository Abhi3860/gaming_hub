import psutil
import time
import requests


API_URL = "localhost"

AUTH_TOKEN = "valid jwt token" 

def get_process(exe_name):
    """Check if the given executable is currently running."""
    for proc in psutil.process_iter(['name']):
        try:
            if proc.info['name'] and proc.info['name'].lower() == exe_name.lower():
                return proc
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            pass
    return None

def main():
    print("=== Gaming Aggregator: Local Playtime Tracker ===")
    exe_name = input("Enter the game executable to track (e.g., game.exe): ")
    game_id = input("Enter the database Game ID for this library item: ")
    
    print(f"\n[WAITING] Monitoring system for {exe_name}...")
    
   
    game_process = None
    while not game_process:
        game_process = get_process(exe_name)
        if not game_process:
            time.sleep(5) 
            
    start_time = time.time()
    print(f"\n[RUNNING] {exe_name} detected! Tracking started at {time.ctime(start_time)}.")
    
    while get_process(exe_name):
        time.sleep(5)
        
    end_time = time.time()
    print(f"\n[STOPPED] {exe_name} closed at {time.ctime(end_time)}.")
    
    seconds_played = end_time - start_time
    hours_played = round(seconds_played / 3600, 4)
    print(f"Session length: {hours_played} hours.")
    
    if hours_played < 0.01:
        print("Session too short. Not updating database.")
        return

    headers = {"Authorization": f"Bearer {AUTH_TOKEN}"}
    payload = {"added_hours": hours_played}
    endpoint = f"{API_URL}/library/{game_id}/playtime"
    
    print(f"\n[SYNCING] Sending data to backend...")
    try:
        response = requests.patch(endpoint, json=payload, headers=headers)
        if response.status_code == 200:
            print("Success! Database updated.")
            print(response.json()["message"])
        else:
            print(f"Failed to update database. Error {response.status_code}: {response.text}")
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to the FastAPI server. Is it running?")

if __name__ == "__main__":
    main()