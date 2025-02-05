import { csrfFetch } from './csrf'

const SET_USER = 'session/SET_USER'
const REMOVE_USER = 'session/REMOVE_USER'



export const setUser = (user) => ({
  type: SET_USER,
  user,
})

export const removeUser = () => ({
  type: REMOVE_USER,
})

export const login = (credential, password) => async (dispatch) => {
  const response = await csrfFetch('/api/session', {
    method: 'POST',
    body: JSON.stringify({ credential, password }),
  })

  const data = await response.json()
  dispatch(setUser(data.user))
  return data
}

const initialState = {
  user: null
}

const sessionReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER:
      return { ...state, user: action.user }
    case REMOVE_USER:
      return { ...state, user: null };
    default:
      return state
  }
}

export default sessionReducer
