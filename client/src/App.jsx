import { BrowserRouter, Routes, Route } from "react-router-dom";
import AutismScreeningForm from "./component/AutismScreeningForm";
import ScreeningResults from "./component/ScreeningResults";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AutismScreeningForm />} />
        <Route path="/results" element={<ScreeningResults />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
