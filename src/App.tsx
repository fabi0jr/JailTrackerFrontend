//import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashBoardPage from './pages/DashBoardPage';

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
        <Route path='/' element={<LoginPage/>}></Route>
        <Route path='/dashboard' element={<DashBoardPage/>}></Route>
      </Routes>
    </Router>
  )
}

export default App