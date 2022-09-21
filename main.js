// main.js file for Lab 1 of Computational Sound
// Madison Lee
// UNI: mkl2166

var pics = ['./images/Scene-1.png', 
'./images/Scene-2.png', 
'./images/Scene-3.png', 
'./images/Scene-4.png', 
'./images/Scene-5.png',
'./images/Scene-6.png', 
'./images/Scene-7.png', 
'./images/Scene-8.png', 
'./images/Scene-9.png', 
'./images/Scene-10.png']

// execute once open window
document.addEventListener("DOMContentLoaded", function(event) {
  var currentFrame = 0
  var waveform = 'sine'
  var waves = document.getElementById("select_wave").waves

  // to shift b/t different waves
  for (var i = 0; i < waves.length; i++){
    waves[i].onclick= function(){
      waveform = this.value;
    }
  }

  // create audio context
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();    // set up audio ctx

  const keyboardFrequencyMap = {
    '90': 261.625565300598634,  //Z - C
    '83': 277.182630976872096, //S - C#
    '88': 293.664767917407560,  //X - D
    '68': 311.126983722080910, //D - D#
    '67': 329.627556912869929,  //C - E
    '86': 349.228231433003884,  //V - F
    '71': 369.994422711634398, //G - F#
    '66': 391.995435981749294,  //B - G
    '72': 415.304697579945138, //H - G#
    '78': 440.000000000000000,  //N - A
    '74': 466.163761518089916, //J - A#
    '77': 493.883301256124111,  //M - B
    '81': 523.251130601197269,  //Q - C
    '50': 554.365261953744192, //2 - C#
    '87': 587.329535834815120,  //W - D
    '51': 622.253967444161821, //3 - D#
    '69': 659.255113825739859,  //E - E
    '82': 698.456462866007768,  //R - F
    '53': 739.988845423268797, //5 - F#
    '84': 783.990871963498588,  //T - G
    '54': 830.609395159890277, //6 - G#
    '89': 880.000000000000000,  //Y - A
    '55': 932.327523036179832, //7 - A#
    '85': 987.766602512248223,  //U - B
  }

  // add listeners to the keys -> to add and remove activeOscillators
  window.addEventListener('keydown', keyDown, false);
  window.addEventListener('keyup', keyUp, false);

  var activeOscillators = {}    // produce sound
  var gainNodes = {}            // volume knob

  // press down on keyboard event
  function keyDown(event) {
      const key = (event.detail || event.which).toString();   // get specific key pressed down
      if (keyboardFrequencyMap[key] && !activeOscillators[key]) {
        playNote(key);
        setTimeout(changeFrame, 90);      // initiate changing imgs
      }
  }

  // starts the sound - start an oscillator, set the desired properties, and connect the new oscillator to the the audioCtx.destination
  function playNote(key) {
    const osc = audioCtx.createOscillator();
    osc.frequency.setValueAtTime(keyboardFrequencyMap[key], audioCtx.currentTime)
    osc.type = waveform
    
    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime)

    // osc.connect(gainNode).connect(waveShaper).connect(audioCtx.destination);
    osc.connect(gainNode).connect(audioCtx.destination);  // connect osc->gain->destination
    osc.start();

    // reduce gain on all nodes for polyphony
    Object.keys(gainNodes).forEach(function(key) {
      gainNodes[key].gain.setTargetAtTime(0.7 / 2, audioCtx.currentTime, 0.15);
    });
    // decay and sustain
    gainNode.gain.setTargetAtTime(
      0.425 / 2,
      audioCtx.currentTime + 0.15,
      0.15
    );

    // get rid of clicking (start of node)
    gainNode.gain.setTargetAtTime(0.5, audioCtx.currentTime, 0.01);

    activeOscillators[key] = osc;
    gainNodes[key] = gainNode;
  }

  // let go of key event
  function keyUp(event) {
    const key = (event.detail || event.which).toString();
    if (keyboardFrequencyMap[key] && activeOscillators[key]) {
      var val = gainNodes[key].gain.value;
      gainNodes[key].gain.cancelScheduledValues(audioCtx.currentTime)
      gainNodes[key].gain.setValueAtTime(val, audioCtx.currentTime)

      // get rid of clicking (end of node)
      gainNodes[key].gain.exponentialRampToValueAtTime(.0001, audioCtx.currentTime + .1); 
      
      // timeout
      setTimeout(function(){
        activeOscillators[key].stop();
        delete activeOscillators[key];
        delete gainNodes[key];
      }, 70)
    }
  }

  function changeFrame(){
    if (currentFrame == 10) {
      currentFrame = 0
    }
    document.getElementById("pic1").src = pics[currentFrame]; // get gif and set its source to the current frame
    currentFrame++; // incr the current frame by 1
  }

})




