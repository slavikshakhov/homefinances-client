import React, { useState, createContext } from 'react'
const jwtDecode = require('jwt-decode')

export const DataContext = createContext()

export const DataProvider = (props) => {
  const [isAuth, setIsAuth] = useState(false)
  const [decodedToken, setDecodedToken] = useState('')
  console.log(decodedToken)
  console.log(isAuth)
  const setToken = (token) => {
    console.log(token)
    const dateNow = new Date()
    const decodedToken = jwtDecode(token)
    setDecodedToken(decodedToken)
    if (decodedToken.exp < dateNow.getTime()) {
      setIsAuth(true)
      localStorage.setItem('token', token)
    }
  }
  const removeToken = () => {
    localStorage.removeItem('token')
    setIsAuth(false)
  }
  const [balance, setBalance] = useState(0)
  const [temporaryActivity, setTemporaryActivity] = useState(null)
  return (
    <DataContext.Provider
      value={{
        isAuth,
        setToken,
        removeToken,
        decodedToken,
        temporaryActivity,
        setTemporaryActivity,
        balance,
        setBalance,
      }}
    >
      {props.children}
    </DataContext.Provider>
  )
}
