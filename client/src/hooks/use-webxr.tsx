import { useState, useEffect, useRef, RefObject } from 'react';

export function useWebXR(canvasRef: RefObject<HTMLCanvasElement>) {
  const [arSupported, setARSupported] = useState(false);
  const [arActive, setARActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const sessionRef = useRef<XRSession | null>(null);
  const xrButtonRef = useRef<HTMLButtonElement | null>(null);
  
  // Check for WebXR support
  useEffect(() => {
    // Check if WebXR is available
    if ('xr' in navigator) {
      navigator.xr?.isSessionSupported('immersive-ar')
        .then(supported => {
          setARSupported(supported);
        })
        .catch(err => {
          setError('Error checking AR support: ' + err.message);
          setARSupported(false);
        });
    } else {
      setError('WebXR not available in this browser');
      setARSupported(false);
    }
  }, []);
  
  // Initialize AR session
  const initAR = async () => {
    if (!arSupported || !canvasRef.current) {
      setError('AR not supported or canvas not available');
      return;
    }
    
    try {
      // Request a session
      const session = await navigator.xr?.requestSession('immersive-ar', {
        requiredFeatures: ['hit-test', 'dom-overlay'],
        domOverlay: { root: document.body }
      });
      
      if (!session) {
        throw new Error('Failed to create XR session');
      }
      
      sessionRef.current = session;
      
      // Set up session
      const gl = canvasRef.current.getContext('webgl', { xrCompatible: true });
      if (!gl) {
        throw new Error('WebGL not available');
      }
      
      // Bind the WebGL context to the XR session
      await session.updateRenderState({
        baseLayer: new XRWebGLLayer(session, gl)
      });
      
      // Setup event listeners
      session.addEventListener('end', () => {
        setARActive(false);
        sessionRef.current = null;
      });
      
      setARActive(true);
      
      // Handle session end
      session.addEventListener('end', () => {
        sessionRef.current = null;
        setARActive(false);
      });
      
    } catch (err: any) {
      setError('Error starting AR: ' + err.message);
    }
  };
  
  // End AR session
  const endAR = () => {
    if (sessionRef.current) {
      sessionRef.current.end().catch(err => {
        console.error('Error ending AR session:', err);
      });
    }
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sessionRef.current) {
        sessionRef.current.end().catch(err => {
          console.error('Error ending AR session on cleanup:', err);
        });
      }
    };
  }, []);
  
  return {
    arSupported,
    arActive,
    error,
    initAR,
    endAR
  };
}
