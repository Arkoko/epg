const dayjs = require('dayjs')

module.exports = {
  site: 'www3.nhk.or.jp',
  days: 5,
  lang: 'jp',
  delay: 5000,

  url: function ({ date, channel}) {
    let url_ = `https://api.nhk.or.jp/r5/pg2/list/4/130/${channel.site_id}/${dayjs(date).format('YYYY-MM-DD')}.json`
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
        description: item.content,
        icon: parseIcon(item),
        sub_title: item.subtitle
      })
    })
    //console.log(programs)
    return programs
  }
}

function parseItems({content, channel}) {
  //console.log(channel)
  if (content != '') {
    const data = JSON.parse(content)
    const siteId = channel.site_id
    return !data || !data.list || !data.list[siteId] || !Array.isArray(data.list[siteId])? []: data.list[siteId]
  } else {
    return []
  }
}

function parseStart(item) {
  return dayjs(item['start_time'])
}

function parseStop(item) {
  return dayjs(item['end_time'])
}

function parseIcon(item) {
  return item.images.logo_l.url
}
