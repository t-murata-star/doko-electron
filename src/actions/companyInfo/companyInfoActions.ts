import { createAction } from '@reduxjs/toolkit';
import { GetRestroomUsage, GetOfficeInfo } from '../../define/model';

export const companyInfoActions = {
  // トイレ使用状況取得成功
  getRestroomUsageSuccess: createAction(`companyInfo/getRestroomUsageSuccess`, (rooms: GetRestroomUsage[]) => {
    return {
      payload: {
        rooms,
      },
    };
  }),
  // 執務室情報取得成功
  getOfficeInfoSuccess: createAction(`companyInfo/getOfficeInfoSuccess`, (officeInfo: GetOfficeInfo) => {
    return {
      payload: {
        officeInfo,
      },
    };
  }),
  // 社内情報の表示時間外
  noDisplayTime: createAction(`companyInfo/noDisplayTime`),
};

export const companyInfoActionsAsyncLogic = {
  // 全ての社内情報を取得
  getAllCompanyInfo: createAction(`companyInfo/logic/getAllCompanyInfo`),
};
