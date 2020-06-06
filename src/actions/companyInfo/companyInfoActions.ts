import { createAction } from '@reduxjs/toolkit';
import { GetRestroomUsage, GetOfficeInfo } from '../../define/model';

export const companyInfoActions = {
  getRestroomUsageSuccess: createAction(`companyInfo/getRestroomUsageSuccess`, (rooms: GetRestroomUsage[]) => {
    return {
      payload: {
        rooms,
      },
    };
  }),
  getOfficeInfoSuccess: createAction(`companyInfo/getOfficeInfoSuccess`, (officeInfo: GetOfficeInfo) => {
    return {
      payload: {
        officeInfo,
      },
    };
  }),
  noOperatingTime: createAction(`companyInfo/noOperatingTime`),
};

export const companyInfoActionsAsyncLogic = {
  getAllCompanyInfo: createAction(`companyInfo/logic/getAllCompanyInfo`),
};
