import { MapView } from "./components/MapView";

function App() {
  return (
    <div className="h-screen w-screen relative bg-slate-950 text-white">
      {/* Map */}
      <MapView />

      {/* Overlay UI */}
      <div className="absolute top-6 right-6 z-[1000]">
        <h1 className="text-3xl font-bold text-emerald-400 bg-slate-900/80 px-4 py-2 rounded-xl shadow-lg">
          Smart EV Visualisation
        </h1>
      </div>
    </div>
  );
}

export default App;