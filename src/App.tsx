import { TooltipProvider } from './components/ui/tooltip';
import { SimulationPage } from './pages/SimulationPage';

function App() {
  return (
    <TooltipProvider>
      <SimulationPage />
    </TooltipProvider>
  );
}

export default App;