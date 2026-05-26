//import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashBoardPage from './pages/DashBoardPage';
import RegisterPrisoner from './pages/RegisterPrisoner';
import RelatoriosPage from './pages/RelatoriosPage';
import VisitantesPage from './pages/VisitantesPage';
import VisitasPage from './pages/VisitasPage';
import PavilhoesPage from './pages/PavilhoesPage';

function App() {
  //const [mensagem, setMensagem] = useState('Conectando ao backend...')

  // useEffect(() => {
  //   // Pega a URL do .env, ou usa o localhost como segurança
  //   const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

  //   // Faz a chamada GET para o NestJS
  //   fetch(apiUrl)
  //     .then((response) => response.text())
  //     .then((data) => setMensagem(`Resposta da API: ${data}`))
  //     .catch((error) => {
  //       console.error("Erro:", error)
  //       setMensagem('Falha ao conectar na API')
  //     })
  // }, [])

  return (
    <Router>
      <Routes>
        <Route path='/' element={<LoginPage/>}/>
        <Route path='/dashboard' element={<DashBoardPage/>}/>
        <Route path='/registerPrisoners' element={<RegisterPrisoner/>}/>
        <Route path='/relatorios' element={<RelatoriosPage/>}/>
        <Route path='/visitantes' element={<VisitantesPage/>}/>
        <Route path='/visitas' element={<Navigate to="/visitantes" replace />}/>
        <Route path='/pavilhoes' element={<PavilhoesPage/>}/>
      </Routes>
    </Router>
  )
}

export default App