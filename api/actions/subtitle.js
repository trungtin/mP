import http from 'http'
import { movie as Movie, movie_url as MovieUrl } from 'Model'
import fs from 'fs'
import path from 'path'
import cheerio from 'cheerio'
import Promise from 'bluebird'
import qs from 'querystring'

export default function subtitle (req, params) {
  if (params && params.length !== 0) {
    if (params.indexOf('getall') !== -1) {
      return getAllSubtitles(params[0], params[1] !== 'getall' ? params[1] : params[2])
    }
    return getSubtitle(params[0], params[1])
  } else {
    return Promise.reject('Must specific video id')
  }
}

export function getSubtitle (videoId) {
  Promise.resolve('later')
}

export function getAllSubtitles (videoId) {
  console.log('0')
  return getSubtitlePages('Avengers: Age of ultron', 2015, 'vietnamese')
}

export function getSubtitlePages (title, year, language) {
  console.log('a')
  return Promise.any([requestPromise('subscene.com', '/subtitles/' + title.replace(/\:\s/g, '-').replace(/\s/g, '-') + '/' + language).then(result => {
    console.log('aa')
    console.dir(result)
    let $ = cheerio.load(result)
    let urlList = $.find('table tbody tr').map((i, el) => {
      console.log('aaa')
      let object = {}
      $(el).find('a').each((ia, ela) => {
        if ($(ela).attr('href').match(/subtitles/)) {
          object.url = $(ela).attr('href')
        } else if ($(ela).attr('href').match(/\/u\//)) {
          object.owner = $(ela).text()
        }
        return false
      })
      object.comment = $(el).find('td').last().firstChild.text()
      return object
    })
    return urlList
  })])
}

function requestPromise (host, path) {
  console.log(host, path)
  return new Promise((resolve, reject) => {
    http.get({
      host: host,
      path: path
    }, res => {
      let body
      res.on('data', chunk => {
        body += chunk
      })
      res.on('end', () => {
        console.log(body);resolve(body)
      })
    }).on('error', err => {
      reject(err)
    })
  })
}

export function downloadPromise (url, dir, fileName) {
  return new Promise((resolve, reject) => {
    let dest = path.join(dir, fileName)
    let file = fs.createWriteStream(dest)
    http.get((url, response) => {
      response.pipe(file)
      file.on('finish', () => {
        file.close(() => {
          resolve(fileName)
        })
      })
    }).on('error', err => {
      fs.unlink(dest)
      reject(err.message)
    })
  })
}
