const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
const customParseFormat = require('dayjs/plugin/customParseFormat')

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(customParseFormat)

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
    const dates = Object.keys(data)
    
    //console.log('parser date:'+date)
    dates.forEach(date => {
      data[date].forEach(item =>{
        programs.push({
          title: item.ps_episode_title,
          start: parseStart(item, date),
          stop: parseStop(item, date),
          description: item.ps_episode_description,
          icon: parseIcon(item),
          sub_title: item.subtitle
        })
      })
    })
    //console.log(programs)
    return programs
  }
}

function parseItems({content}) {
  //console.log(channel)
  if (!content || content == '')
    return []
  
  return  JSON.parse(content)  
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
  let hr = parseInt(item[attribute].split(':')[0])
  let min = parseInt(item[attribute].split(':')[1])
  //let startdate = dayjs(date)
  let isTomorrow = hr > 23
  hr = isTomorrow ? hr-24 : hr
  let dt = dayjs.tz(date+ ' '+hr+':'+min, 'Asia/Tokyo')
  dt = isTomorrow? dt.add(1,'day'):dt

  return dt
  //return dayjs(startdate + 'T'+item[attribute]+':00+09:00')
}
