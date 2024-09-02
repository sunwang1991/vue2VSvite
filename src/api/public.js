import request from '@/utils/request'

/**
 *
 * @param {String} uri 请求地址
 * @param {Object} datas 请求参数
 * @param {String} method 请求方式
 * @returns
 */
export default function req(uri, datas = {}, method = 'post', sysId) {
  let data, params
  method = method == 'post' || method == 'get' || method == 'put' || method == 'delete' ? method : 'post'
  if (sysId) {
    if (sysId === true) {
      datas.sysId = localStorage.getItem('sysId')
    } else {
      datas.sysId = sysId
    }
  }
  method == 'post' ? data = datas : params = datas
  return request({
    url: uri,
    method: method,
    data: data,
    params: params
  })
}

