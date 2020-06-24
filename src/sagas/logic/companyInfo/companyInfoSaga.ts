import { takeEvery, call } from 'redux-saga/effects';
import { getAllCompanyInfo } from '../../common/utilsSaga';

const companyInfo = {
  // 全ての社内情報を取得
  getAllCompanyInfo: function* () {
    try {
      yield call(getAllCompanyInfo);
    } catch (error) {
      console.error(error);
    }
  },
};

export const companyInfoSaga = Object.entries(companyInfo).map((value: [string, any]) => {
  return takeEvery(`companyInfo/logic/${value[0]}`, value[1]);
});
