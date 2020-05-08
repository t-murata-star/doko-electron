import { createSlice } from '@reduxjs/toolkit';
import { settingActions } from '../../actions/settings/settingsActions';

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
export const settingsSlice = createSlice({
  name: 'settings',
  initialState: new _initialState(),
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(settingActions.initializeState, () => {
        return new _initialState();
      })
      .addCase(settingActions.setUserId, (state, action) => {
        return {
          ...state,
          user: {
            ...state.user,
            userID: action.payload.userID,
          },
        };
      })
      .addCase(settingActions.setEmail, (state, action) => {
        return {
          ...state,
          user: {
            ...state.user,
            email: action.payload.email,
          },
        };
      })
      .addCase(settingActions.changeDisabledSubmitButtonUserChange, (state, action) => {
        return {
          ...state,
          submitButtonsDisable: {
            ...state.submitButtonsDisable,
            user: {
              ...state.submitButtonsDisable.user,
              userChange: action.payload.disable,
            },
          },
        };
      })
      .addCase(settingActions.changeDisabledSubmitButtonEmail, (state, action) => {
        return {
          ...state,
          submitButtonsDisable: {
            ...state.submitButtonsDisable,
            user: {
              ...state.submitButtonsDisable.user,
              email: action.payload.disable,
            },
          },
        };
      })
      .addCase(settingActions.changeEnabledStartup, (state, action) => {
        return {
          ...state,
          system: {
            ...state.system,
            startupEnabled: action.payload.startupEnabled,
          },
        };
      });
  },
});
