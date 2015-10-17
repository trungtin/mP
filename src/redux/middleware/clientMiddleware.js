export default function clientMiddleware(client) {
  return ({dispatch, getState}) => {
    return next => action => {
      if (typeof action === 'function') {
        return action(dispatch, getState);
      }

      const { promise, types, postprocess, ...rest } = action;
      if (!promise) {
        return next(action);
      }
      const [REQUEST, SUCCESS, FAILURE] = types;
      next({...rest, type: REQUEST});
      return promise(client).then(result => {
        if (postprocess && typeof postprocess === 'function') {
          return postprocess(result);
        }
        return result;
      }).then(
        (result) => next({...rest, result, type: SUCCESS})
      ).catch((error)=> {
        console.error('MIDDLEWARE ERROR:', error);
        next({...rest, error, type: FAILURE});
      });
    };
  };
}
