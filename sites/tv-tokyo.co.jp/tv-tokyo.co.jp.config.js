const dayjs = require('dayjs')

module.exports = {
  site: 'www3.nhk.or.jp',
  days: 5,
  lang: 'jp',
  delay: 5000,

  url: function ({ date}) {
    let url_ = `https://www.tv-tokyo.co.jp/tbcms/assets/data/${dayjs(date).format('YYYYMMDD')}.json`
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
        description: item.description
        //icon: parseIcon(item),
        //sub_title: item.subtitle
      })
    })
    //console.log(programs)
    return programs
  }
}

function parseItems({content, channel}) {
  //console.log(channel.site_id)
  if(!content || content === '')
    return []
  const data = JSON.parse(content)
  if(!data){
    return []
  }
  let programs = []
  for(let time in data){
    for (let prog in data[time]){
      let program = data[time][prog]
      if(program['channel'] === channel.site_id){
        programs.push(program)
      }
    }
  }
  return programs
}

function parseStart(item) {
  return dayjs(item['sts'])
}

function parseStop(item) {
  return dayjs(item['ets'])
}

