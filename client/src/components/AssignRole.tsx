import { useState } from 'react'
import { assignRole } from '../api'

// RoleIds: Customer = 1, Admin = 2, Merchant = 3
const ROLES = [
  { id: 1, name: 'Customer' },
  { id: 2, name: 'Admin' },
  { id: 3, name: 'Merchant' },
]

export function AssignRole() {
  const [userId, setUserId] = useState('')
  const [roleId, setRoleId] = useState('3')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    try {
      await assignRole(Number(userId), Number(roleId))
      setMessage('Rol asignado exitosamente')
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Error al asignar rol')
    }
  }

  return (
    <div>
      <h3>Asignar rol <small>(solo Admin)</small></h3>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="number"
            placeholder="ID de usuario"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
        </div>
        <div>
          <select value={roleId} onChange={(e) => setRoleId(e.target.value)}>
            {ROLES.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
        <button type="submit">POST /role/assign</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  )
}
