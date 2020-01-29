import { createSlice } from '@reduxjs/toolkit';

class _initialState {
  submitButtonsDisable = {
    user: {
      userChange: true,
      email: true
    }
  };
  snackbar = {
    enabled: false,
    message: '',
    timeoutMs: 5000
  };
  user = {
    userID: -1,
    email: ''
  };
  system = {
    startupEnabled: false
  };
}

// createSlice() で actions と reducers を一気に生成
const slice = createSlice({
  name: 'settings',
  initialState: new _initialState(),
  reducers: {
    setUserId: (state, action) => {
      return {
        ...state,
        user: {
          ...state.user,
          userID: action.payload
        }
      };
    },
    setEmail: (state, action) => {
      return {
        ...state,
        user: {
          ...state.user,
          email: action.payload
        }
      };
    },
    changeDisabledSubmitButtonUserChange: (state, action) => {
      return {
        ...state,
        submitButtonsDisable: {
          ...state.submitButtonsDisable,
          user: {
            ...state.submitButtonsDisable.user,
            userChange: action.payload
          }
        }
      };
    },
    changeDisabledSubmitButtonEmail: (state, action) => {
      return {
        ...state,
        submitButtonsDisable: {
          ...state.submitButtonsDisable,
          user: {
            ...state.submitButtonsDisable.user,
            email: action.payload
          }
        }
      };
    },
    changeEnabledStartup: (state, action) => {
      return {
        ...state,
        system: {
          ...state.system,
          startupEnabled: action.payload
        }
      };
    },
    changeEnabledSnackbar: (state, action) => {
      return {
        ...state,
        snackbar: {
          ...state.snackbar,
          enabled: action.payload[0],
          message: action.payload[1] ? action.payload[1] : '',
          timeoutMs: action.payload[2] ? action.payload[2] : 5000
        }
      };
    },
    initializeState: () => {
      return new _initialState();
    }
  }
});

export default slice;
