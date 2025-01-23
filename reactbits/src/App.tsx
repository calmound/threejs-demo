import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Hyperspeed from "./default/Backgrounds/Hyperspeed/Hyperspeed";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Hyperspeed />
    </>
  );
}

export default App;
