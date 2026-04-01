import { useState } from 'react'
import { getProfile } from '../api'

export function UserProfile() {
  const [profile, setProfile] = useState<{ id: number; email: string } | null>(null)
  const [message, setMessage] = useState('')

  const handleFetch = async () => {
    setMessage('')
    try {
      const res = await getProfile()
      setProfile(res.data.data)
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Error fetching profile')
    }
  }

  return (
    <div>
      <h3>User Profile</h3>
      <button onClick={handleFetch}>GET /user/profile</button>
      {profile && (
        <pre>{JSON.stringify(profile, null, 2)}</pre>
      )}
      {message && <p>{message}</p>}
    </div>
  )
}
