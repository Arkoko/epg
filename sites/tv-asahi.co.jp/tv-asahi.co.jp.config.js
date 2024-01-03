const dayjs = require('dayjs')
const cheerio = require('cheerio')

module.exports = {
  site: 'tv-asahi.or.jp',
  days: 2,
  lang: 'jp',
  delay: 5000,

  url: function ({ date}) {
    let file = ''
    if(dayjs(date).isAfter(dayjs())){
      file = 'next.html'
    }
    let url_ = `https://www.tv-asahi.co.jp/bangumi/${file}`
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

  parser: function (context, date) {
    const programs = []
    const items = parseItems(context, date)

    items.forEach(item => {
      programs.push({
        title: item.title,
        start: item.startTime, //parseStart(item),
        stop: item.endTime, //parseStop(item),
        description: item.content,
        icon: item.image,
        sub_title: item.subtitle
      })
    })
    //console.log(programs)
    return programs
  }
}

function parseItems({content, date}) {
  //console.log(content)
  const $ = cheerio.load(content)
  const dates = $('#timeTable > tbody > tr:nth-child(1)').find(':scope > td').slice(1)
  const date_programs = $('#timeTable > tbody > tr:nth-child(2)').find(':scope > td').slice(1)//.find('table.new_day')
  let items = []
  $(dates).each((i, date)=>{
    
    const programs = $(date_programs).slice(i,i+1).find('table.new_day')
    console.log($(date).text() + ': '+programs.length)
    let isAm = true, isTomorrow = false
    $(programs).each((i, prog)=>{
      let startTime = getStartTime($(prog).find('span.min').text(), $(date).text())//〜
      
      isTomorrow = !isTomorrow && !isAm && startTime.hour()<12
      isAm = startTime.hour()<12
      startTime = isTomorrow? startTime.add(1, 'day'): startTime

      let item = { 
        startTime: startTime,
        //image: $(prog).find('dd > article > a > figure > img').attr('src'),
        title: $(prog).find('span.prog_name').text(),
        content: $(prog).find('span.expo_org').text()
      }
      items.push(item)
    })
  })
  console.log('items.length: '+items.length)
  let i = items.length-2
  //items[i].endTime = dayjs(items[i].startTime.format('YYYY-MM-DD')).hour(6).minute(0).utcOffset(9)

  // set end time of previous program
  for(let i=0; i<items.length-1; i++){
    items[i].endTime = items[i+1].startTime
  }

  return items
}

function getStartTime(timestr, datestr){
  const delim = '〜'
  let today = dayjs()
  let month = datestr.split('月')[0]
  let day = datestr.split('月')[1].split('日')[0]
  let year = parseInt(today.format('YYYY')) 
  let _date = dayjs(year+'-'+month+'-'+day)
  _date = _date.isBefore(today) ? _date.add(1, 'year'): _date

  let time = timestr.split(delim)[0].split(':')
  return dayjs(_date).add(parseInt(time[0]), 'hours').add(parseInt(time[1]), 'minute').utcOffset(9)
}

