/**
 * Internationalization (i18n) module
 * Supports English and Simplified Chinese
 */

const I18N = {
  en: {
    app_title:              'NJUPT Campus Map',
    app_subtitle:           'Xianlin Campus · 仙林校区',
    search_placeholder:     'Search buildings, services…',
    label_quick_views:      'Quick Views',
    label_categories:       'Categories',
    label_locations:        'Locations',
    view_all:               'All',
    view_new_student:       'New Student',
    view_daily:             'Daily Life',
    results_single:         '1 place',
    results_plural:         '{n} places',
    no_results:             'No results found',
    no_results_hint:        'Try a different search term',
    loading:                'Loading Campus Map…',
    detail_close:           'Close',
    lang_switch:            '中文',
  },
  zh: {
    app_title:              '南邮仙林校区地图',
    app_subtitle:           'NJUPT · Xianlin Campus',
    search_placeholder:     '搜索建筑、服务…',
    label_quick_views:      '快速视图',
    label_categories:       '分类',
    label_locations:        '地点列表',
    view_all:               '全部',
    view_new_student:       '新生导航',
    view_daily:             '日常生活',
    results_single:         '1个地点',
    results_plural:         '{n}个地点',
    no_results:             '未找到相关结果',
    no_results_hint:        '请尝试其他关键词',
    loading:                '正在加载校园地图…',
    detail_close:           '关闭',
    lang_switch:            'English',
  },
};

let _lang = 'en';

/** Translate a key, with optional {placeholder} substitution. */
function t(key, params) {
  let str = (I18N[_lang] || I18N.en)[key] || key;
  if (params) {
    str = str.replace(/\{(\w+)\}/g, (_, k) => (params[k] !== undefined ? params[k] : `{${k}}`));
  }
  return str;
}

function setLang(lang) { _lang = lang; document.documentElement.lang = lang; }
function getLang()     { return _lang; }
