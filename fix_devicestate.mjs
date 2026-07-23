import fs from 'fs';

const content = `import { useState, useCallback } from 'react';
import { Role } from '../types';

interface DeviceState {
  viewMode: Role | 'customer';
}

export function useDeviceState() {
  const [state, setState] = useState<DeviceState>({ viewMode: 'customer' });

  const setViewMode = useCallback((mode: Role | 'customer') => {
    setState(s => s.viewMode === mode ? s : { ...s, viewMode: mode });
  }, []);

  return { ...state, setViewMode };
}
`;

fs.writeFileSync('src/hooks/useDeviceState.ts', content);
