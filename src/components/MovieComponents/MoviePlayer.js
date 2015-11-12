import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';

// function handleSelectCaption(evt) {
//   let files = evt.target.files;
  
//   for (let i=0, file=files[i]; i<files.length; i++) {
//     if (!file.name.match(/[srt, vtt]$/i)) {
//       return;
//     }
    
//     let reader = new FileReader();
    
//     reader.onload = function(e) {
//       let track = document.createElement('track');
//       track.kind = 'captions';
//       track.label = 'Custom';
//       track.srclang = 'vi';
//       track.src = e.target.result;
//       track.addEventListener('load', () => {
//         this.mode = 'showing';
//       });
//       window.document.getElementById('movie-player_html5_api').appendChild(track);
//     };
    
//     reader.readAsDataURL(file);
//   }
// }

function pushCaptionSelectMenuItem(videojs, player, captionsButton, thisComponent) {
  var MenuItem = videojs.getComponent('MenuItem');
  
  class CaptionSelectMenuItem extends MenuItem {
    constructor(_player, options) {
      super(_player, options);
      this.on('click', this.onClick);
      this.on('touchStart', this.onClick);
    }
    onClick() {
      ReactDOM.findDOMNode(thisComponent.refs.selectCaptionInput).click();
    }
  }
  let newMenuItem = new CaptionSelectMenuItem(player, {
    kind: 'captions',
    label: 'Select caption...',
    selected: false /* ,
    innerHTML: '<li.vjs-menu-item>' + ('New') + '</li>' */
  });
  captionsButton.menu.contentEl_.appendChild(newMenuItem.el());
  return newMenuItem;
}

export default class MovieDisplayer extends Component {
  static propTypes = {
    playUrls: PropTypes.array.isRequired
  }
  componentDidMount() {
    if (window) { 
      const srcArr = this.props.playUrls.map((url, index) => {
        // return '<source src="' + url + '" type="video/mp4" res="' + ['480', '720', '1080'][index] + '" key=' + index + ' />';
        return {
          src: url,
          type: 'video/mp4',
          res: ['480', '720', '1080'][index],
          label: ['480', '720', '1080'][index]
        };
      });
      let wrapper = window.document.createElement('div');
      wrapper.innerHTML = '<video id="movie-player" ref="videoTarget" class="video-js vjs-default-skin" controls autoPlay preload="auto" width="1280" height="720" style="margin: 0 auto; box-shadow: 0px 0px 10px #000;">'
        // + srcArr.join('')
        // + '<track kind="captions" src="/api/subtitles/test-en.vtt" srclang="en" label="English" default>'
        + '<p class="vjs-no-js">To view this video please enable JavaScript, and consider upgrading to a web browser that <a href="http://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a></p></video>';
      let video = wrapper.firstChild;
      this.refs.target.appendChild(video);
      let player = window.videojs(video, {plugins: {controls: true, videoJsResolutionSwitcher: {default: 'high', dynamicLabel: true}}}, () => {
        player.controlBar.captionsButton.el_.classList.remove('vjs-hidden');
        player.updateSrc(srcArr);
        
        let captionsButton = player.controlBar.captionsButton;
        pushCaptionSelectMenuItem(window.videojs, player, captionsButton, this);
        
        player.on('error', err => {
          if (player.error().code === 2) {
            let currentTime = player.currentTime();
            err.stopImmediatePropagation();
            player.load();
            player.currentTime(currentTime);
            player.play();
          }
        });
        
        player.textTracks().addEventListener('addtrack', () => {
          pushCaptionSelectMenuItem(window.videojs, player, captionsButton, this);
          player.textTracks()[player.textTracks().length - 1].mode = 'showing';
        }, false);
      });
      
      // window.document.getElementById('select-caption-input').addEventListener('change', handleSelectCaption, false);
      window.document.getElementById('select-caption-input').addEventListener('change', (evt) => {
        let files = evt.target.files;
  
        let addElement = (src) => {
          player.controlBar.captionsButton.items.map(item => {
            item.track.mode = 'disabled';
          });
          player.addRemoteTextTrack({
            kind: 'captions',
            language: 'vi',
            label: 'Custom',
            src: src
          });
        };
  
        for (let i = 0, file = files[i]; i < files.length; i++) {
          if (!file.name.match(/[srt, vtt]$/i)) {
            return;
          } else if (file.name.match(/srt$/i)) {
            let readSrt = new FileReader();
            readSrt.onload = e => {
              let vttData = 'WEBVTT FILE\r\n\r\n' + e.target.result.replace(/\{\\([ibu])\}/g, '</$1>')
              .replace(/\{\\([ibu])1\}/g, '<$1>')
              .replace(/\{([ibu])\}/g, '<$1>')
              .replace(/\{\/([ibu])\}/g, '</$1>')
              .replace(/(\d\d:\d\d:\d\d),(\d\d\d)/g, '$1.$2') + '\r\n\r\n';
              
              addElement('data:;base64,' + window.btoa(unescape(encodeURIComponent(vttData))));
            };
            readSrt.readAsText(file);
          } else {
            let reader = new FileReader();
            
            reader.onload = e => addElement(e.target.result);
            reader.readAsDataURL(file);
          }
        }
      }, false);
      
      this.forceUpdate();
    }
  }
  render() {
    return (
      <div ref="target" className={require('./MoviePlayer.scss')['video-player']}>
        <input id="select-caption-input" type="file" style={{display: 'none'}} ref="selectCaptionInput" accept=".srt, .vtt"/>
      </div>
    );
  }
}
