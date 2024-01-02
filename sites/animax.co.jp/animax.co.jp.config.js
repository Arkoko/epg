const dayjs = require('dayjs')
const cheerio = require('cheerio')

module.exports = {
  site: 'www3.nhk.or.jp',
  days: 5,
  lang: 'jp',
  delay: 5000,

  url: function ({ date}) {
    let url_ = `https://www.animax.co.jp/programs/schedule_daily?date=${dayjs(date).format('YYYY-MM-DD')}`
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
      //if(dayjs(item.startTime).isAfter(item.endTime)){
      //  console.log(item.startTime + ' - '+ item.endTime +' | '+ item.content)
      //  if(dayjs(item.startTime).isSame(item.endTime, 'day')){
      //    item.endTime = item.endTime.add(1, 'day')
      //  }else{ //if(dayjs(item.startTime).isBefore(item.endTime, 'day')){
      //    item.endTime = item.endTime.add(1, 'year')
      //  }
      //}
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
  const programs = $('.m-program-daily-contents')
  let items = []
  $(programs).each((i, prog)=>{
    let startTime = getStartTime($(prog).find('.m-program-daily-contents-date').html(), date)
    let item = { 
      startTime: startTime,
      image: $(prog).find('dd > article > a > figure > img').attr('src'),
      title: $(prog).find('dd > article > a > div > h3').text(),
      content: $(prog).find('dd > article > a > div > dl').text()
    }
    items.push(item)
  })

  let i = items.length-1
  items[i].endTime = dayjs(items[i].startTime).set('hour', 6).set('minute', 0)
  while(--i>=0){
    items[i].endTime = items[i+1].startTime
  }

  return items
}

function getStartTime(str, date){
  let dt = str.split('<br>')
  let month = dt[0].split('月')[0]
  let day = dt[0].split('月')[1].split('日')[0]
  let year = parseInt(date.format('YYYY')) 
  let _date = dayjs(year+'-'+month+'-'+day)
  year += parseInt(month) < parseInt(date.format('MM')) ? 1:0
  let dt1 = dt[1].replace(/(\r\n|\n|\r)/gm, '')
  let time = dt1.split(':')
  //dt1 = dt1.length == 5? dt1:'0'+dt1
  //let datestr = (year + '-' + month + '-' + day + 'T' + dt1 + ':00+09:00').replace(/(\r\n|\n|\r)/gm, '')
  //console.log(_date.toString()+' T '+ time)
  return dayjs(_date).add(parseInt(time[0]), 'hours').add(parseInt(time[1]), 'minute').utcOffset(9)
}

