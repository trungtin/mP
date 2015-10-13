import React, {Component, PropTypes} from 'react';

export default class MovieDisplayer extends Component {
  static propTypes = {
    movie: PropTypes.object.isRequired
  }
  render() {
    // const {movie} = this.props;
    const movie = {url: 'https://r2---sn-a5m7zu7r.googlevideo.com/videoplayback?id=58d9bfd6deed9ede&itag=22&source=picasa&begin=0&requiressl=yes&pl=20&lmt=1444326051196611&mime=video/mp4&ip=115.72.100.209&ipbits=0&expire=1444362622&sparams=expire,id,ip,ipbits,itag,lmt,mime,mm,mn,ms,mv,nh,pl,requiressl,source&signature=466553B14612438E9F77DB34899DC842522B09FB.77BE58BAD0E2F10B3A0795E39329EE728B39968A&key=cms1&redirect_counter=1&req_id=59e847866671a3ee&cms_redirect=yes&mm=26&mn=sn-a5m7zu7r&ms=tsu&mt=1444333777&mv=m'};
    return (
      <video id="MY_VIDEO_1" className="video-js vjs-default-skin" controls autoPlay preload="auto" width={1280} height={720} poster="MY_VIDEO_POSTER.jpg" data-setup="{}">
        <source src={movie.url} type="video/mp4" />
        <p className="vjs-no-js">To view this video please enable JavaScript, and consider upgrading to a web browser that <a href="http://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a></p>
      </video>
    );
  }
}
