import React, {createContext, useReducer, useContext} from 'react';
import {Dimensions} from 'react-native';

const initialState = {
  window: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  statusBar: {
    height: 0,
  },
  user: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'resize':
      return {...state, window: action.payload};
    case 'statusBar':
      return {...state, statusBar: action.payload};
    case 'user':
      return {...state, user: action.payload};
  }
}

const StateContext = createContext();
const DispatchContext = createContext();

function useStateStore() {
  return useContext(StateContext);
}

function useDispatchStore() {
  return useContext(DispatchContext);
}

function StoreProvider({children}) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

export {useStateStore, useDispatchStore, StoreProvider};
