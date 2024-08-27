import { HashRouter, Route, Routes } from 'react-router-dom';
import { Main } from './pages/main/Main';
import { Plarium } from './pages/plarium/Plarium';
import { Canvas } from './pages/canvas/Canvas';

export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path='/' element={<Main />} />
        <Route path='/plarium' element={<Plarium />} />
        <Route path='/canvas' element={<Canvas />} />
      </Routes>
    </HashRouter>
  );
}
