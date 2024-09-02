import Vue from 'vue'
import { mergeRecursive } from '@/utils/ruoyi'
import DictMeta from './DictMeta'
import DictData from './DictData'
import store from '@/store'
import request from '@/api/public'

const DEFAULT_DICT_OPTIONS = {
  types: []
}

/**
 * @classdesc 字典
 * @property {Object} label 标签对象，内部属性名为字典类型名称
 * @property {Object} dict 字段数组，内部属性名为字典类型名称
 * @property {Array.<DictMeta>} _dictMetas 字典元数据数组
 */
export default class Dict {
  constructor() {
    this.owner = null
    this.label = {}
    this.type = {}
  }

  init(options) {
    if (options instanceof Array) {
      options = { types: options }
    }
    const opts = mergeRecursive(DEFAULT_DICT_OPTIONS, options)
    if (opts.types === undefined) {
      throw new Error('need dict types')
    }
    this._dictMetas = opts.types.map(t => DictMeta.parse(t))

    // 页面数据字典，逐一设置
    return new Promise((res, rej) => {
      dictReq(opts.types).then(response => {
        this._dictMetas.forEach(dictMeta => {
          const type = dictMeta.type
          const responseDict = response[type]
          Vue.set(this.label, type, {})
          Vue.set(this.type, type, [])
          if (dictMeta.lazy) {
            return
          }
          res(loadDict(this, dictMeta, responseDict))
        })
      }).catch(err => {
        rej(err)
      })
    })
  }

  /**
   * 重新加载字典
   * @param {String} type 字典类型
   */
  reloadDict(type) {
    const dictMeta = this._dictMetas.find(e => e.type === type)
    if (dictMeta === undefined) {
      return Promise.reject(`the dict meta of ${type} was not found`)
    }
    return loadDict(this, dictMeta)
  }
}

function searchDictByKey(dict, key) {
  if (key == null && key == '') {
    return null
  }
  try {
    for (let i = 0; i < dict.length; i++) {
      if (dict[i].key == key) {
        return dict[i].value
      }
    }
  } catch (e) {
    return null
  }
}

// 请求字典数据，或者从存储读取数据字典
function dictReq(dictTypes) {
  const dicts = {}
  const reqDictTypes = []
  for (let index = 0; index < dictTypes.length; index++) {
    const dictType = dictTypes[index]
    const storeDict = searchDictByKey(store.getters.dict, dictType)
    if (storeDict) { // 存储中存在，直接使用存储
      dicts[dictType] = storeDict
    } else { // 不存在请求数据，进行组装
      reqDictTypes.push(dictType)
    }
  }

  if (reqDictTypes.length > 0) {
    return new Promise((resolve, reject) => {
      request('/sys/sys-dict/list2', {
        paterCodes: reqDictTypes
      }).then(res => {
        const data = res.data
        for (let index = 0; index < reqDictTypes.length; index++) {
          const dictType = reqDictTypes[index]
          const reqDict = data.filter(i => i.paterCode === dictType)
          store.dispatch('dict/setDict', { key: dictType, value: reqDict })
          dicts[dictType] = reqDict
        }
        resolve(dicts)
      }).catch(error => {
        reject(error)
      })
    })
  } else {
    return new Promise(resolve => { resolve(dicts) })
  }
}

/**
 * 加载字典
 * @param {Dict} dict 字典
 * @param {DictMeta} dictMeta 字典元数据
 * @returns {Promise}
 */
function loadDict(dict, dictMeta, responseDict) {
  const type = dictMeta.type
  let dicts = dictMeta.responseConverter(responseDict, dictMeta)
  if (!(dicts instanceof Array)) {
    console.error('the return of responseConverter must be Array.<DictData>')
    dicts = []
  } else if (dicts.filter(d => d instanceof DictData).length !== dicts.length) {
    console.error('the type of elements in dicts must be DictData')
    dicts = []
  }
  dict.type[type].splice(0, Number.MAX_SAFE_INTEGER, ...dicts)
  dicts.forEach(d => {
    Vue.set(dict.label[type], d.value, d.label)
  })
  return dicts
}
