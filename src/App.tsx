import { MapView } from "./components/map/MapView";
import { useStations } from "./hooks/useStations";

function App() {
  const { stations, chargers, chargerStates } = useStations();

  return (
    <div className="h-screen w-screen relative bg-slate-950 text-white">
      <MapView stations={stations} chargers={chargers} chargerStates={chargerStates} />
    </div>
  );
}

export default App;