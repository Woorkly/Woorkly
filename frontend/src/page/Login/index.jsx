import React, { useState } from 'react'
import './styles.css'
import authService from '../../services/authService'
import { useNavigate } from 'react-router-dom'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await authService.login({ email, password })
      // server sets HttpOnly cookie; redirect after success
      navigate('/')
    } catch (err) {
      setError(err?.response?.data?.message || 'Erreur lors de la connexion')
    }
  }

  return (
    <div className="login-page">
      <div className="login-shell">
        <h1>Se connecter</h1>
        <p className="login-sub">Connectez-vous à votre espace Woorkly</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" name="email" placeholder="you@exemple.com" />
          </label>

          <label>
            Mot de passe
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" name="password" placeholder="••••••••" />
          </label>

          {error && <div className="login-error">{error}</div>}

          <div className="login-actions">
            <button className="btn-primary" type="submit">Se connecter</button>
            <button className="btn-outline" type="button">Créer un compte</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
