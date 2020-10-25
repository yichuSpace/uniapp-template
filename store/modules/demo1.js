const demoname = {
    fn: 'fn',
}
const store = {
    state: {
        demo: '名字'
    },
    getters: {
        getLocale: state => {
            return state.demo + 321
        }
    },
    mutations: {
        [demoname.fn]: (state, localeVal) => {
        }
    },
    actions: {
        demoactions: ({ commit }, localeVal) => {
            commit(demoname.fn, localeVal)
        }
    }
}
export default store