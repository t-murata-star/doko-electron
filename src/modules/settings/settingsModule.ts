import { createSlice } from '@reduxjs/toolkit';
import { Color } from '@material-ui/lab/Alert';

interface Snackbar {
  enabled: false;
  severity: Color;
  message: string;
  timeoutMs: number | null;
  queueMessages: Array<string>;
}

class _initialState {
  submitButtonsDisable = {
    user: {
      userChange: true,
      email: true
    }
  };
  snackbar: Snackbar = {
    enabled: false,
    severity: 'info',
    message: '',
    timeoutMs: 5000,
    queueMessages: new Array<string>()
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
          severity: action.payload[1] ? action.payload[1] : state.snackbar.severity,
          message: action.payload[2] ? action.payload[2] : state.snackbar.message,
          timeoutMs: action.payload[3] !== null ? action.payload[3] : null
        }
      };
    },
    initializeState: () => {
      return new _initialState();
    },
    enqueueSnackbarMessages: (state, action) => {
      const queueMessages = [...state.snackbar.queueMessages];
      queueMessages.push(action.payload);
      return {
        ...state,
        snackbar: {
          ...state.snackbar,
          queueMessages
        }
      };
    },
    dequeueSnackbarMessages: state => {
      const queueMessages = [...state.snackbar.queueMessages];
      queueMessages.shift();
      return {
        ...state,
        snackbar: {
          ...state.snackbar,
          queueMessages
        }
      };
    }
  }
});

export default slice;
