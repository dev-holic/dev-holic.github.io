import { HashRouter, Route, Routes } from 'react-router-dom';
import { Main } from './pages/main/Main';
import { Plarium } from './pages/plarium/Plarium';

export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path='/' element={<Main />} />
        <Route path='/plarium' element={<Plarium />} />
        <Route path='/test' element={'test'} />
        <Route path='/test/:id' element={'test detail'} />
      </Routes>
    </HashRouter>
  );
}
