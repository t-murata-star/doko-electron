import { ApiResponse, GetRestroomUsage, GetOfficeInfo } from '../../define/model';
import { showSnackBar } from '../../components/common/utils';
import { put } from 'redux-saga/effects';
import { companyInfoAPI } from '../../api/companyInfoAPI';
import { companyInfoActions } from '../../actions/companyInfo/companyInfoActions';
import { callAPI } from '../common/utilsSaga';

export const callCompanyInfoAPI = {
  // トイレ使用状況を取得
  getRestroomUsage: function* () {
    const response: ApiResponse<GetRestroomUsage[]> = yield callAPI(companyInfoAPI.getRestroomUsage);
    if (response.getIsError()) {
      showSnackBar('error', '通信に失敗しました。', null);
      return response;
    }

    yield put(companyInfoActions.getRestroomUsageSuccess(response.getPayload()));
    return response;
  },

  // 社内情報を取得
  getOfficeInfo: function* () {
    const response: ApiResponse<GetOfficeInfo> = yield callAPI(companyInfoAPI.getOfficeInfo);
    if (response.getIsError()) {
      showSnackBar('error', '通信に失敗しました。', null);
      return response;
    }

    yield put(companyInfoActions.getOfficeInfoSuccess(response.getPayload()));
    return response;
  },
};
