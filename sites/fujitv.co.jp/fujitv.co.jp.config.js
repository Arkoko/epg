const dayjs = require('dayjs')

module.exports = {
  site: 'www3.nhk.or.jp',
  days: 5,
  lang: 'jp',
  delay: 5000,

  url: function ({ date}) {

    let url_ = `https://www.fujitv.co.jp/bangumi/json/timetable_${dayjs(date).format('YYYYMMDD')}.js`
    //console.log(url_)
    return url_
  },

  request: {
    method: 'GET',
    timeout: 5000,
    cache: { ttl: 60 * 1000 },
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36'
    }
  },

  parser: function (context, channel) {
    const programs = []
    const items = parseItems(context, channel)

    items.forEach(item => {
      programs.push({
        title: item.title,
        start: parseStart(item),
        stop: parseStop(item),
        description: item.intro,
        icon: parseIcon(item),
        sub_title: item.subtitle
      })
    })
    //console.log(programs)
    return programs
  }
}

function parseItems({content}) {
  //console.log(channel)
  if (content != '') {
    const data = JSON.parse(content)
    //const siteId = channel.site_id
    return !data || !data.contents || !Array.isArray(data.contents.item)? []: data.contents.item
  } else {
    return []
  }
}

function parseStart(item) {
  return getDayjsObj(item, 'start')
}

function parseStop(item) {
  return getDayjsObj(item, 'end')
}

function parseIcon(item) {
  return item.logo
}

function getDayjsObj(item, attribute){
  return dayjs((item[attribute].substring(0,19)).concat('+09:00'))
}
