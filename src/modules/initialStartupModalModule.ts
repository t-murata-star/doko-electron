import { createSlice } from '@reduxjs/toolkit';

class _initialState {
  onHide: boolean = false;
  isChangeUser: boolean = false;
  submitButtonDisabled: boolean = true;
}

// createSlice() で actions と reducers を一気に生成
const slice = createSlice({
  name: 'initialStartupModal',
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

export default slice;
