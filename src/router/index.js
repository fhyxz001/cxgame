import {createRouter, createWebHashHistory, createWebHistory} from 'vue-router'

// 1. 导入页面组件（使用懒加载优化性能）
const HomeView = () => import('@/view/Home.vue')
const Game = () => import('@/view/Game.vue')

// 2. 定义路由规则
const routes = [
    {
        path: '/',
        name: 'home',
        component: HomeView,
        meta: {
            title: '首页'
        }
    },
    {
        path: '/game',
        name: 'game',
        component: Game
    },
    {
        path:'/test',
        name: 'test',
        component: () => import('@/view/Test.vue')
    },
    // 404 页面捕获，放在最后
    {
        path: '/:pathMatch(.*)*',
        redirect: '/'
    }
]

// 3. 创建路由实例
const router = createRouter({
    history: createWebHashHistory(), // 使用HTML5历史模式
    routes
})

// 4. (可选) 全局路由守卫，用于修改页面标题
router.beforeEach((to, from, next) => {
    if (to.meta.title) {
        document.title = to.meta.title
    }
    next()
})

// 5. 导出路由实例
export default router