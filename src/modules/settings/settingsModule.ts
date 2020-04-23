import { createSlice } from '@reduxjs/toolkit';

class _initialState {
  submitButtonsDisable = {
    user: {
      userChange: true,
      email: true,
    },
  };
  user = {
    userID: -1,
    email: '',
  };
  system = {
    startupEnabled: false,
  };
}

// createSlice() で actions と reducers を一気に生成
const settingsSlice = createSlice({
  name: 'settings',
  initialState: new _initialState(),
  reducers: {
    initializeState: () => {
      return new _initialState();
    },
    setUserId: (state, action) => {
      return {
        ...state,
        user: {
          ...state.user,
          userID: action.payload,
        },
      };
    },
    setEmail: (state, action) => {
      return {
        ...state,
        user: {
          ...state.user,
          email: action.payload,
        },
      };
    },
    changeDisabledSubmitButtonUserChange: (state, action) => {
      return {
        ...state,
        submitButtonsDisable: {
          ...state.submitButtonsDisable,
          user: {
            ...state.submitButtonsDisable.user,
            userChange: action.payload,
          },
        },
      };
    },
    changeDisabledSubmitButtonEmail: (state, action) => {
      return {
        ...state,
        submitButtonsDisable: {
          ...state.submitButtonsDisable,
          user: {
            ...state.submitButtonsDisable.user,
            email: action.payload,
          },
        },
      };
    },
    changeEnabledStartup: (state, action) => {
      return {
        ...state,
        system: {
          ...state.system,
          startupEnabled: action.payload,
        },
      };
    },
  },
});

export default settingsSlice;
