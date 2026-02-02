import { useState, useEffect } from 'react';
import { reverseGeocode } from '../utils/googlePlaces';

/**
 * Custom hook for automatic location detection
 * Detects user location on first visit and stores it
 */
export const useAutoLocation = () => {
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const detectLocation = async () => {
            // Check if location already detected
            const savedLocation = localStorage.getItem('userLocation');
            if (savedLocation) {
                setLocation(JSON.parse(savedLocation));
                return;
            }

            // Check if user denied location before
            const locationDenied = localStorage.getItem('locationDenied');
            if (locationDenied === 'true') {
                return;
            }

            setLoading(true);

            try {
                // Request browser geolocation
                if (!navigator.geolocation) {
                    throw new Error('Geolocation not supported');
                }

                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;

                        try {
                            // Reverse geocode to get address
                            const address = await reverseGeocode(latitude, longitude);

                            const locationData = {
                                latitude,
                                longitude,
                                address,
                                detectedAt: new Date().toISOString()
                            };

                            setLocation(locationData);
                            localStorage.setItem('userLocation', JSON.stringify(locationData));
                            setLoading(false);
                        } catch (geocodeError) {
                            console.error('Geocoding error:', geocodeError);
                            // Still save coordinates even if geocoding fails
                            const locationData = {
                                latitude,
                                longitude,
                                address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
                                detectedAt: new Date().toISOString()
                            };
                            setLocation(locationData);
                            localStorage.setItem('userLocation', JSON.stringify(locationData));
                            setLoading(false);
                        }
                    },
                    (err) => {
                        console.error('Geolocation error:', err);
                        setError(err.message);
                        setLoading(false);

                        // Remember that user denied location
                        if (err.code === 1) { // PERMISSION_DENIED
                            localStorage.setItem('locationDenied', 'true');
                        }
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 0
                    }
                );
            } catch (err) {
                console.error('Location detection error:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        detectLocation();
    }, []);

    const clearLocation = () => {
        localStorage.removeItem('userLocation');
        localStorage.removeItem('locationDenied');
        setLocation(null);
    };

    return { location, loading, error, clearLocation };
};

export default useAutoLocation;
