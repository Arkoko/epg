const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
const customParseFormat = require('dayjs/plugin/customParseFormat')

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(customParseFormat)

const cheerio = require('cheerio')

module.exports = {
  site: 'tv-asahi.or.jp',
  days: 2,
  lang: 'jp',
  delay: 5000,

  url: function ({
    date
  }) {
    let file = ''
    if (dayjs(date).isAfter(dayjs())) {
      file = 'next.html'
    }
    let url_ = `https://www.tv-asahi.co.jp/bangumi/${file}`
    return url_
  },

  request: {
    method: 'GET',
    timeout: 5000,
    cache: {
      ttl: 60 * 1000
    },
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36'
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

function parseItems({
  content,
  date
}) {
  
  const $ = cheerio.load(content)
  const dates = $('#timeTable > tbody > tr:nth-child(1)').find(':scope > td').slice(1)
  const date_programs = $('#timeTable > tbody > tr:nth-child(2)').find(':scope > td').slice(1) //.find('table.new_day')
  let items = []
  $(dates).each((i, date) => {

    const programs = $(date_programs).slice(i, i + 1).find('table.new_day')
    let isAm = true, isTomorrow = false
    $(programs).each((i, prog) => {
      if($(prog).attr('height') == '0'){
        return
      }
      let startTime = getStartTime($(prog).find('span.min').text(), $(date).text()) //〜
      
      isTomorrow = isTomorrow? isTomorrow: !isAm && startTime.hour() < 12
      isAm = startTime.hour() < 12
      startTime = isTomorrow ? startTime.add(1, 'day') : startTime
      //console.log(startTime.format()+ ': '+removeNewLine($(prog).find('span.prog_name').text()))
      let item = {
        startTime: startTime,
        //image: $(prog).find('dd > article > a > figure > img').attr('src'),
        title: $(prog).find('span.prog_name').text(),
        content: $(prog).find('span.expo_org').text()
      }
      items.push(item)
    })
  })
  //console.log('items.length: ' + items.length)
  let i = items.length - 2

  // set end time of previous program
  for (let i = 0; i < items.length - 1; i++) {
    if(items[i].endTime === items[i + 1].startTime){
      continue
    }
    items[i].endTime = items[i + 1].startTime
  }

  return items
}

function getStartTime(timestr, datestr) {
  const delim = '〜'
  let today = dayjs.tz(new Date(), 'Asia/Tokyo')
  let month = datestr.split('月')[0]
  let day = datestr.split('月')[1].split('日')[0]
  day = (day.length == 1? '0':'')+ day
  month = (month.length == 1? '0':'')+ month
  
  let year = parseInt(today.format('YYYY'))
  year += parseInt(month) < parseInt(today.format('MM')) ? 1:0
  let startstr = removeNewLine(year + '-' + month + '-' + day + ' '+ timestr.split(delim)[0])
  //console.log(startstr)
  let _date = dayjs.tz(startstr, 'Asia/Tokyo')
  
  //let time = timestr.split(delim)[0].split(':')
  return _date//.add(parseInt(time[0]), 'hours').add(parseInt(time[1]), 'minute')
}

function removeNewLine(str){
  return str.replace(/(\r\n|\n|\r)/gm, '')
}