var ffmpeg = require('fluent-ffmpeg');
var {exec} = require('child_process');

exports.main =async(file)=>{
    // ffmpeg.ffprobe(file,function(err, metadata) {
    //   var meta=metadata.format.tags['com.apple.quicktime.model'];  
    //   console.log("meta",metadata);
    //   // return meta;  
    // });
    // exec('ffmpeg -i mark.png -vf "scale=540/10:500/10" output_2400x2400.png');
    exec('ffmpeg -i "E:/Workspace/troo/backend/public/1.flv" -i "E:/Workspace/troo/backend/public/output_2400x2400.png" \
    -filter_complex "overlay=x=(main_w)/10:y=(main_h)/2" "E:/Workspace/troo/backend/public/2.MOV" -vf "scale=400:300"', (err, stdout, stderr) => {
        if (err) {
            console.log(err);
          return;
        }
      });
  }