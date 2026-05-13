import React from 'react'
import { useParams } from 'react-router-dom';

const salleDétail = () => {
  const { id} = useParams();
  return (
    <div>salleDétail {id}</div>
  )
}

export default salleDétail

