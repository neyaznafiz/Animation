const gc = document.querySelector('#game_console')
const ga = document.querySelector('#game_alert')
const gc_loc = gc.getBoundingClientRect()
const pl = document.querySelector('#player')
var cols = 48 // multiple of 16
var rows = 27 // multiple of 9
const tile_size = gc_loc.width*(100/cols/100)
document.body.style.setProperty('--tile-line-height', tile_size+'px')

pl.style.top = (tile_size*13) + 'px'
pl.style.left = (tile_size*27) + 'px'
var pl_loc = pl.getBoundingClientRect() 
gc.style.width = '1000px'
gc.style.height = tile_size*rows+'px'

var gravity = 8,
    kd,
    x = pl_loc.left,
    x_speed = 5,
    pb_y = 0,
    score = 0,
    rot = 0,
    data_p = 0,
    bonus = 1,
    dead = false,
    kd_list = [],
    d = {},
    highjump = false,
    timer = 0;

const level = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
               0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,8,8,0,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,0,
               0,1,'B',1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,8,8,8,1,9,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,0,
               0,1,0,1,1,1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,0,0,1,1,1,0,8,8,0,0,0,1,1,1,1,1,1,1,0,0,1,1,1,0,0,1,1,0,
               0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,8,8,0,0,0,1,1,1,1,1,1,1,1,0,0,1,1,0,1,1,1,0,
               0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,8,8,0,0,0,1,1,1,1,1,1,1,1,0,1,1,1,0,1,1,1,0,
               0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,8,8,0,0,0,1,1,1,1,1,1,1,1,0,1,1,0,0,1,1,0,0,
               0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,0,8,8,0,0,0,0,0,0,1,1,1,1,1,0,1,1,1,0,1,1,1,0,
               0,1,1,1,0,2,2,0,0,0,2,2,0,0,0,2,2,0,0,2,2,0,1,1,1,0,8,8,0,0,0,1,1,1,1,1,0,0,0,0,0,1,1,0,1,1,1,0,
               0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,1,1,0,0,1,1,0,
               0,'BD','BD',0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,0,0,1,0,1,1,1,0,
               0,1,1,1,0,1,'G',1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,0,
               0,0,1,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,0,2,2,0,1,1,1,1,1,1,0,'PD','PD',0,0,
               0,1,1,1,0,0,0,0,0,2,2,0,2,2,0,2,2,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,
               0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,0,1,1,1,1,1,1,1,'GD',1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,
               0,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,'GD',1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,
               0,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,'BD',0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,1,1,0,
               0,0,1,1,0,0,0,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,
               0,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,'P',1,0,1,1,0,1,1,1,1,'H',1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,
               0,1,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1,0,0,1,1,1,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,
               0,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,
               0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,0,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,
               0,0,1,1,1,1,1,1,1,0,1,1,1,0,0,0,1,1,1,1,1,1,1,0,0,1,0,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,
               0,0,0,1,1,1,1,0,1,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,1,1,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,0,
               0,0,0,1,0,1,1,0,2,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,
               0,0,0,2,0,0,2,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,2,2,0,2,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,
               0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]

function buildGame(){
  for(var i=0;i<cols*rows;i++) {
    var d = document.createElement('div')
    d.className = 'tile'
    if(level[i] == 0) {
      // d.className = Math.random() > .2 ? 'tile ground cube' : 'tile ground stripes'   
      d.className = 'tile ground' 
      // d.style.background = 'dimgray'
    }
    if(level[i] == 2) {
      d.className = 'tile lava'      
    }
    if(level[i] == 8) {
      // d.className = Math.random() > .2 ? 'tile rocket cube' : 'tile rocket stripes'
      d.className = 'tile rocket'
      d.style.background = 'dimgray'
    }
    if(level[i] == 9) {
      d.className = 'tile finalgoal'
      d.style.background = 'goldenrod'
      d.style.borderRadius = '50%'
    }
    if(level[i] == 'B') {
      d.className = 'tile key blue'
      d.style.background = 'dodgerblue'
      d.style.borderRadius = '50%'      
    }
    if(level[i] == 'BD') {
      d.className = 'tile door ground blue'
      d.style.background = 'linear-gradient(to bottom, transparent 20%, dodgerblue 20%, dodgerblue 40%, transparent 40%, transparent 60%, dodgerblue 60%, dodgerblue 80%, transparent 80%'      
    }
    if(level[i] == 'G') {
      d.className = 'tile key green'
      d.style.background = 'limegreen'
      d.style.borderRadius = '50%'      
    }
    if(level[i] == 'GD') {
      d.className = 'tile door ground green'
      d.style.background = 'linear-gradient(to right, transparent 20%, limegreen 20%, limegreen 40%, transparent 40%, transparent 60%, limegreen 60%, limegreen 80%, transparent 80%'      
    }
    if(level[i] == 'P') {
      d.className = 'tile key purple'
      d.style.background = 'MediumOrchid'
      d.style.borderRadius = '50%'      
    }
    if(level[i] == 'PD') {
      d.className = 'tile door ground purple'
      d.style.background = 'linear-gradient(to bottom, transparent 20%, MediumOrchid 20%, MediumOrchid 40%, transparent 40%, transparent 60%, MediumOrchid 60%, MediumOrchid 80%, transparent 80%'      
    }
    if(level[i] == 'H') {
      d.className = 'tile highjump'
      // d.style.background = 'goldenrod'
    }
    d.setAttribute('grid_loc', [i % cols,Math.floor(i/cols)])
    d.style.width = tile_size + 'px'
    d.style.height = tile_size + 'px'
    d.style.position = 'absolute'
    // d.innerHTML = i
    // d.style.outline = '1px dotted gray'
    d.style.left = (i % cols)*tile_size + 'px'
    d.style.top = Math.floor(i/cols)*tile_size + 'px'

    gc.appendChild(d)
  }  

}

