import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';

export default function CameraControls() {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);
  const { isCameraAccessDenied, setIsCameraAccessDenied } = useApp();

  // Request camera permission and get available cameras
  useEffect(() => {
    const checkPermissionAndGetCameras = async () => {
      try {
        // Check if permissions are already granted
        const permissions = await navigator.permissions.query({ name: 'camera' as PermissionName });
        if (permissions.state === 'granted') {
          setHasCameraPermission(true);
          getAvailableCameras();
        } else if (permissions.state === 'denied') {
          setHasCameraPermission(false);
          setIsCameraAccessDenied(true);
        } else {
          // Request permission
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(track => track.stop()); // Stop the stream once we have permission
            setHasCameraPermission(true);
            setIsCameraAccessDenied(false);
            getAvailableCameras();
          } catch (error) {
            console.error('Error requesting camera permission:', error);
            setHasCameraPermission(false);
            setIsCameraAccessDenied(true);
          }
        }
      } catch (error) {
        console.error('Error checking camera permission:', error);
      }
    };

    checkPermissionAndGetCameras();
  }, [setIsCameraAccessDenied]);

  // Get available cameras
  const getAvailableCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      setAvailableCameras(cameras);
      
      // If no camera is selected yet and we have cameras available, select the first one
      if (!selectedCameraId && cameras.length > 0) {
        // By default, try to select the back camera (typically more useful for object detection)
        const backCamera = cameras.find(camera => 
          camera.label.toLowerCase().includes('back') || 
          camera.label.toLowerCase().includes('rear'));
        
        if (backCamera) {
          setSelectedCameraId(backCamera.deviceId);
        } else if (cameras.length > 0) {
          setSelectedCameraId(cameras[0].deviceId);
        }
      }
    } catch (error) {
      console.error('Error enumerating cameras:', error);
    }
  };

  // Request permission again if initially denied
  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop()); // Stop the stream once we have permission
      setHasCameraPermission(true);
      setIsCameraAccessDenied(false);
      getAvailableCameras();
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      setHasCameraPermission(false);
      setIsCameraAccessDenied(true);
    }
  };

  // Switch camera
  const switchCamera = (deviceId: string) => {
    setSelectedCameraId(deviceId);
    // The actual camera stream handling will be done in the parent component
    window.localStorage.setItem('selectedCameraId', deviceId);
  };

  if (hasCameraPermission === false || isCameraAccessDenied) {
    return (
      <div className="fixed bottom-20 left-0 right-0 mx-auto w-full max-w-sm p-4 bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-lg backdrop-blur-sm border-2 z-10" style={{ borderColor: '#8F87F1' }}>
        <div className="flex items-center justify-center mb-4">
          <span className="material-icons text-red-500 text-3xl mr-2">videocam_off</span>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">Camera Access Required</h3>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 text-center">
          vocabARy needs camera access to detect objects around you. Please enable camera access in your browser settings.
        </p>
        <button 
          onClick={requestCameraPermission}
          className="w-full py-2 px-4 rounded-lg text-white font-medium"
          style={{ background: 'linear-gradient(90deg, #8F87F1, #C68EFD)' }}
        >
          Request Camera Access
        </button>
      </div>
    );
  }

  if (availableCameras.length <= 1) {
    // If only one camera is available, don't show the controls
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 rounded-full shadow-lg z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2" style={{ borderColor: '#8F87F1' }}>
      <button 
        onClick={() => {
          // Find the next camera in the list
          const currentIndex = availableCameras.findIndex(camera => camera.deviceId === selectedCameraId);
          const nextIndex = (currentIndex + 1) % availableCameras.length;
          switchCamera(availableCameras[nextIndex].deviceId);
        }}
        className="flex items-center justify-center w-12 h-12 text-white rounded-full"
        style={{ background: 'linear-gradient(90deg, #8F87F1, #C68EFD)' }}
        aria-label="Switch Camera"
      >
        <span className="material-icons">flip_camera_android</span>
      </button>
    </div>
  );
}