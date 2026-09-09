"""Wait briefly for the CI preview server to become ready."""
import time
import urllib.request
for attempt in range(60):
    try:
        with urllib.request.urlopen('http://127.0.0.1:4173/', timeout=1) as response:
            if response.status == 200:
                print('Preview server ready')
                break
    except OSError:
        time.sleep(0.5)
else:
    raise SystemExit('Preview server did not start within 30 seconds')
