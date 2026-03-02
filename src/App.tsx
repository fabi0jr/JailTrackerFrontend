import { useEffect, useState } from 'react'

function App() {
  const [mensagem, setMensagem] = useState('Conectando ao backend...')

  useEffect(() => {
    // Pega a URL do .env, ou usa o localhost como segurança
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

    // Faz a chamada GET para o NestJS
    fetch(apiUrl)
      .then((response) => response.text())
      .then((data) => setMensagem(`Resposta da API: ${data}`))
      .catch((error) => {
        console.error("Erro:", error)
        setMensagem('Falha ao conectar na API')
      })
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <h1 className="text-4xl font-bold text-blue-500">
        {mensagem}
      </h1>
    </div>
  )
}

export default App