import Vue from 'vue'
import VueI18n from 'vue-i18n'
import locale from 'element-ui/lib/locale';
import elementEnLocale from 'element-ui/lib/locale/lang/en' // element-ui lang导入Element的语言包 英文
import elementZhLocale from 'element-ui/lib/locale/lang/zh-CN'// element-ui lang g导入Element的语言包 中文
import enLocale from './en' // 导入项目中用到的英文语言包
import zhLocale from './zh'// 导入项目中用到的中文语言包
Vue.use(VueI18n)
const messages = {
  'zh':Object.assign(zhLocale,elementZhLocale),
  'en':Object.assign(enLocale,elementEnLocale),
}
const i18n = new VueI18n({
  locale: localStorage.lang ||'en', 
  messages, 
})
locale.i18n((key, value) => i18n.t(key, value)) //为了实现element插件的多语言切换

export default i18n