
import asyncio
import os
import sys

# Add parent directory to path
sys.path.append(os.getcwd())

from utils.data_loader import DataLoader

async def main():
    print("Initializing DataLoader...")
    loader = DataLoader()
    await loader.load_data()
    print(f"Loaded {len(loader.products)} products")
    
    print("Testing get_trending_products...")
    try:
        trending = loader.get_trending_products(10)
        print(f"Got {len(trending)} trending products")
        import json
        print(json.dumps(trending, indent=2))
    except Exception as e:
        print(f"Error in get_trending_products: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
