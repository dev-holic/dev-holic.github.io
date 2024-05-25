import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Main } from "./main/Main";

export function App() {
  return (
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/test" element={'test'} />
          <Route path="/test/:id" element={'test detail'} />
        </Routes>
    </BrowserRouter>
  )
}