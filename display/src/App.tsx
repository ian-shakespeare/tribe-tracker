import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { MapContainer, TileLayer } from "react-leaflet";

function App() {
  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    await invoke("greet", { name });
  }

  return (
    <main>
      <MapContainer className="h-screen" center={[51.505, -0.09]} zoom={13}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    </main>
  );
}

export default App;
