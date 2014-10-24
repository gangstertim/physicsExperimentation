$('#simple-menu').sidr({displace: false});  //initialize sidebar
document.body.className = 'before-game';
var inGame = false;
var par = parent;
var world = null;
var renderer = Physics.renderer('canvas', {
    el: 'viewport', // id of the canvas element
    width: par.innerWidth,
    height: par.innerHeight
});

//capture canvas dimensions
try {
  par && par.innerWidth;
} catch( e ){
  par = window;
}
document.addEventListener('keydown', function( e ){
  if (!inGame && e.keyCode === 90){
    document.body.className = 'in-game';
    inGame = true;
    newGame();
  }
});
window.addEventListener('resize', function(){
    renderer.el.width = par.innerWidth;
    renderer.el.height = par.innerHeight;
});
  
function newGame() { 
  if (world){
    world.destroy();
  }
  world = Physics( init );
};



var init = function init( world, Physics ){
	/************* Parameters ************/
	var bounds = Physics.aabb(0, 0, par.innerWidth, par.innerHeight);
	// var renderer = Physics.renderer('dom', {
 //        el: 'viewport',
 //        width: CANVAS_WIDTH,
 //        height: CANVAS_HEIGHT,
 //        meta: false, // don't display meta data
 //    });
	var colors = ['#1BA1E2', '#A05000', '#339933',
				  '#A2C139', '#D80073', '#F09609',
				  '#E671B8', '#A200FF', '#E51400',
				  '#00ABA9'];
	var dataArray = [ 
		{ 'name': 'tom',
		  'dist': 100,
		  'group': 1 }, 
		{ 'name': 'jane',
		  'dist': 200,
		  'group': 1 },
		{ 'name': 'sally',
		  'dist': 150,
		  'group': 2 },
		{ 'name': 'buttfucker',
		  'dist': 150,
		  'group': 3 },
		{ 'name': 'joe',
		  'dist': 275,
		  'group': 2 }
	];
	// subscribe to ticker to advance the simulation
	Physics.util.ticker.on(function( time, dt ){
    	world.step( time );
	});
	Physics.util.ticker.start();


	/************ Bodies ****************/
	var nodes = [];
	$(dataArray).each(function(i, el){
		var dNode = Physics.body('circle', {
			x: 100*i,
			y: 100,
			radius: 25,
			vx: el.dist/5000,
			styles: {
				fillStyle: colors[el.group]
			},
			dist: el.dist
		});
		dNode.view = new Image();
		dNode.view.src = 'images/' + i + '.png';
		nodes.push(dNode);
	});
	var userNode = Physics.body('circle', {
		x: par.innerWidth/2,
		y: par.innerHeight/2,
		radius: 50,
		treatment: "static",
		styles: {
			fillStyle: colors[5]
		}
	});
	userNode.view = new Image();
  userNode.view.src = 'images/userNode.png';

	/*************** Behaviors *************/
	var edgeCollision = Physics.behavior('edge-collision-detection', {
	    aabb: bounds,
	    restitution: 0.8
	});
	var bodyImpulseResponse = Physics.behavior('body-impulse-response');
	var bodyCollisionDetection = Physics.behavior('body-collision-detection');
	var attractor = Physics.behavior('attractor', {
		pos: {'x': par.innerWidth/2, 'y': par.innerHeight/2},
		strength: 5,
		max: false, //infinite
		min: 100
	});
	//handles distance contraints
	var verletConstraints = Physics.behavior('verlet-constraints', {
        iterations: 10
    });
    var interactions = Physics.behavior('interactive', { el: renderer.el });
    
    $(nodes).each(function(i, node) {
    	verletConstraints.distanceConstraint( userNode, node, 1, node.dist );
    });

	/*************** Populate world *******/
	bodyImpulseResponse.applyTo( nodes );
	attractor.applyTo( nodes );
	interactions.applyTo( nodes );
	//world.add( bodyImpulseResponse );
	world.add( attractor );
	world.add( interactions );
	//world.add( edgeCollision );
	world.add( bodyCollisionDetection );
	world.add( Physics.behavior('sweep-prune'));
	world.add( verletConstraints );
	
	world.add( userNode );
	for (node in nodes) {
		world.add( nodes[node] );
	}

	world.add( renderer );
	world.on('step', function(){
    	world.render();
	});
};
