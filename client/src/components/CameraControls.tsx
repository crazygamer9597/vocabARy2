import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';

export default function CameraControls() {
  const { setSelectedCameraId, selectedCameraId, setIsCameraAccessDenied } = useApp();
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [isCameraMenuOpen, setIsCameraMenuOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  // Get available cameras
  useEffect(() => {
    let isMounted = true;

    async function getCameras() {
      try {
        // First check if we have permission
        try {
          const permissionStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });

          if (permissionStatus.state === 'denied') {
            console.log('Camera permission denied');
            if (isMounted) {
              setHasCameraPermission(false);
              setIsCameraAccessDenied(true);
            }
            return;
          }
        } catch (permissionError) {
          // Some browsers don't support permission query
          console.log('Permission query not supported, attempting device enumeration directly');
        }

        // Try to get devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');

        if (!isMounted) return;

        if (videoDevices.length === 0) {
          console.log('No cameras found');
          setHasCameraPermission(false);
          return;
        }

        setCameras(videoDevices);
        setHasCameraPermission(true);

        // If no camera is selected, select the first one
        if (!selectedCameraId && videoDevices.length > 0) {
          // Try to find a back camera first on mobile
          const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

          if (isMobile) {
            const backCamera = videoDevices.find(device => 
              device.label.toLowerCase().includes('back') ||
              device.label.toLowerCase().includes('rear') ||
              device.label.toLowerCase().includes('environment')
            );

            if (backCamera) {
              setSelectedCameraId(backCamera.deviceId);
            } else {
              setSelectedCameraId(videoDevices[0].deviceId);
            }
          } else {
            setSelectedCameraId(videoDevices[0].deviceId);
          }
        }
      } catch (error) {
        console.error('Error requesting camera permission:', error);
        if (isMounted) {
          setHasCameraPermission(false);
          setIsCameraAccessDenied(true);
        }
      }
    }

    getCameras();

    return () => {
      isMounted = false;
    };
  }, [setSelectedCameraId, setIsCameraAccessDenied]);

  // Handle camera selection
  const selectCamera = (deviceId: string) => {
    setSelectedCameraId(deviceId);
    setIsCameraMenuOpen(false);
  };

  // If permission denied, don't render controls
  if (hasCameraPermission === false) {
    return null;
  }

  return (
    <div className="absolute bottom-4 right-4 z-20">
      <div className="relative">
        <button 
          className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg"
          onClick={() => setIsCameraMenuOpen(!isCameraMenuOpen)}
          title="Camera options"
        >
          <span className="material-icons text-primary-custom">photo_camera</span>
        </button>

        {isCameraMenuOpen && (
          <div className="absolute right-0 bottom-16 bg-gray-900 rounded-lg shadow-lg p-2 min-w-[200px]">
            <div className="py-1 px-2 text-gray-300 text-xs">Select Camera</div>
            {cameras.map((camera) => (
              <button
                key={camera.deviceId}
                className={`flex items-center w-full text-left px-3 py-2 text-sm rounded-lg my-1 ${
                  selectedCameraId === camera.deviceId 
                    ? 'bg-primary-custom text-white' 
                    : 'text-white hover:bg-gray-800'
                }`}
                onClick={() => selectCamera(camera.deviceId)}
              >
                <span className="material-icons mr-2 text-sm">
                  {camera.label.toLowerCase().includes('back') || 
                   camera.label.toLowerCase().includes('rear') ||
                   camera.label.toLowerCase().includes('environment')
                    ? 'flip_camera_android'
                    : 'camera_front'
                  }
                </span>
                <span className="truncate">
                  {camera.label || `Camera ${cameras.indexOf(camera) + 1}`}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}