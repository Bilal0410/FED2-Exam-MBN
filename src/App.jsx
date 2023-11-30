import { Outlet } from "@tanstack/react-router";
import "./App.css";
import Navbar from "./components/navbar";

function App() {
  return (
    <>
      <header>
        <Navbar />
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default App;
