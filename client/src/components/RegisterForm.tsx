import { useState } from 'react'
import { register } from '../api'

export function RegisterForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    try {
      await register(email, password)
      setMessage('Usuario registrado exitosamente')
      setEmail('')
      setPassword('')
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Error al registrar usuario')
    }
  }

  return (
    <div>
      <h3>Registrarse</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Registrarse</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  )
}
