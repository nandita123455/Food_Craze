
import sys
import os

print(f"Python executable: {sys.executable}")
print(f"Current working directory: {os.getcwd()}")
print(f"Python path: {sys.path}")

try:
    print("Attempting to import models...")
    from models.collaborative_filter import CollaborativeFilter
    print("✅ Imported CollaborativeFilter")
    
    from models.content_based import ContentBasedFilter
    print("✅ Imported ContentBasedFilter")
    
    print("Attempting to import utils...")
    from utils.data_loader import DataLoader
    print("✅ Imported DataLoader")
    
    print("Attempting to import app...")
    # We don't import app directly to avoid starting the server, just check if parsing works
    with open('app.py', 'r') as f:
        compile(f.read(), 'app.py', 'exec')
    print("✅ app.py syntax is correct")

except Exception as e:
    print(f"❌ Import failed: {e}")
    import traceback
    traceback.print_exc()
