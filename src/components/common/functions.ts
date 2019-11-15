import { UserInfo } from "../../define/model";

// ※戻り値の userInfo は userList の参照である事に注意
export const getUserInfo = (userList: UserInfo[], userID: number): UserInfo | null => {
  if (!userList) {
    return null;
  }
  const userInfo = userList.filter(userInfo => {
    return userInfo['id'] === userID;
  })[0];
  return userInfo || null;
};
