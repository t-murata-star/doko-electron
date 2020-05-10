import { createSlice } from '@reduxjs/toolkit';
import { Restroom, OfficeInfo } from '../../define/model';
import { menuButtonGroupForOfficeInfoActions } from '../../actions/officeInfo/menuButtonGroupForOfficeInfoActions';

class _initialState {
  restrooms = {
    rooms: [new Restroom()],
    isNoVacancyForMen: false,
    isNoVacancyForWomen: false,
    vacancyForMen: -1,
    vacancyForWomen: -1,
  };
  officeInfo = new OfficeInfo();
}

// createSlice() で actions と reducers を一気に生成
export const officeInfoSlice = createSlice({
  name: 'officeInfo',
  initialState: new _initialState(),
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(menuButtonGroupForOfficeInfoActions.getRestroomUsageSuccess, (state, action) => {
        const rooms = action.payload.rooms;
        return {
          ...state,
          restrooms: {
            ...state.restrooms,
            rooms: rooms,
            isNoVacancyForMen: checkNoVacantForRestroom(rooms, 'men'),
            isNoVacancyForWomen: checkNoVacantForRestroom(rooms, 'women'),
            vacancyForMen: getVacantCountForRestroom(rooms, 'men'),
            vacancyForWomen: getVacantCountForRestroom(rooms, 'women'),
          },
        };
      })
      .addCase(menuButtonGroupForOfficeInfoActions.getOfficeInfoSuccess, (state, action) => {
        return {
          ...state,
          officeInfo: action.payload.officeInfo,
        };
      });
  },
});

// トイレの満席チェック
function checkNoVacantForRestroom(rooms: Restroom[], gender: string) {
  if (!rooms) return true;

  const filteredByGender = rooms.filter((room) => room.gender === gender);
  const filteredByUsing = filteredByGender.filter((room) => room.isUsing === true);
  return filteredByGender.length === filteredByUsing.length;
}

// トイレの空席数を計算
function getVacantCountForRestroom(rooms: Restroom[], gender: string) {
  if (!rooms) return 0;

  const filteredByGender = rooms.filter((room) => room.gender === gender);
  const filteredByUsing = filteredByGender.filter((room) => room.isUsing === false);
  return filteredByUsing.length;
}
