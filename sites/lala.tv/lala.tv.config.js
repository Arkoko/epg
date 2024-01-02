const dayjs = require('dayjs')

module.exports = {
  site: 'lala.tv',
  days: 5,
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
  //let starthr = parseInt(item['ps_start_time'].split(':')[0])
  let endhr = parseInt(item['ps_end_time'].split(':')[0])
  let enddate = date
  if(endhr > 23){
    enddate = date +1
  }
  //console.log('start: '+starthr + ' end: '+ endhr+ ' | '+enddate)
  return getDayjsTime( item, 'ps_end_time', enddate)
}

function parseIcon(item) {
  return 'https://www.lala.tv' +item.ps_episode_art
}

function getDayjsTime(item, attribute, date){
  let starthr = parseInt(item[attribute].split(':')[0])
  let min = parseInt(item[attribute].split(':')[1])
  let startdate = dayjs(date)
  if(starthr > 23){
    startdate = startdate.add(1,'day')
    starthr -= 24
    //console.log(startdate + ' '+ starthr)
  }
  return dayjs(startdate).add(starthr, 'hours').add(min,'minute').utcOffset(9)
  //return dayjs(startdate + 'T'+item[attribute]+':00+09:00')
}
