import { Routes, Route } from "react-router";
import Home from "./pages/home/Home";

// Defines which URL path corresponds to which page component.
function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  );
}

export default App;
