import { useState } from 'react';
import { MapView } from './components/map/MapView';
import { StartSimulationButton } from './components/SimulationSetup/StartSimulationButton';
import { SimulationSetupForm } from './components/SimulationSetup/SimulationSetupForm';

function App() {
  const [isSetupOpen, setIsSetupOpen] = useState(false);

  return (
    <div className="relative h-screen w-screen bg-slate-950 text-white">
      <MapView />

      {!isSetupOpen && (
        <div className="absolute left-6 top-6 z-[1000] w-64">
          <StartSimulationButton onOpen={() => setIsSetupOpen(true)} />
        </div>
      )}

      {isSetupOpen && (
        <div className="absolute inset-0 z-[5000] flex items-center justify-center p-6">
          <div className="w-full max-w-4xl">
            <SimulationSetupForm onClose={() => setIsSetupOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;