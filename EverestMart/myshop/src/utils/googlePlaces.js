// Google Places API utility functions
const GOOGLE_MAPS_API_KEY = 'AIzaSyBxYHyG4YD4aNXR84uRcTZQdX6XvxJwxYk';

/**
 * Convert GPS coordinates to address using Google Geocoding API
 */
export const reverseGeocode = async (lat, lng) => {
    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
        );

        const data = await response.json();

        if (data.status === 'OK' && data.results.length > 0) {
            const result = data.results[0];

            // Extract useful components
            const addressComponents = result.address_components;
            let locality = '';
            let city = '';
            let state = '';

            addressComponents.forEach(component => {
                if (component.types.includes('locality')) {
                    locality = component.long_name;
                }
                if (component.types.includes('administrative_area_level_2')) {
                    city = component.long_name;
                }
                if (component.types.includes('administrative_area_level_1')) {
                    state = component.long_name;
                }
            });

            // Build formatted address
            const formattedAddress = locality && state
                ? `${locality}, ${state}`
                : city && state
                    ? `${city}, ${state}`
                    : result.formatted_address;

            return formattedAddress;
        }

        return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
};

/**
 * Load Google Places Autocomplete script
 */
export const loadGoogleMapsScript = () => {
    return new Promise((resolve, reject) => {
        // Check if already loaded
        if (window.google && window.google.maps) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;

        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Google Maps script'));

        document.head.appendChild(script);
    });
};
