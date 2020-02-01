let app = getApp();

const initialData = {
  statusBarHeight: app.globalData.statusBarHeight,
  hostUrl: app.globalData.hostUrl,
  token: wx.getStorageSync("token"),
  likeIcon: "../../assets/icons/love_empty.png",
  likedIcon: "../../assets/icons/love_solid.png",
  currentLikeIcon: false,
  currentLikeCount: 0,
  timeIcon: "../../assets/icons/time.png",
  locationIcon: "../../assets/icons/location.png",
  curSub: undefined,
  curCategory: undefined
}

Page({
  data: initialData,
  onLoad: function (option) {
    const { id, sub, category } = option;
    this.setData({ curSub: sub, curCategory: category });
    this.getShopInfo(id);
  },
  goback: function () {
    wx.navigateBack({
      delta: 1
    });
  },
  like: function (e) {
    if (!this.data.currentLikeIcon) {
      wx.request({
        url: `${this.data.hostUrl}/shop/like`,
        header: { 'content-type': 'application/json', 'Authorization': `Bearer ${this.data.token}` },
        data: { 'shop_id': this.data.shop.shop_id },
        method: 'POST',
        success: (result) => {
          let cnt = this.data.currentLikeCount + 1;
          console.log(result.data.data);
          this.setData({ currentLikeIcon: true, currentLikeCount: cnt });
        }
      });
    }
    else {
      wx.request({
        url: `${this.data.hostUrl}/shop/unlike`,
        header: { 'content-type': 'application/json', 'Authorization': `Bearer ${this.data.token}` },
        data: { 'shop_id': this.data.shop.shop_id },
        method: 'POST',
        success: (result) => {
          console.log(result.data.data);
          let cnt = this.data.currentLikeCount - 1;
          this.setData({ currentLikeIcon: false, currentLikeCount: cnt });
        }
      });
    }
  },
  getShopInfo: function (shop_id) {
    wx.request({
      url: `${this.data.hostUrl}/shop/info?shop_id=${shop_id}`,
      header: { 'content-type': 'application/json', 'Authorization': `Bearer ${this.data.token}` },
      method: 'GET',
      success: (result) => {
        console.log(result.data.data);
        this.setData({ shop: result.data.data, currentLikeIcon: result.data.data.liked, currentLikeCount: result.data.data.liker_count });
        this.getComment();
      },
      fail: (err) => {
        console.log(err);
      }
    });
  },
  getComment: function () {
    wx.request({
      url: `${this.data.hostUrl}/comment/shop?shop_id=${this.data.shop.shop_id}`,
      header: { 'content-type': 'application/json', 'Authorization': `Bearer ${this.data.token}` },
      success: (result) => {
        console.log(result.data.data);
        let comments = result.data.data;
        // 包含所有评论中含有的不重复的openid
        let openidArr = [];
        // 一个json数组，包含openid, avatar_url, nickname
        let userinfoArr = [];
        // 得到所有评论用户的openid，存入数组
        for (let comment of comments) {
          if (openidArr.indexOf(comment.openid) === -1) {
            openidArr.push(comment.openid);
          }
        }
        // 构造userinfoArr
        for (let i = 0; i < openidArr.length; ++i) {
          wx.request({
            url: `${this.data.hostUrl}/user/info?openid=${openidArr[i]}`,
            header: { 'content-type': 'application/json', 'Authorization': `Bearer ${this.data.token}` },
            success: (result) => {
              console.log(result.data.data);
              userinfoArr.push({
                openid: openidArr[i],
                avatar: result.data.data.avatar_url,
                nickname: result.data.data.nickname
              });
            },
          });
        }
        console.log(userinfoArr);
      },
      fail: (err) => {
        console.log(err);
      }
    });
  },
  goToComment: function () {
    wx.navigateTo({
      url: `../../pages/comment/comment?shop_id=${this.data.shop.shop_id}&shop_name=${this.data.shop.name}&category=${this.data.curCategory}&subcategory=${this.data.curSub}`,
      fail: (err) => { console.log(err) },
    });
  }
})