const dayjs = require('dayjs')

module.exports = {
  site: 'lala.tv',
  days: 1,
  lang: 'jp',
  delay: 5000,

  url: function () {
    let url_ = 'https://www.lala.tv/json/timetable/data.json'
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
    const data = parseItems(context, channel)
    const items = data.programs
    //console.log('parser date:'+date)
    items.forEach(item => {
      programs.push({
        title: item.ps_episode_title,
        start: parseStart(item, data.date),
        stop: parseStop(item, data.date),
        description: item.ps_episode_description,
        icon: parseIcon(item),
        sub_title: item.subtitle
      })
    })
    //console.log(programs)
    return programs
  }
}

function parseItems({content, date}) {
  //console.log(channel)
  if (content != '') {
    const data = JSON.parse(content)
    const dateStr = dayjs(date).format('YYYY-MM-DD')
    //console.log(dateStr)
    if(!data || !data[dateStr]){
      return []
    }
  
    return {'date': dateStr, 'programs':data[dateStr]}
  } else {
    return []
  }
}

function parseStart(item, date) {
  return getDayjsTime( item, 'ps_start_time', date)
}

function parseStop(item, date) {
  return getDayjsTime( item, 'ps_end_time', date)
}

function parseIcon(item) {
  return 'https://www.lala.tv' +item.ps_episode_art
}

function getDayjsTime(item, attribute, date){
  return dayjs(date + 'T'+item[attribute]+':00+09:00')
}
