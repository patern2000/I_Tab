
export default {
    namespace: 'home',
    state: {
        //对应添加收藏网站Item 对应的Modal
        editVisible: false,
        currentItem: null,  //存储收藏项，点击编辑的时候将数据存入redux
        //对应收藏夹管理抽屉
        folderManage: false,
        wallpaperVisible: false,
        wallpaper: {}  // 壁纸
    },
    effects: {
        // change: function* ({ config }, { put }) {
        //     yield put({
        //         type: "save",
        //         config
        //     })
        // }
        *change({ config }, { put }) {
            yield put({ // put 就相当于dispatch
                type: 'save',
                config
            });
        },
    },
    reducers: {
        save(state, { config }) {
            return { ...state, ...config };
        },
    }
};

/* 
yield put() 用于触发 action
yield call() 用于调用异步

change effct 多了一些异步操作罢了   通过 call调用异步

Generator 在 Dva 中已经被封装得很好，你只需要记住：遇到异步就 yield，Dva 会帮你处理好暂停和继续。
*/