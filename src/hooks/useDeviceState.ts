import { useState, useEffect, useCallback } from 'react';
import { Role } from '../types';

interface DeviceState {
  viewMode: Role | 'customer';
}

export function useDeviceState() {
  const [state, setState] = useState<DeviceState>(() => {
    const saved = localStorage.getItem('manifest_device_state');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return { viewMode: 'customer' };
  });

  useEffect(() => {
    localStorage.setItem('manifest_device_state', JSON.stringify(state));
  }, [state]);

  const setViewMode = useCallback((mode: Role | 'customer') => {
    setState(s => s.viewMode === mode ? s : { ...s, viewMode: mode });
  }, []);

  return { ...state, setViewMode };
}
