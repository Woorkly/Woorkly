import React from 'react'
import { useParams } from 'react-router-dom';

const salleDétail = () => {
  const { ANZIZ} = useParams();
  return (
    <div>salleDétail {ANZIZ}</div>
  )
}

export default salleDétail