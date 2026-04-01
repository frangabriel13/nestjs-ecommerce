import { useState } from 'react'
import { RegisterForm } from './components/RegisterForm'
import { LoginForm } from './components/LoginForm'
import { UserProfile } from './components/UserProfile'
import { AssignRole } from './components/AssignRole'
import { ProductFlow } from './components/ProductFlow'
import { EventLog } from './components/EventLog'

function App() {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('token')
  )

  const handleLogin = (accessToken: string) => {
    localStorage.setItem('token', accessToken)
    setToken(accessToken)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setToken(null)
  }

  return (
    <div style={{ display: 'flex', gap: '2rem', padding: '1rem', fontFamily: 'monospace' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h2>ecommerce API</h2>

        {!token ? (
          <>
            <RegisterForm />
            <hr />
            <LoginForm onLogin={handleLogin} />
          </>
        ) : (
          <>
            <button onClick={handleLogout}>Logout</button>
            <hr />
            <UserProfile />
            <hr />
            <AssignRole />
            <hr />
            <ProductFlow />
          </>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <EventLog />
      </div>
    </div>
  )
}

export default App
