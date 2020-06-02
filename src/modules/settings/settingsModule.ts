import { createSlice } from '@reduxjs/toolkit';
import { settingActions } from '../../actions/settings/settingsActions';
import { NO_USER } from '../../define';

class InitialState {
  submitButtonsDisable = {
    user: {
      userChange: true,
      email: true,
    },
  };
  user = {
    userId: NO_USER,
    email: '',
  };
  system = {
    startupEnabled: false,
  };
}

// createSlice() で actions と reducers を一気に生成
export const settingsSlice = createSlice({
  name: 'settings',
  initialState: new InitialState(),
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(settingActions.initializeState, () => {
        return new InitialState();
      })
      .addCase(settingActions.setUserId, (state, action) => {
        return {
          ...state,
          user: {
            ...state.user,
            userId: action.payload.userId,
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
