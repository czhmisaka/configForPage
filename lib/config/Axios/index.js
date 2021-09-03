/*
 * @Author: czhmisaka
 * @Date: 2021-08-09 16:30:55
 * @LastEditTime: 2021-09-02 14:38:26
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /cngpp-op-fe/src/configs/axios.js
 */
import axios from 'axios'
import {
    Message
} from 'element-ui'
import $i18n from '../i18n'
import API from '../common/api'

function msg(message, type = 'error') {
    Message({
        message,
        type
    })
}

// 允许无租户条件下的请求列表，BD专用（小二）
const allowList_noTenant = [
    API.User.getUserModel(),
    API.Tenant.getTenantList
]

// 拦截部分请求 ， 添加租户详情
axios.interceptors.request.use(
    config => {
        let tenant = sessionStorage.getItem('tenant') || 'NoTenant'
        if (allowList_noTenant.indexOf(config.url) != -1) {
            return config
        } else if (['provider'].indexOf(API.User.getUserType()) != -1) {
            config.headers['tenant'] = tenant
            return config
        } else if (tenant != 'NoTenant') {
            config.headers['tenant'] = tenant
            return config
        } else {
            return Promise.reject('noLog')
        }
    },
)


axios.defaults.timeout = 10000;
axios.defaults.withCredentials = true;
axios.interceptors.response.use(
    function (response) {
        if (typeof response === 'object') {
            if (typeof response.data == 'string') {
                try {
                    response.data = JSON.parse(response.data.replace(/(\d+):/g, "\"$1\":"))
                } catch (e) {
                    response.data = response.data
                }
            }
            if (response.data.code === '2000') {
                msg('登录状态失效，请重新登录')
                let url = response.data.msg.split('?')[0] + '?redirectURL=' + window.location.href + `&BACK_URL=` + window.location.href
                setTimeout(() => {
                    window.location.href = url
                }, 1000)
                return response.data
            }
            if (response.data.code && response.data.code != '0000') {
                // 直接抛出错误提示
                if (response.data && response.data.code) {
                    msg(`错误代码： (${response.data.code})+${response.data.msg}`, 'error')
                } else {
                    msg('访问了错误的接口，请联系管理员处理。', 'error')
                }
            }
            return response.data
        } else {
            return response.data
        }
    },
    function (error) {
        if (['noLog'].indexOf(error) == -1) {
            Message.error(
                $i18n.get({
                    id: 'cngppoc.src.configs.axios.RequestFailed',
                    dm: '请求失败'
                })
            )
        }
        return Promise.reject(error)
    }
)