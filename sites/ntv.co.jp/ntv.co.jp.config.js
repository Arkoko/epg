const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
const customParseFormat = require('dayjs/plugin/customParseFormat')

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(customParseFormat)

module.exports = {
  site: 'ntv.co.jp',
  days: 5,
  lang: 'jp',
  delay: 5000,

  url: function () {
    let url_ = `https://www.ntv.co.jp/program/json/program_list.json?_=${dayjs()}`
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
      let startTime = getTime(item, 'start_time')
      let endTime = getTime(item, 'end_time')
      if(endTime.isBefore(startTime)){
        endTime = endTime.add(1, 'day')
      }
      programs.push({
        title: item.program_title,
        start: startTime,
        stop: endTime,
        description: item.program_content,
        //icon: parseIcon(item),
        sub_title: item.program_detail
      })
    })
    
    return programs
  }
}

function parseItems({content, date}) {
  if(!content || content == '')
    return []
  
  const data = JSON.parse(content.substring(1))
  
  if(!data || !Array.isArray(data))
    return []
  let datestr = dayjs(date).format('YYYYMMDD')
  
  return data.filter( a =>{
    return a.broadcast_date === datestr 
  })
  
}

function getTime(item, timestr) {
  let date = item.actual_datetime
  let broadcast_date = date.broadcast_date
  let time = date[timestr]
  return dayjs.tz(broadcast_date+'T'+time, 'Asia/Tokyo')
}
