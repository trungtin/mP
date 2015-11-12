import { saved_page as SP } from 'Model'

export default function page (req, params) {
  if (!(req.user && req.user.id)) {
    return Promise.reject('User must login before save page.')
  }
  let userId = req.user.id
  if (params && params[0]) {
    switch (params[0]) {
      case 'save':
        let {pageUrl, title} = req.body
        return save(userId, pageUrl, title)
      case 'load':
        let {limit, offset} = req.query
        return load(userId, limit, offset)
      default:
        return Promise.reject('Action not accepted!')
    }
  }
}

function save (userId, pageUrl, title) {
  return SP.upsert({page_url: pageUrl, user_id: userId, title}).then(() => load(userId))
}

function load (userId, limit = 20, offset = 0) {
  return SP.findAll({
    where: {
      user_id: userId
    },
    limit,
    offset,
    order: [
      ['updated_at', 'DESC']
    ]})
}
