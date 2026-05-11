import React, { useState } from 'react'
import './styles.css'
import { useNavigate } from 'react-router-dom'
import userService from '../../services/userService'

const Register = () => {
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      await userService.register({
        nom,
        email,
        password
      })

      setSuccess('Compte créé avec succès. Vous pouvez maintenant vous connecter.')
      setTimeout(() => navigate('/login'), 1200)
    } catch (err) {
      setError(err?.response?.data?.message || "Erreur lors de la création du compte")
    }
  }

  return (
    <div className="register-page">
      <div className="register-shell">
        <p className="register-kicker">Créer un compte</p>
        <h1>Rejoindre Woorkly</h1>
        <p className="register-sub">L’avatar est optionnel. Vous pourrez le modifier plus tard depuis votre dashboard.</p>

        <form className="register-form" onSubmit={handleSubmit}>
          <label>
            Nom et prénom
            <input value={nom} onChange={(e) => setNom(e.target.value)} type="text" name="nom" placeholder="Votre nom complet" required />
          </label>

          <label>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" name="email" placeholder="you@exemple.com" required />
          </label>

          <label>
            Mot de passe
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" name="password" placeholder="••••••••" required />
          </label>

          {error && <div className="register-message register-message--error">{error}</div>}
          {success && <div className="register-message register-message--success">{success}</div>}

          <div className="register-actions">
            <button className="btn-primary" type="submit">Créer mon compte</button>
            <button className="btn-outline" type="button" onClick={() => navigate('/login')}>J’ai déjà un compte</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register
