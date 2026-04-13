import { Provider } from 'jotai';
import { TooltipProvider } from './components/ui/tooltip';
import { SimulationPage } from './pages/SimulationPage';
import { simulationStore } from './store/simulationStore';


function App() {
  return (
    <TooltipProvider>
      <Provider store={simulationStore}>
        <SimulationPage />
      </Provider>
    </TooltipProvider>
  );
}

export default App;
