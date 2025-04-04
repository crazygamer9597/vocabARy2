import { useState, useEffect, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';

export default function CameraControls() {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Get the app context
  const { 
    isCameraAccessDenied, 
    setIsCameraAccessDenied,
    selectedCameraId,
    setSelectedCameraId
  } = useApp();

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
      
      console.log('Available cameras:', cameras.map(cam => cam.label || 'Unnamed camera'));
      setAvailableCameras(cameras);
      
      // Try to use the camera ID from localStorage if available
      const savedCameraId = localStorage.getItem('selectedCameraId');
      
      // If no camera is selected yet and we have cameras available, select one
      if (!selectedCameraId && cameras.length > 0) {
        // First try to use saved camera
        if (savedCameraId && cameras.some(cam => cam.deviceId === savedCameraId)) {
          setSelectedCameraId(savedCameraId);
        } else {
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
    localStorage.setItem('selectedCameraId', deviceId);
    setIsDropdownOpen(false);
  };

  // Get camera name for display
  const getCurrentCameraName = () => {
    const currentCamera = availableCameras.find(cam => cam.deviceId === selectedCameraId);
    return currentCamera?.label || 'Camera';
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

  // Show camera dropdown for desktop
  return (
    <div 
      ref={dropdownRef}
      className="fixed bottom-20 right-4 z-10"
    >
      {/* Main camera button */}
      <button 
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center justify-center shadow-lg px-4 py-2 text-white rounded-full"
        style={{ background: 'linear-gradient(90deg, #8F87F1, #C68EFD)' }}
        aria-label="Camera options"
      >
        <span className="material-icons mr-2">videocam</span>
        <span className="hidden sm:inline-block max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap">
          {getCurrentCameraName()}
        </span>
        <span className="material-icons ml-1">{isDropdownOpen ? 'expand_less' : 'expand_more'}</span>
      </button>
      
      {/* Camera dropdown */}
      {isDropdownOpen && (
        <div className="absolute right-0 bottom-full mb-2 w-64 overflow-hidden bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
          <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Camera</h3>
          </div>
          <div className="max-h-60 overflow-y-auto py-1">
            {availableCameras.map((camera) => (
              <button
                key={camera.deviceId}
                onClick={() => switchCamera(camera.deviceId)}
                className={`flex items-center w-full px-4 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 
                  ${selectedCameraId === camera.deviceId ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
              >
                <span className="material-icons mr-2 text-sm text-gray-700 dark:text-gray-300">
                  {camera.label.toLowerCase().includes('back') || camera.label.toLowerCase().includes('rear')
                    ? 'camera_rear' 
                    : camera.label.toLowerCase().includes('front') || camera.label.toLowerCase().includes('user')
                      ? 'camera_front'
                      : 'camera_alt'
                  }
                </span>
                <span className="flex-1 truncate text-left">
                  {camera.label || `Camera ${availableCameras.indexOf(camera) + 1}`}
                </span>
                {selectedCameraId === camera.deviceId && (
                  <span className="material-icons text-sm text-green-500">check</span>
                )}
              </button>
            ))}
          </div>
          
          {/* Quick switch button at bottom */}
          <div className="p-2 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                const currentIndex = availableCameras.findIndex(camera => camera.deviceId === selectedCameraId);
                const nextIndex = (currentIndex + 1) % availableCameras.length;
                switchCamera(availableCameras[nextIndex].deviceId);
              }}
              className="flex items-center justify-center w-full py-1.5 px-3 text-sm rounded text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <span className="material-icons mr-1 text-sm">switch_camera</span>
              Switch to Next Camera
            </button>
          </div>
        </div>
      )}
    </div>
  );
}