buildGame()

function updatePlayer() {
  var pl_loc = pl.getBoundingClientRect()  
  var pl_center = document.elementFromPoint(pl_loc.x + (tile_size*.5), pl_loc.y + (tile_size*.5))
  var pl_xy1 = document.elementFromPoint(pl_loc.x + (pl_loc.width*.25), pl_loc.y + pl_loc.height + (gravity*.5))
  var pl_xy2 = document.elementFromPoint(pl_loc.x + (pl_loc.width*.75), pl_loc.y + pl_loc.height + (gravity*.5))
  var pl_xy3 = document.elementFromPoint(pl_loc.x - (x_speed*.5), pl_loc.y + (pl_loc.height*.5))
  var pl_xy4 = document.elementFromPoint(pl_loc.x + pl_loc.width + (x_speed*.5), pl_loc.y + (pl_loc.height*.5))
  var pl_xy5 = document.elementFromPoint(pl_loc.x + (pl_loc.width*.5), pl_loc.y - (gravity*.5))
  // var pl_xy6 = document.elementFromPoint(pl_loc.x + (pl_loc.width*.5), pl_loc.y + pl_loc.height)

  // console.log(pl_center)

  function endGame() {
    alert('you died')
  }

  //if dead stop, else update player and everything else
  if(!pl_xy1 || !pl_xy2 || dead) {
    endGame()
  } else { 

    // set player top   
    // if player on ground set new top
    if((pl_xy1.classList.contains('ground') ||
        pl_xy2.classList.contains('ground'))) {
      gravity = 0
    } else {
      if(gravity < 8) {
        gravity += .51
      } else {
        gravity = 8
      }      
    }
    pl.style.top = pl_loc.top - gc_loc.top + gravity + 'px'
    // console.log(gravity)    

    // add jump-force
    if(d[38] && gravity == 0) {
      gravity = -8
      if(highjump) {
        gravity = -9
      }
    } 
    if(pl_xy5.classList.contains('ground')) {
      gravity = 5
    }
    pl.style.top = pl_loc.top - gc_loc.top + gravity + 'px'
    // track left/right movement
    if(d[37] && x > gc_loc.x) {
      if(!pl_xy3.classList.contains('ground')) {
        x -= x_speed
        pl.className = ''
        pl.classList.add('goleft')
      } else {
        pl.className = ''
      }
    }
    if(d[39] && x + pl_loc.width < gc_loc.x + gc_loc.width) {
      if(!pl_xy4.classList.contains('ground')) {
        x += x_speed
        pl.className = ''
        pl.classList.add('goright')
      } else {
        pl.className = ''
      }
    }  
    pl.style.left = x - gc_loc.left + 'px'

    if(pl_center.classList.contains('lava')) {
      // console.log('lava')
      pl.style.top = (tile_size*13) + 'px'
      pl.style.left = (tile_size*27) + 'px'
      pl_loc = pl.getBoundingClientRect()
      x = pl_loc.left
    }
    if(pl_center.classList.contains('highjump')) {
      // console.log('lava')
      highjump = true
      pl_center.style.display = 'none'
      ga.innerHTML = 'You got high jump!'
      ga.style.opacity = '1'
      setTimeout(function(){
        ga.style.opacity = '0'
      },4000)      
    }
    if(pl_center.classList.contains('key')) {
      pl_center.style.display = 'none'      
      var clr = pl_center.classList[2]
      ga.innerHTML = 'You got the '+clr+' key!'
      ga.style.opacity = '1'
      setTimeout(function(){
        ga.style.opacity = '0'
      },4000)
      var doors = document.querySelectorAll('.door')
      doors.forEach(function(elm){
        if(elm.classList[3] == clr) {
          elm.classList.remove('ground')          
        }
      })            
    }
    if(pl_center.classList.contains('door')) {
      pl_center.style.display = 'none'
    }
    if(pl_center.classList.contains('finalgoal')) {
      pl_center.style.display = 'none'
      var clr = pl_center.style.background
      var doors = document.querySelectorAll('.rocket')
      doors.forEach(function(elm){
        elm.style.display = 'none'
      })

      setTimeout(function(){
        pl.style.opacity = '0'
        document.body.style.setProperty('--pl-clr', 'transparent')
        document.querySelector('#big_rocket').classList.add('adios')
        setTimeout(function(){
          var time = (timer/30)
          ga.innerHTML = '<h2>YOU WIN!</h2>'+time.toFixed(2)+' seconds'
          ga.style.opacity = '1'
          // setTimeout(function(){
          //   ga.style.opacity = '0'
          // },4000)          
        }, 2250)
      }, 250)      
    }

    timer++
    setTimeout(updatePlayer, 1000/30)
  }  
}

updatePlayer()

window.focus()

ga.innerHTML = 'Arrow keys to move and jump'
ga.style.opacity = '1'
setTimeout(function(){
  ga.style.opacity = '0'
},4000)

window.addEventListener('keydown', function(e) { d[e.which] = true; })
window.addEventListener('keyup', function(e) {   
  d[e.which] = false; 
  pl.className = ''
})