import { createAction } from '@reduxjs/toolkit';
import { GetRestroomUsage, GetOfficeInfo } from '../../define/model';

export const menuButtonGroupForOfficeInfoActions = {
  getRestroomUsageSuccess: createAction(`menuButtonGroupForOfficeInfo/getRestroomUsageSuccess`, (rooms: GetRestroomUsage[]) => {
    return {
      payload: {
        rooms,
      },
    };
  }),
  getOfficeInfoSuccess: createAction(`menuButtonGroupForOfficeInfo/getOfficeInfoSuccess`, (officeInfo: GetOfficeInfo) => {
    return {
      payload: {
        officeInfo,
      },
    };
  }),
};

export const menuButtonGroupForOfficeInfoActionsAsyncLogic = {
  getAllOfficeInfo: createAction(`menuButtonGroupForOfficeInfo/logic/getAllOfficeInfo`),
};
