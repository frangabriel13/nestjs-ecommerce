import { useState } from 'react'
import { login } from '../api'

interface Props {
  onLogin: (token: string) => void
}

export function LoginForm({ onLogin }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    try {
      const res = await login(email, password)
      const token = res.data.data.accessToken
      onLogin(token)
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Invalid credentials')
    }
  }

  return (
    <div>
      <h3>Login</h3>
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
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Login</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  )
}
