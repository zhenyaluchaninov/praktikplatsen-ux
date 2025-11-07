import { Route, Routes } from 'react-router-dom';

import BrowsePlacements from './pages/BrowsePlacements';

const App = () => (
  <Routes>
    <Route path="/" element={<BrowsePlacements />} />
  </Routes>
);

export default App;
