import { useEffect } from 'react';

export function useCallDetection() {
  useEffect(() => {
    // Call detection is currently disabled to ensure the build remains stable.
    // I am working on a more robust native implementation.
    console.log('Call detection hook initialized (standby)');
  }, []);
}
