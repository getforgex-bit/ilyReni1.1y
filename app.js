(() => {
  'use strict';
  const $=id=>document.getElementById(id), reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const drawing=makeHeart($('line-heart')),music=$('music');
  // The playback asset is trimmed at 0:57; cues use the original song's timeline.
  const MUSIC_OFFSET=57;
  const songTime=()=>music.currentTime+MUSIC_OFFSET;
  let state='intro',model=null,run=0,resume=false,soundRun=0,soundEnabled=true,heartReady=false,musicUnavailable=false;
  let continueAccepted=false,musicHeld=false,flowersVisible=false,bloomStarted=false,cueFrame=0;
  const wait=ms=>new Promise(resolve=>setTimeout(resolve,reduced?Math.min(ms,180):ms));
  const modelReady=loadHeart3D($('model-heart')).then(value=>model=value).catch(()=>null);
  drawing.still(0);music.volume=.28;
  function setState(value,message){state=value;document.body.dataset.scene=value;$('status').textContent=message;}
  function setSound(on){$('sound').setAttribute('aria-pressed',String(on));$('sound').querySelector('span').textContent=on?'Silenciar música':'Activar música';}
  function revealContinue(){
    if(state!=='transform'||!heartReady||(!musicUnavailable&&songTime()<70))return;
    setState('heart','El corazón está listo. Puedes continuar.');$('continue').hidden=false;$('continue').focus({preventScroll:true});
  }
  function syncCues(){
    revealContinue();
    if(state==='intro')return;
    if(!continueAccepted&&!musicUnavailable&&songTime()>=73.9){
      musicHeld=true;resume=false;music.pause();
    }
    if(continueAccepted&&flowersVisible&&!bloomStarted&&(musicUnavailable||songTime()>=74)){
      bloomStarted=true;bouquet.play();
      const token=run;
      wait(5100).then(()=>{if(token!==run)return;$('ending').hidden=false;$('replay').focus({preventScroll:true});});
    }
  }
  function followMusic(){
    cancelAnimationFrame(cueFrame);
    syncCues();
    if(!music.paused&&!document.hidden)cueFrame=requestAnimationFrame(followMusic);
  }
  music.addEventListener('playing',followMusic);
  music.addEventListener('timeupdate',syncCues);
  music.addEventListener('seeked',syncCues);
  setSound(true);
  function playMusic(restart=false){
    const token=++soundRun;
    if(restart){music.currentTime=0;}
    music.muted=!soundEnabled;
    music.play().then(()=>{if(token===soundRun){musicUnavailable=false;setSound(soundEnabled);}}).catch(error=>{if(token===soundRun&&error.name!=='AbortError'){musicUnavailable=true;$('sound').querySelector('span').textContent='Reintentar música';syncCues();}});
  }
  music.addEventListener('ended',()=>{if(state!=='intro'&&!document.hidden)playMusic(true);});
  $('sound').addEventListener('click',()=>{soundEnabled=!soundEnabled;music.muted=!soundEnabled;setSound(soundEnabled);if(soundEnabled&&state!=='intro'&&music.paused&&!musicHeld)playMusic();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){resume=!music.paused;music.pause();}else if(resume&&!musicHeld){resume=false;playMusic();}});
  music.addEventListener('error',()=>{musicUnavailable=true;setSound(false);$('sound').querySelector('span').textContent='Música no disponible';syncCues();});
  async function begin(){
    if(state!=='intro')return;
    heartReady=false;musicUnavailable=!!music.error;
    continueAccepted=false;musicHeld=false;flowersVisible=false;bloomStarted=false;
    playMusic(true);
    const token=++run;setState('drawing','Un corazón empieza a dibujarse para ti.');$('begin').disabled=true;$('intro').classList.add('leaving');
    await wait(700);$('heart-scene').hidden=false;drawing.play(6500);
    await wait(700);$('intro').hidden=true;
    await wait(5900);if(token!==run)return;
    await Promise.race([modelReady,new Promise(resolve=>setTimeout(resolve,2000))]);
    if(model){$('model-heart').hidden=false;model.play();}else{$('heart-fallback').hidden=false;}
    $('heart-art').classList.add('morph');$('heart-caption').textContent='Y, contigo, encontraron su lugar.';
    setState('transform','El dibujo se convierte en un corazón morado tridimensional.');
    await wait(1800);if(token!==run)return;
    heartReady=true;revealContinue();
  }
  async function travel(){
    if(state!=='heart')return;
    continueAccepted=true;
    setState('travel','Nos acercamos a un lugar lleno de flores.');$('continue').disabled=true;document.body.classList.add('travel');
    const entrance=musicHeld||musicUnavailable?1100:Math.min(1100,Math.max(0,(74-songTime())*1000-100));
    await wait(entrance);$('flowers').hidden=false;bouquet.prepare();flowersVisible=true;
    if(musicHeld||music.paused){musicHeld=false;if(!musicUnavailable)playMusic();}
    syncCues();
    await wait(900);model?.stop();$('heart-scene').hidden=true;document.body.classList.remove('travel');setState('flowers','Un ramo de lirios florece para ti, Reni.');
  }
  $('begin').addEventListener('click',begin);$('continue').addEventListener('click',travel);
  $('heart-art').addEventListener('click',travel);
  $('replay').addEventListener('click',()=>{++soundRun;cancelAnimationFrame(cueFrame);continueAccepted=false;musicHeld=false;flowersVisible=false;bloomStarted=false;music.pause();music.currentTime=0;resume=false;setSound(soundEnabled);});
  $('replay').addEventListener('click',()=>{++run;bouquet.stop();model?.stop();$('flowers').hidden=true;$('ending').hidden=true;$('intro').hidden=false;$('intro').classList.remove('leaving');$('heart-art').classList.remove('morph');$('heart-fallback').hidden=true;$('model-heart').hidden=true;$('continue').hidden=true;$('continue').disabled=false;$('begin').disabled=false;$('heart-caption').innerHTML='Hay sentimientos que toman forma<br>poquito a poquito.';drawing.still(0);setState('intro','Puedes volver a vivir este momento.');$('begin').focus({preventScroll:true});});
})();

