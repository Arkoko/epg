const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
const customParseFormat = require('dayjs/plugin/customParseFormat')

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(customParseFormat)

const cheerio = require('cheerio')

module.exports = {
  site: 'tbs.co.jp',
  days: 2,
  lang: 'jp',
  delay: 5000,

  url: function ({ date}) {
    let file = 'index'
    if(dayjs(date).isAfter(dayjs())){
      file = 'nextweek'
    }

    let url_ = `https://www.tbs.co.jp/tv/${file}.html`
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
        start: getTime(item.startTime),
        stop: getTime(item.endTime),
        description: item.content,
        icon: getImage(item),
        //sub_title: item.subtitle
      })
    })
    //console.log(programs)
    return programs
  }
}

function parseItems({content}) {

  if(!content || content == '')
    return []

  const $ = cheerio.load(content)
  //console.log('cheerio.loaded')
  $('td.empty').remove()
  const programs = $('#pagetop > div.cover > div > div.wrap > table > tbody').find('td').remove('td.empty')
  //console.log('programs filtered: '+programs.length)
  //console.log(channel)
  let items = []
  $(programs).each((i, prog)=>{
    //let startTime = getTime($(prog).find('.m-program-daily-contents-date').html(), date)
    //console.log($(prog).find('div > a > span.starttime').text())
    let item = { 
      startTime: getTime($(prog).find('div > a > span.starttime').text()),
      endTime: getTime($(prog).find('div > a > span.endtime').text()),
      image: $(prog).find('div > a > span.img > img').attr('src'),
      title: $(prog).find('div > a > strong').text(),
      content: $(prog).find('div > a > span.txtA').text()
    }
    items.push(item)
  })
  return items
}
function getImage(item){
  if(!item.image || item.image == '')
    return ''
  return 'https://www.tbs.co.jp/tv/'+item.image
}

function getTime(time){
  return dayjs.tz(time, 'Asia/Tokyo')
}
