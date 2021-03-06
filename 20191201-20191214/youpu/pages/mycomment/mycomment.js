const app = getApp();

const initialData = {
  hostUrl: app.globalData.hostUrl,
  statusBarHeight: app.globalData.statusBarHeight,
  comments: undefined,
  curLikeIcons: [],
  curLikeCounts: [],
  likedIcon: "../../assets/icons/icon-like.png",
  likeIcon: "../../assets/icons/icon-like-nor.png"
};

Page({
  data: initialData,
  onLoad: function () {
    this.getUserComment();
    console.log(this.data)
  },
  getUserComment: function () {
    console.log(wx.getStorageSync("token"))
    wx.request({
      url: `${this.data.hostUrl}/comment/user`,
      header: { 'content-type': 'application/json', 'Authorization': `Bearer ${wx.getStorageSync("token")}` },
      success: (result) => {
        console.log(result.data.data);
        let comments = result.data.data;
        for (let i = 0; i < comments.length; ++i) {
          // 获取每个评论下的商店信息
          wx.request({
            url: `${this.data.hostUrl}/shop/info?shop_id=${comments[i].shop_id}`,
            header: { 'content-type': 'application/json', 'Authorization': `Bearer ${wx.getStorageSync("token")}` },
            success: (result) => {
              comments[i].image_url = result.data.data.image_url;
              comments[i].shop_id = result.data.data.shop_id;
              comments[i].shop_name = result.data.data.name;
              comments[i].shop_location = result.data.data.address;
              let newCurLikeIcons = this.data.curLikeIcons;
              let newCurLikeCounts = this.data.curLikeIcons;
              newCurLikeIcons[i] = result.data.data.liked;
              newCurLikeCounts[i] = result.data.data.liker_count;
              this.setData({ comments: comments, curLikeIcons: newCurLikeIcons, curLikeCounts: newCurLikeCounts });
            }
          });
        }
      }
    });
  },
  goToShopDetail: function (e) {
    const shop_id = e.currenTarget.dataset.shopid;
    // 由于在该页面获取不到subcategory和category，暂时无法写好
    // 解决方案1： 在/shop/info接口中传来category & subcategory
    // 解决方案2： 新增根据shop_id查询category & subcategory接口
    // wx.navigateTo({
    //   url: `../../pages/shopdetail/shopdetail?id=${this.data.shop_id}&subcategory=${this.data.subcategory}&category=${this.data.category}`
    // });
  },
  goback: function () {
    wx.navigateBack({
      delta: 1
    });
  }
});