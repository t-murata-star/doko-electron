import { createSlice } from '@reduxjs/toolkit';
import { Restroom, OfficeInfo, RestroomInfo } from '../../define/model';
import { companyInfoActions } from '../../actions/companyInfo/companyInfoActions';

class InitialState {
  restrooms = new RestroomInfo();
  officeInfo = new OfficeInfo();
}

// createSlice() で actions と reducers を一気に生成
export const companyInfoSlice = createSlice({
  name: 'companyInfo',
  initialState: new InitialState(),
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(companyInfoActions.getRestroomUsageSuccess, (state, action) => {
        const rooms = action.payload.rooms;
        return {
          ...state,
          restrooms: {
            ...state.restrooms,
            rooms,
            isNoVacancyForMen: checkNoVacantForRestroom(rooms, 'men'),
            isNoVacancyForWomen: checkNoVacantForRestroom(rooms, 'women'),
            vacancyForMen: getVacantCountForRestroom(rooms, 'men'),
            vacancyForWomen: getVacantCountForRestroom(rooms, 'women'),
          },
        };
      })
      .addCase(companyInfoActions.getOfficeInfoSuccess, (state, action) => {
        return {
          ...state,
          officeInfo: action.payload.officeInfo,
        };
      })
      .addCase(companyInfoActions.noDisplayTime, (state) => {
        return {
          ...state,
          restrooms: new RestroomInfo(),
          officeInfo: new OfficeInfo(),
        };
      });
  },
});

// トイレの満席チェック
const checkNoVacantForRestroom = (rooms: Restroom[], gender: string) => {
  if (!rooms) {
    return true;
  }
  const filteredByGender = rooms.filter((room) => room.gender === gender);
  const filteredByUsing = filteredByGender.filter((room) => room.isUsing === true);
  return filteredByGender.length === filteredByUsing.length;
};

// トイレの空席数を計算
const getVacantCountForRestroom = (rooms: Restroom[], gender: string) => {
  const NO_VACANT = 0;
  if (!rooms) {
    return NO_VACANT;
  }
  const filteredByGender = rooms.filter((room) => room.gender === gender);
  const filteredByUsing = filteredByGender.filter((room) => room.isUsing === false);
  return filteredByUsing.length;
};
