import { createAction } from '@reduxjs/toolkit';
import { Restroom, Info } from '../../define/model';

export const menuButtonGroupForOfficeInfoActions = {
  getRestroomUsageSuccess: createAction(`menuButtonGroupForOfficeInfo/getRestroomUsageSuccess`, (rooms: Restroom[]) => {
    return {
      payload: {
        rooms,
      },
    };
  }),
  getOfficeInfoSuccess: createAction(`menuButtonGroupForOfficeInfo/getOfficeInfoSuccess`, (info: Info) => {
    return {
      payload: {
        info,
      },
    };
  }),
};

export const menuButtonGroupForOfficeInfoActionsAsyncLogic = {
  getAllOfficeInfo: createAction(`menuButtonGroupForOfficeInfo/logic/getAllOfficeInfo`),
};
