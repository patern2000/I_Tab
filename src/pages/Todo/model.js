import { getStorage, setStorage } from '../../utils/localStorageUtils';


export default {
    namespace: 'todo',
    state: {
        todoGroup: { todo: [], doing: [], done: [] },
        visible: false
    },
    subscriptions: {// 防止页面刷新丢失数据
        setup({ dispatch, history }) {
            // 应用启动时自动加载数据
            dispatch({ type: 'refresh' });
            // 可选：路由变化时也可以重新加载
            history.listen(() => {
                dispatch({ type: 'refresh' });
            });
        },
    },
    effects: {
        *change({ config }, { put }) {
            yield put({
                type: 'save',
                config
            });
        },
        *refresh(_, { put }) {
            const todoGroup = getStorage('todoGroup', 'object');
            yield put({
                type: 'save',
                config: { todoGroup }
            })
        },
        *saveLocalTodos({ config }, { put, select }) {
            const { todoGroup } = yield select((state) => state.todo);// 取出当前状态的
            const { todoGroup: groupTemp } = config; // 获取新的
            setStorage('todoGroup', { ...todoGroup, ...groupTemp }, 'object');//也属于异步操作 更新本地存储
            yield put({
                type: 'save',
                config: { todoGroup: { ...todoGroup, ...groupTemp } }
            })
        },
    },
    reducers: {
        save(state, { config }) {
            return { ...state, ...config };
        },
    }
};