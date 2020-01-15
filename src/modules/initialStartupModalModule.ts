import { createSlice } from '@reduxjs/toolkit';

class _initialState {
  onHide: boolean = false;
  submitButtonDisabled: boolean = true;
  isChangeUser: boolean = false;
}

// createSlice() で actions と reducers を一気に生成
export const initialStartupModal = createSlice({
  name: 'counter',
  initialState: new _initialState(),
  reducers: {
    showModal: (state, action) => {
      return {
        ...state,
        onHide: action.payload
      };
    },
    disableSubmitButton: (state, action) => {
      return {
        ...state,
        submitButtonDisabled: action.payload
      };
    },
    changeSubmitMode: (state, action) => {
      return {
        ...state,
        isChangeUser: action.payload
      };
    }
  }
});
