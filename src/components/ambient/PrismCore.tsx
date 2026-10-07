import React from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';

export const PrismCore: React.FC = () => {
  const { settings } = useWorkspace();
  return <div className={`pimx-prism-scene ${settings.animationsEnabled ? '' : 'pimx-still'}`}>
    <div className="pimx-prism-backlight" />
    <div className="pimx-prism-orbit pimx-prism-orbit-one"><i /><i /></div>
    <div className="pimx-prism-orbit pimx-prism-orbit-two"><i /><i /></div>
    <div className="pimx-prism-orbit pimx-prism-orbit-three" />
    <div className="pimx-prism-float">
      <div className="pimx-prism-cube">
        {['front', 'back', 'right', 'left', 'top', 'bottom'].map((face) => <span key={face} className={`pimx-face pimx-face-${face}`} />)}
        <span className="pimx-prism-heart" />
      </div>
    </div>
    <div className="pimx-prism-platform" />
    <span className="pimx-prism-satellite pimx-satellite-a" />
    <span className="pimx-prism-satellite pimx-satellite-b" />
    <span className="pimx-prism-satellite pimx-satellite-c" />
  </div>;
};
