import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Main } from "./main/Main";

export function App() {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/test" element={'test'} />
          <Route path="/test/:id" element={'test detail'} />
        </Routes>
    </BrowserRouter>
  )
}